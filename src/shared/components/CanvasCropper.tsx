import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Typography } from './Typography';

interface CanvasCropperProps {
  onCrop: (base64Image: string) => void;
  onCancel?: () => void;
  initialImageSrc?: string;
}

export const CanvasCropper: React.FC<CanvasCropperProps> = ({
  onCrop,
  onCancel,
  initialImageSrc
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dimensiones del visor en pantalla
  const CANVAS_SIZE = 400;
  const CROP_SIZE = 280;
  const cropX = (CANVAS_SIZE - CROP_SIZE) / 2;
  const cropY = (CANVAS_SIZE - CROP_SIZE) / 2;

  // Cargar imagen inicial si existe
  useEffect(() => {
    if (initialImageSrc) {
      loadImage(initialImageSrc);
    }
  }, [initialImageSrc]);

  // Dibujar en el canvas reactivamente
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Guardar contexto
    ctx.save();

    // Calcular dimensiones de dibujado manteniendo el aspect ratio
    const imgRatio = image.width / image.height;
    let drawWidth = CANVAS_SIZE;
    let drawHeight = CANVAS_SIZE;

    if (imgRatio > 1) {
      // Imagen más ancha que alta
      drawHeight = CROP_SIZE;
      drawWidth = CROP_SIZE * imgRatio;
    } else {
      // Imagen más alta que ancha
      drawWidth = CROP_SIZE;
      drawHeight = CROP_SIZE / imgRatio;
    }

    // Dibujar imagen centrada con escala y desplazamiento
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    const x = cx + offset.x - (drawWidth * scale) / 2;
    const y = cy + offset.y - (drawHeight * scale) / 2;

    ctx.drawImage(image, x, y, drawWidth * scale, drawHeight * scale);

    // Dibujar máscara traslúcida con ventana central cuadrada iluminada
    ctx.fillStyle = 'rgba(15, 12, 19, 0.75)'; // Fondo oscuro místico
    ctx.beginPath();
    // Rectángulo externo
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // Cuadrado interno (en dirección opuesta para usar el fill rule 'evenodd')
    ctx.rect(cropX, cropY, CROP_SIZE, CROP_SIZE);
    ctx.fill('evenodd');

    // Dibujar borde dorado fino alrededor del área de recorte
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)'; // Dorado de lujo
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, CROP_SIZE, CROP_SIZE);

    // Restaurar contexto
    ctx.restore();
  }, [image, scale, offset]);

  const loadImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setOffset({ x: 0, y: 0 });
      setScale(1.0);
    };
    img.onerror = () => {
      console.error('Error al cargar la imagen en el cropper.');
    };
    img.src = src;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Eventos de arrastre (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setOffset({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Eventos táctiles (Móviles)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!image || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !image || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.current.x;
    const newY = touch.clientY - dragStart.current.y;
    setOffset({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Confirmar y procesar el recorte
  const handleConfirm = () => {
    if (!image) return;

    // Crear canvas oculto con resolución fija de 800x800 píxeles
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = 800;
    cropCanvas.height = 800;
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) return;

    // Lógica de cálculo en base al viewport de pantalla (escala de 400 a 800 es un factor de 2)
    const factor = 800 / CROP_SIZE; // De tamaño de recorte (280) a tamaño final (800)

    const imgRatio = image.width / image.height;
    let drawWidth = CANVAS_SIZE;
    let drawHeight = CANVAS_SIZE;

    if (imgRatio > 1) {
      drawHeight = CROP_SIZE;
      drawWidth = CROP_SIZE * imgRatio;
    } else {
      drawWidth = CROP_SIZE;
      drawHeight = CROP_SIZE / imgRatio;
    }

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    // Obtener las coordenadas del centro de la imagen relativas al área de recorte (cropX, cropY)
    // Para dibujarlo en el canvas de 800x800 centrado
    cropCtx.fillStyle = '#ffffff';
    cropCtx.fillRect(0, 0, 800, 800); // Relleno blanco para fondos transparentes

    // En el canvas oculto, el centro es (400, 400)
    // Las coordenadas y dimensiones de la imagen escaladas por el factor:
    const scaleFactor = factor * scale;
    const drawW = drawWidth * scaleFactor;
    const drawH = drawHeight * scaleFactor;

    // En pantalla, la imagen está desplazada por offset.x respecto al centro.
    // Trasladamos esa proporción al canvas de 800x800
    const finalX = 400 + (offset.x - (CANVAS_SIZE / 2 - cropX - CROP_SIZE / 2)) * factor - drawW / 2;
    const finalY = 400 + (offset.y - (CANVAS_SIZE / 2 - cropY - CROP_SIZE / 2)) * factor - drawH / 2;

    cropCtx.drawImage(image, finalX, finalY, drawW, drawH);

    // Exportar a base64 JPEG calidad 0.85
    const base64 = cropCanvas.toDataURL('image/jpeg', 0.85);
    onCrop(base64);
  };

  return (
    <div className="canvas-cropper-container" style={styles.container}>
      {!image ? (
        <div
          className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...styles.dragZone,
            borderColor: isDragOver ? 'var(--color-primary, #d4af37)' : 'rgba(212, 175, 55, 0.3)',
            backgroundColor: isDragOver ? 'rgba(212, 175, 55, 0.05)' : 'rgba(15, 12, 19, 0.2)'
          }}
        >
          <div style={styles.dragContent}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={styles.dragIcon}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <Typography variant="body" style={styles.dragText}>
              Arrastrá tu imagen sagrada aquí
            </Typography>
            <Typography variant="caption" style={styles.dragSubText}>
              o hace click para explorar tus archivos
            </Typography>
          </div>
        </div>
      ) : (
        <div style={styles.editorArea}>
          <div
            className="canvas-viewport-wrapper"
            style={styles.canvasWrapper}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={styles.canvas}
            />
            <span style={styles.instructionsOverlay}>
              Arrastrá para encuadrar la imagen
            </span>
          </div>

          {/* Controles de Zoom */}
          <div style={styles.controlsRow}>
            <span style={styles.zoomLabel}>Zoom:</span>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.zoomValue}>{Math.round(scale * 100)}%</span>
          </div>

          <div style={styles.buttonRow}>
            <Button
              variant="secondary"
              onClick={() => {
                setImage(null);
                setScale(1.0);
                setOffset({ x: 0, y: 0 });
              }}
              style={styles.resetButton}
            >
              Cambiar Imagen
            </Button>
            
            <div style={styles.actionRight}>
              {onCancel && (
                <Button variant="secondary" onClick={onCancel} style={{ marginRight: '10px' }}>
                  Cancelar
                </Button>
              )}
              <Button onClick={handleConfirm} style={styles.confirmButton}>
                Confirmar Encuadre
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
  },
  dragZone: {
    width: '100%',
    maxWidth: '440px',
    height: '280px',
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  dragContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  dragIcon: {
    color: '#d4af37',
    marginBottom: '16px',
    opacity: 0.8,
  },
  dragText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.1rem',
    marginBottom: '6px',
  },
  dragSubText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.85rem',
  },
  editorArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '420px',
  },
  canvasWrapper: {
    position: 'relative',
    width: '400px',
    height: '400px',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'grab',
    boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
    marginBottom: '20px',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
    backgroundColor: '#161219',
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(15, 12, 19, 0.8)',
    color: '#d4af37',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontFamily: 'Inter, sans-serif',
    pointerEvents: 'none',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '24px',
    padding: '0 8px',
  },
  zoomLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.85rem',
    fontFamily: 'Inter, sans-serif',
  },
  zoomValue: {
    color: '#d4af37',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: '45px',
    textAlign: 'right',
  },
  slider: {
    flex: 1,
    margin: '0 16px',
    accentColor: '#d4af37',
    cursor: 'pointer',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    gap: '12px',
  },
  resetButton: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionRight: {
    display: 'flex',
  },
  confirmButton: {
    backgroundColor: '#d4af37',
    color: '#120f15',
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
  }
};
