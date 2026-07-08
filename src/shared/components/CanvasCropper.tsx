import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Typography } from './Typography';
import { supabase } from '../../core/supabase/client';
import { Upload, ZoomIn, ZoomOut, RotateCcw, ImageIcon } from 'lucide-react';

interface CanvasCropperProps {
  onCrop: (imageUrl: string) => void;
  onCancel?: () => void;
  initialImageSrc?: string;
}

// ── Constantes del editor ──────────────────────────────────────────────────
const CANVAS_SIZE = 380;
const CROP_SIZE   = 280;
const CROP_X      = (CANVAS_SIZE - CROP_SIZE) / 2;
const CROP_Y      = (CANVAS_SIZE - CROP_SIZE) / 2;
const OUTPUT_SIZE = 800; // Resolución final de salida
const MAX_KB      = 220; // Límite de compresión objetivo en KB

// ── Compresión inteligente ─────────────────────────────────────────────────
// WebP comprime mejor que JPEG a igual calidad; si el navegador no soporta
// exportar WebP (toDataURL devuelve PNG en ese caso), cae a JPEG.
function compressCanvas(canvas: HTMLCanvasElement): string {
  const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  const format = supportsWebp ? 'image/webp' : 'image/jpeg';

  let quality = 0.82;
  let result  = canvas.toDataURL(format, quality);

  // Si pesa más del objetivo, reduce quality iterativamente hasta 0.60
  while (result.length > MAX_KB * 1024 * 1.37 && quality > 0.60) {
    quality -= 0.05;
    result   = canvas.toDataURL(format, quality);
  }

  return result;
}

// ── Convierte base64 a File para subir a Storage ───────────────────────────
function base64ToFile(base64: string, filename: string): File {
  const arr   = base64.split(',');
  const mime  = arr[0].match(/:(.*?);/)![1];
  const bstr  = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

// ── Sube imagen a Supabase Storage y retorna URL pública ──────────────────
async function uploadToStorage(base64: string): Promise<string> {
  const mime     = base64.match(/^data:(image\/\w+);/)?.[1] ?? 'image/jpeg';
  const ext      = mime.split('/')[1];
  const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const file     = base64ToFile(base64, filename);

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { contentType: mime, upsert: false });

  if (error) throw new Error(`Storage upload: ${error.message}`);

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);

  return data.publicUrl;
}

// ── Estima el peso en KB de un base64 ─────────────────────────────────────
function estimateKB(base64: string): number {
  return Math.round((base64.length * 3) / 4 / 1024);
}

// ─────────────────────────────────────────────────────────────────────────────

export const CanvasCropper: React.FC<CanvasCropperProps> = ({
  onCrop,
  onCancel,
  initialImageSrc,
}) => {
  const [image,      setImage]      = useState<HTMLImageElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scale,      setScale]      = useState(1.0);
  const [offset,     setOffset]     = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState('');
  const [sizeKB,     setSizeKB]     = useState<number | null>(null);

  const canvasRef   = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragStart   = useRef({ x: 0, y: 0 });
  const originalSrc = useRef<string | undefined>(initialImageSrc); // para detectar si cambió

  // ── Cargar imagen inicial ────────────────────────────────────────────────
  useEffect(() => {
    if (initialImageSrc) loadImage(initialImageSrc);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dibujar canvas principal ─────────────────────────────────────────────
  const draw = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();

    const { drawW, drawH, x, y } = getDrawParams(image, scale, offset);
    ctx.drawImage(image, x, y, drawW, drawH);

    // Máscara oscura con ventana recortada
    ctx.fillStyle = 'rgba(10, 8, 14, 0.72)';
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.rect(CROP_X, CROP_Y, CROP_SIZE, CROP_SIZE);
    ctx.fill('evenodd');

    // Borde dorado del área de recorte
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(CROP_X, CROP_Y, CROP_SIZE, CROP_SIZE);

    // Grid de tercios (regla de los tercios)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth   = 0.5;
    const t = CROP_SIZE / 3;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(CROP_X + t * i, CROP_Y); ctx.lineTo(CROP_X + t * i, CROP_Y + CROP_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CROP_X, CROP_Y + t * i); ctx.lineTo(CROP_X + CROP_SIZE, CROP_Y + t * i); ctx.stroke();
    }

    ctx.restore();

    // Actualizar preview en tiempo real
    updatePreview(image, scale, offset);
  }, [image, scale, offset]);

  useEffect(() => { draw(); }, [draw]);

  // ── Genera el canvas de output (800x800) ─────────────────────────────────
  function buildOutputCanvas(img: HTMLImageElement, s: number, off: { x: number; y: number }): HTMLCanvasElement {
    const out    = document.createElement('canvas');
    out.width    = OUTPUT_SIZE;
    out.height   = OUTPUT_SIZE;
    const ctx    = out.getContext('2d')!;
    const factor = OUTPUT_SIZE / CROP_SIZE;

    const { drawW, drawH } = getDrawParams(img, s, off);

    ctx.fillStyle = '#f9f5ee';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const finalX = (OUTPUT_SIZE / 2) + (off.x) * factor - (drawW * factor) / 2;
    const finalY = (OUTPUT_SIZE / 2) + (off.y) * factor - (drawH * factor) / 2;

    ctx.drawImage(img, finalX, finalY, drawW * factor, drawH * factor);
    return out;
  }

  // ── Preview en tiempo real (miniatura del resultado) ─────────────────────
  function updatePreview(img: HTMLImageElement, s: number, off: { x: number; y: number }) {
    const out  = buildOutputCanvas(img, s, off);
    const b64  = out.toDataURL('image/jpeg', 0.5); // Baja calidad solo para preview visual
    setPreviewSrc(b64);
  }

  // ── Parámetros de dibujo compartidos ─────────────────────────────────────
  function getDrawParams(img: HTMLImageElement, s: number, off: { x: number; y: number }) {
    const ratio = img.width / img.height;
    let baseW   = ratio >= 1 ? CROP_SIZE * ratio : CROP_SIZE;
    let baseH   = ratio >= 1 ? CROP_SIZE : CROP_SIZE / ratio;
    const drawW = baseW * s;
    const drawH = baseH * s;
    const x     = CANVAS_SIZE / 2 + off.x - drawW / 2;
    const y     = CANVAS_SIZE / 2 + off.y - drawH / 2;
    return { drawW, drawH, x, y };
  }

  // ── Carga de imagen ───────────────────────────────────────────────────────
  const loadImage = (src: string) => {
    const img       = new Image();
    img.crossOrigin = 'anonymous';
    img.onload      = () => { setImage(img); setOffset({ x: 0, y: 0 }); setScale(1.0); setSizeKB(null); setUploadErr(''); };
    img.onerror     = () => console.error('Error cargando imagen');
    img.src         = src;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    originalSrc.current = undefined; // marcamos que cambió
    const reader   = new FileReader();
    reader.onload  = (ev) => { if (ev.target?.result) loadImage(ev.target.result as string); };
    reader.readAsDataURL(file);
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      originalSrc.current = undefined;
      const reader  = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) loadImage(ev.target.result as string); };
      reader.readAsDataURL(file);
    }
  };

  // ── Mouse / Touch ─────────────────────────────────────────────────────────
  const handleMouseDown     = (e: React.MouseEvent)  => { if (!image) return; setIsDragging(true); dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }; };
  const handleMouseMove     = (e: React.MouseEvent)  => { if (!isDragging || !image) return; setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); };
  const handleMouseUpLeave  = ()                      => setIsDragging(false);
  const handleTouchStart    = (e: React.TouchEvent)  => { if (!image || e.touches.length !== 1) return; setIsDragging(true); const t = e.touches[0]; dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y }; };
  const handleTouchMove     = (e: React.TouchEvent)  => { if (!isDragging || !image || e.touches.length !== 1) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y }); };
  const handleTouchEnd      = ()                      => setIsDragging(false);

  // ── Confirmar: comprime y sube a Storage ─────────────────────────────────
  const handleConfirm = async () => {
    if (!image) return;
    setUploading(true);
    setUploadErr('');

    try {
      const out   = buildOutputCanvas(image, scale, offset);
      const b64   = compressCanvas(out);
      const kb    = estimateKB(b64);
      setSizeKB(kb);

      // Si la imagen no cambió respecto a la original (URL de Supabase), no re-subimos
      if (originalSrc.current?.startsWith('http') && originalSrc.current === initialImageSrc) {
        onCrop(originalSrc.current);
        return;
      }

      const url = await uploadToStorage(b64);
      onCrop(url);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setUploadErr(`Error al subir la imagen: ${msg}`);
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>

      {!image ? (
        /* ── ZONA DE CARGA ── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...styles.dropZone,
            borderColor: isDragOver ? '#d4af37' : 'rgba(212,175,55,0.3)',
            background:  isDragOver ? 'rgba(212,175,55,0.06)' : 'rgba(15,12,19,0.18)',
          }}
        >
          <ImageIcon size={40} color="#d4af37" style={{ opacity: 0.8, marginBottom: 12 }} />
          <span style={styles.dropTitle}>Arrastrá tu imagen aquí</span>
          <span style={styles.dropSub}>o hacé click para explorar archivos</span>
          <span style={styles.dropFormats}>JPG, PNG, WEBP — La imagen se comprimirá automáticamente</span>
        </div>
      ) : (
        /* ── EDITOR ── */
        <div style={styles.editorLayout}>

          {/* Columna izquierda: Canvas + controles */}
          <div style={styles.editorLeft}>
            <div
              style={{ ...styles.canvasWrap, cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpLeave}
              onMouseLeave={handleMouseUpLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas} />
              <span style={styles.hint}>Arrastrá para encuadrar · Zoom con el slider</span>
            </div>

            {/* Zoom */}
            <div style={styles.zoomRow}>
              <button style={styles.zoomBtn} onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="0.5" max="4.0" step="0.05"
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                style={styles.slider}
              />
              <button style={styles.zoomBtn} onClick={() => setScale(s => Math.min(4.0, s + 0.1))}>
                <ZoomIn size={16} />
              </button>
              <span style={styles.zoomVal}>{Math.round(scale * 100)}%</span>
            </div>

            {/* Acciones */}
            <div style={styles.actions}>
              <button
                style={styles.resetBtn}
                onClick={() => { setImage(null); setScale(1); setOffset({ x: 0, y: 0 }); setPreviewSrc(''); setSizeKB(null); originalSrc.current = undefined; }}
              >
                <RotateCcw size={14} style={{ marginRight: 6 }} /> Cambiar imagen
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                {onCancel && (
                  <button style={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
                )}
                <button
                  style={{ ...styles.confirmBtn, opacity: uploading ? 0.7 : 1 }}
                  onClick={handleConfirm}
                  disabled={uploading}
                >
                  {uploading
                    ? <><span style={styles.spinner} /> Subiendo...</>
                    : <><Upload size={14} style={{ marginRight: 6 }} /> Confirmar</>
                  }
                </button>
              </div>
            </div>

            {uploadErr && <p style={styles.errorMsg}>{uploadErr}</p>}
          </div>

          {/* Columna derecha: Preview del catálogo */}
          <div style={styles.previewCol}>
            <span style={styles.previewLabel}>Vista previa en el catálogo</span>

            {/* Simula la card de producto */}
            <div style={styles.productCardPreview}>
              <div style={styles.previewImgWrap}>
                {previewSrc
                  ? <img src={previewSrc} alt="Preview" style={styles.previewImg} />
                  : <div style={styles.previewPlaceholder} />
                }
              </div>
              <div style={styles.previewInfo}>
                <div style={styles.previewName}>Nombre del producto</div>
                <div style={styles.previewPrice}>$4.200</div>
              </div>
            </div>

            {/* Simula la card de detalle (vista grande) */}
            <span style={{ ...styles.previewLabel, marginTop: 16 }}>Vista previa en detalle</span>
            <div style={styles.detailPreview}>
              {previewSrc
                ? <img src={previewSrc} alt="Detail preview" style={styles.detailImg} />
                : <div style={styles.previewPlaceholder} />
              }
            </div>

            {sizeKB !== null && (
              <span style={styles.sizeInfo}>
                Imagen final: ~{sizeKB} KB {sizeKB < MAX_KB ? '✓ óptima' : '⚠ grande'}
              </span>
            )}

            <div style={styles.previewTips}>
              <p style={styles.tip}>• El recuadro dorado es exactamente lo que se guarda</p>
              <p style={styles.tip}>• La imagen se comprime a máx. {MAX_KB}KB automáticamente</p>
              <p style={styles.tip}>• Se sube a Supabase Storage (no se guarda en la BD)</p>
            </div>
          </div>

        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  );
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  // Drop zone
  dropZone: { width: '100%', maxWidth: 440, height: 220, borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', gap: 6 },
  dropTitle: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' },
  dropSub: { color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' },
  dropFormats: { color: 'rgba(212,175,55,0.6)', fontSize: '0.72rem', marginTop: 4 },

  // Editor layout
  editorLayout: { display: 'flex', gap: 24, width: '100%', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' },
  editorLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 },

  // Canvas
  canvasWrap: { position: 'relative', width: CANVAS_SIZE, height: CANVAS_SIZE, borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  canvas: { display: 'block', width: '100%', height: '100%', backgroundColor: '#100d14' },
  hint: { position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,8,14,0.82)', color: '#d4af37', padding: '5px 12px', borderRadius: 20, fontSize: '0.7rem', pointerEvents: 'none', border: '1px solid rgba(212,175,55,0.25)', whiteSpace: 'nowrap' },

  // Zoom row
  zoomRow: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: CANVAS_SIZE },
  zoomBtn: { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  slider: { flex: 1, accentColor: '#d4af37', cursor: 'pointer', height: 4, borderRadius: 2 },
  zoomVal: { color: '#d4af37', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 'bold', width: 42, textAlign: 'right' },

  // Action buttons
  actions: { display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: CANVAS_SIZE, gap: 10 },
  resetBtn: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem' },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem' },
  confirmBtn: { display: 'flex', alignItems: 'center', background: '#d4af37', border: 'none', color: '#120f15', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(212,175,55,0.3)', transition: 'opacity 0.2s' },
  spinner: { display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(18,15,21,0.3)', borderTopColor: '#120f15', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 8 },
  errorMsg: { color: '#e07060', fontSize: '0.8rem', textAlign: 'center', margin: 0 },

  // Preview column
  previewCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 180 },
  previewLabel: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-sans, sans-serif)' },

  // Product card preview (simula la card del catálogo)
  productCardPreview: { background: 'rgba(250,246,238,0.06)', border: '1px solid rgba(176,142,98,0.2)', borderRadius: 12, overflow: 'hidden', width: 160 },
  previewImgWrap: { width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#1a1620' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  previewPlaceholder: { width: '100%', height: '100%', background: 'rgba(212,175,55,0.06)' },
  previewInfo: { padding: '10px 12px' },
  previewName: { fontSize: '0.78rem', color: 'rgba(245,239,228,0.7)', fontWeight: 600, marginBottom: 4 },
  previewPrice: { fontSize: '0.82rem', color: '#d4af37', fontWeight: 700 },

  // Detail preview (vista grande del producto)
  detailPreview: { width: 160, height: 160, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(176,142,98,0.2)', background: '#1a1620' },
  detailImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },

  sizeInfo: { fontSize: '0.72rem', color: 'rgba(212,175,55,0.7)', marginTop: 4 },
  previewTips: { marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', width: '100%' },
  tip: { fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', margin: '2px 0', lineHeight: 1.5 },
};
