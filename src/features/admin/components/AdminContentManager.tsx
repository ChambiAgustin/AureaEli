import React, { useState } from 'react';
import type { ContentBlock, Ritual, Product } from '../../../core/api/IRepository';
import { apiRepository } from '../../../core/api';
import { supabase } from '../../../core/supabase/client';
import Typography from '../../../shared/components/Typography';
import { Edit2, Save, X } from 'lucide-react';

interface AdminContentManagerProps {
  contentBlocks: ContentBlock[];
  rituals: Ritual[];
  products: Product[];
  isLoading: boolean;
  viewMode?: 'content' | 'rituals';
  onContentBlocksChange?: () => void;
  triggerToast: (msg: string) => void;
  setRituals: React.Dispatch<React.SetStateAction<Ritual[]>>;
  setContentBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
  ritualDraftIds: Record<string, string[]>;
  setRitualDraftIds: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  ritualFieldDrafts: Record<string, RitualFieldDraft>;
  setRitualFieldDrafts: React.Dispatch<React.SetStateAction<Record<string, RitualFieldDraft>>>;
}

export type RitualFieldDraft = {
  title: string;
  description: string;
  durationMinutes: number;
  steps: string; // un paso por línea
  audioUrl: string;
};

export const ritualToDraft = (r: Ritual): RitualFieldDraft => ({
  title: r.title,
  description: r.description,
  durationMinutes: r.durationMinutes,
  steps: r.steps.join('\n'),
  audioUrl: r.audioUrl ?? '',
});

const MAX_AUDIO_MB = 10;

export async function uploadRitualAudio(file: File): Promise<string> {
  const isMp3 = file.name.toLowerCase().endsWith('.mp3') || file.type === 'audio/mpeg' || file.type === 'audio/mp3';
  if (!isMp3) throw new Error('El archivo debe ser un MP3.');
  if (file.size > MAX_AUDIO_MB * 1024 * 1024) throw new Error(`El audio supera el máximo de ${MAX_AUDIO_MB} MB.`);

  const filename = `ritual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
  const { error } = await supabase.storage
    .from('ritual-audio')
    .upload(filename, file, { contentType: 'audio/mpeg', upsert: false });

  if (error) throw new Error(`Storage upload: ${error.message}`);

  return supabase.storage.from('ritual-audio').getPublicUrl(filename).data.publicUrl;
}

export const CMS_CONTENT_BLOCKS_SCHEMA: { key: string; label: string; defaultText: string }[] = [
  {
    key: 'home.hero.slogan',
    label: 'Eslogan del Hero',
    defaultText: 'Un espacio dedicado a nutrir tu bienestar. Encontrá elementos de primera calidad y seleccionados con amor para intencionar tus días, armar tus altares y conectar con tu magia cotidiana, llenando de armonía cada rincón de tu hogar.',
  },
  {
    key: 'home.hero.badge',
    label: 'Badge superior del Hero',
    defaultText: '— Ritual y Pausa —',
  },
  {
    key: 'home.manifesto.title',
    label: 'Título del Manifiesto',
    defaultText: '“Vivimos a una velocidad que no le pertenece al alma. Nuestra sagrada intención es invitarte a frenar, encender un sahumerio y fundar tu espacio de paz.”',
  },
  {
    key: 'home.manifesto.body',
    label: 'Cuerpo del Manifiesto',
    defaultText: 'Aurea Elizabeth nació de la búsqueda honesta de calma y texturas nobles en un mundo ruidoso. Elegimos conscientemente cada extracto herbáceo, cada veta de lino y cada trazo de arcilla cocida a horno de leña. La compra no es el fin, es la puerta de entrada a tu ritual sagrado.',
  },
  {
    key: 'home.categories.title',
    label: 'Título de Categorías',
    defaultText: 'Explorá por Universo Sensorial',
  },
  {
    key: 'home.categories.subtitle',
    label: 'Subtítulo de Categorías',
    defaultText: 'Las Líneas de Calma',
  },
  {
    key: 'home.featured.title',
    label: 'Título de Productos Destacados',
    defaultText: 'Destacados de la Temporada',
  },
  {
    key: 'home.featured.subtitle',
    label: 'Subtítulo de Productos Destacados',
    defaultText: 'Una selección artesanal de nuestros sahumerios, óleos y cerámicas más amados.',
  },
  {
    key: 'catalog.header.title',
    label: 'Título del Catálogo',
    defaultText: 'El Catálogo Sensorial',
  },
  {
    key: 'catalog.header.subtitle',
    label: 'Subtítulo del Catálogo',
    defaultText: 'Fragancias, textiles y alquimias botánicas formuladas con intenciones sagradas para elevar la energía de tu ser y tus espacios cotidianos.',
  },
];

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({
  contentBlocks,
  rituals,
  products,
  isLoading,
  viewMode = 'content',
  onContentBlocksChange,
  triggerToast,
  setRituals,
  setContentBlocks,
  ritualDraftIds,
  setRitualDraftIds,
  ritualFieldDrafts,
  setRitualFieldDrafts,
}) => {
  // ── Edición de Content Blocks ─────────────────────────────────────────────
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [blockDraft, setBlockDraft] = useState('');

  // ── Estado del editor de rituales ────────────────────────────────────────
  const [expandedRitualId, setExpandedRitualId] = useState<string | null>(null);
  const [savingRitualId, setSavingRitualId] = useState<string | null>(null);
  const [uploadingAudioId, setUploadingAudioId] = useState<string | null>(null);

  // Lista combinada de bloques de contenido para asegurar todas las claves requeridas
  const displayedBlocks: ContentBlock[] = CMS_CONTENT_BLOCKS_SCHEMA.map(schema => {
    const existing = contentBlocks.find(b => b.key === schema.key);
    return {
      key: schema.key,
      label: schema.label,
      value: {
        text: (existing && existing.value?.text !== undefined && existing.value?.text !== null && existing.value?.text !== '')
          ? existing.value.text
          : schema.defaultText,
      },
      updatedAt: existing?.updatedAt,
    };
  });

  // Agregar cualquier otro bloque existente que no esté en el schema estándar
  contentBlocks.forEach(b => {
    if (!CMS_CONTENT_BLOCKS_SCHEMA.some(s => s.key === b.key)) {
      displayedBlocks.push(b);
    }
  });

  const handleStartEdit = (block: ContentBlock) => {
    setEditingBlock(block.key);
    setBlockDraft(block.value.text);
  };

  const handleSaveBlock = async (key: string, label?: string) => {
    try {
      await apiRepository.updateContentBlock(key, { text: blockDraft }, label);
      setContentBlocks(prev => {
        const idx = prev.findIndex(b => b.key === key);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], value: { text: blockDraft }, label: label || updated[idx].label };
          return updated;
        }
        return [...prev, { key, label: label || key, value: { text: blockDraft } }];
      });
      setEditingBlock(null);
      triggerToast('Texto actualizado en tiempo real ✓');
      if (onContentBlocksChange) onContentBlocksChange();
    } catch (err) {
      console.error('Error saving content block:', err);
      triggerToast('Error al actualizar texto.');
    }
  };

  const toggleProductInRitual = (ritualId: string, productId: string) => {
    setRitualDraftIds(prev => {
      const current = prev[ritualId] ?? [];
      const next = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId];
      return { ...prev, [ritualId]: next };
    });
  };

  const updateRitualField = (ritualId: string, patch: Partial<RitualFieldDraft>) => {
    setRitualFieldDrafts(prev => ({ ...prev, [ritualId]: { ...prev[ritualId], ...patch } }));
  };

  const handleAudioFileChange = async (ritualId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingAudioId(ritualId);
    try {
      const url = await uploadRitualAudio(file);
      updateRitualField(ritualId, { audioUrl: url });
      triggerToast('Audio subido ✓ No olvides guardar el ritual.');
    } catch (err) {
      console.error('Error uploading audio:', err);
      triggerToast(err instanceof Error ? err.message : 'Error al subir el audio.');
    } finally {
      setUploadingAudioId(null);
    }
  };

  const handleSaveRitual = async (ritual: Ritual) => {
    const fields = ritualFieldDrafts[ritual.id];
    if (fields && !fields.title.trim()) {
      triggerToast('El título del ritual es indispensable.');
      return;
    }

    setSavingRitualId(ritual.id);
    try {
      const updated: Ritual = {
        ...ritual,
        ...(fields ? {
          title: fields.title.trim(),
          description: fields.description,
          durationMinutes: Number(fields.durationMinutes) || 0,
          steps: fields.steps.split('\n').map(s => s.trim()).filter(Boolean),
          audioUrl: fields.audioUrl.trim(),
        } : {}),
        productIds: ritualDraftIds[ritual.id] ?? ritual.productIds,
      };
      await apiRepository.saveRitual(updated);
      setRituals(prev => prev.map(r => r.id === ritual.id ? updated : r));
      triggerToast(`Ritual "${updated.title}" actualizado.`);
      setExpandedRitualId(null);
    } catch (err) {
      console.error('Error saving ritual:', err);
      const msg = err instanceof Error ? ` ${err.message}` : '';
      triggerToast(`Error al guardar el ritual.${msg}`);
    } finally {
      setSavingRitualId(null);
    }
  };

  // ── Render Modo Content Blocks ────────────────────────────────────────────
  if (viewMode === 'content') {
    return (
      <div className="glass-panel" style={styles.mainPanel}>
        <div style={styles.panelHeader}>
          <div>
            <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>Textos de la Página (CMS)</Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
              Los cambios se aplican en tiempo real en la web del cliente.
            </Typography>
          </div>
        </div>

        {isLoading ? (
          <div style={styles.loaderContainer}><div className="spinner" style={styles.spinner} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedBlocks.map(block => (
              <div key={block.key} style={styles.blockRow}>
                <div style={{ flex: 1 }}>
                  <span style={styles.blockLabel}>{block.label}</span>
                  <span style={styles.blockKey}>{block.key}</span>
                </div>

                {editingBlock === block.key ? (
                  <div style={styles.blockEditArea}>
                    <textarea
                      value={blockDraft}
                      onChange={e => setBlockDraft(e.target.value)}
                      style={styles.blockTextarea}
                      rows={3}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button style={styles.blockCancelBtn} onClick={() => setEditingBlock(null)}>
                        <X size={13} /> Cancelar
                      </button>
                      <button style={styles.blockSaveBtn} onClick={() => handleSaveBlock(block.key, block.label)}>
                        <Save size={13} /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.blockValueArea}>
                    <span style={styles.blockValue}>"{block.value.text}"</span>
                    <button style={styles.blockEditBtn} onClick={() => handleStartEdit(block)}>
                      <Edit2 size={13} /> Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }


  // ── Render Modo Rituales Pool ─────────────────────────────────────────────
  return (
    <div className="glass-panel" style={styles.mainPanel}>
      <div style={styles.panelHeader}>
        <div>
          <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>Pool de Productos por Ritual</Typography>
          <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
            Cada vez que un cliente completa el quiz, se eligen 3 productos al azar del pool. Cuantos más productos agregues, más variedad.
          </Typography>
        </div>
      </div>

      {isLoading ? (
        <div style={styles.loaderContainer}><div className="spinner" style={styles.spinner} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rituals.map(ritual => {
            const isExpanded = expandedRitualId === ritual.id;
            const draftIds = ritualDraftIds[ritual.id] ?? ritual.productIds;
            const fieldDraft = ritualFieldDrafts[ritual.id] ?? ritualToDraft(ritual);
            const linkedProducts = products.filter(p => draftIds.includes(p.id));
            const unlinkedProducts = products.filter(p => !draftIds.includes(p.id));

            return (
              <div key={ritual.id} style={{ border: '1px solid rgba(176,142,98,0.18)', borderRadius: 16, overflow: 'hidden' }}>
                {/* Cabecera del ritual */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                  onClick={() => setExpandedRitualId(isExpanded ? null : ritual.id)}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-dark)', display: 'block' }}>{ritual.title}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {ritual.durationMinutes} min · <strong>{draftIds.length}</strong> productos en el pool · se muestran 3 al azar
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 300 }}>
                    {linkedProducts.slice(0, 3).map(p => (
                      <span key={p.id} style={styles.subcatTag}>{p.name.split('—')[0].trim()}</span>
                    ))}
                    {linkedProducts.length > 3 && (
                      <span style={{ ...styles.subcatTag, background: 'rgba(212,175,55,0.12)', color: '#b08e62' }}>+{linkedProducts.length - 3} más</span>
                    )}
                  </div>
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Editor expandido */}
                {isExpanded && (
                  <div style={{ padding: '20px', background: 'rgba(250,246,238,0.5)', borderTop: '1px solid rgba(176,142,98,0.12)' }}>
                    {/* Campos del ritual */}
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                      Datos del ritual
                    </p>
                    <div style={styles.formRow}>
                      <div style={{ ...styles.inputGroup, flex: 2, minWidth: 200 }}>
                        <label style={styles.label}>Título</label>
                        <input type="text" value={fieldDraft.title} onChange={e => updateRitualField(ritual.id, { title: e.target.value })} style={styles.input} />
                      </div>
                      <div style={{ ...styles.inputGroup, flex: 1, minWidth: 120 }}>
                        <label style={styles.label}>Duración (min)</label>
                        <input type="number" min="0" value={fieldDraft.durationMinutes} onChange={e => updateRitualField(ritual.id, { durationMinutes: Number(e.target.value) })} style={styles.input} />
                      </div>
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Descripción</label>
                      <textarea rows={2} value={fieldDraft.description} onChange={e => updateRitualField(ritual.id, { description: e.target.value })} style={styles.textarea} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Pasos (uno por línea)</label>
                      <textarea rows={4} value={fieldDraft.steps} onChange={e => updateRitualField(ritual.id, { steps: e.target.value })} style={styles.textarea} />
                    </div>
                    <div style={{ ...styles.inputGroup, marginBottom: 20 }}>
                      <label style={styles.label}>Audio del ritual (MP3)</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          value={fieldDraft.audioUrl}
                          onChange={e => updateRitualField(ritual.id, { audioUrl: e.target.value })}
                          placeholder="URL del audio (o subí un MP3 →)"
                          style={{ ...styles.input, flex: 1, minWidth: 220 }}
                        />
                        <input
                          type="file"
                          accept="audio/mpeg,.mp3"
                          id={`ritual-audio-file-${ritual.id}`}
                          style={{ display: 'none' }}
                          onChange={e => handleAudioFileChange(ritual.id, e)}
                        />
                        <label
                          htmlFor={`ritual-audio-file-${ritual.id}`}
                          style={{ ...styles.blockEditBtn, opacity: uploadingAudioId === ritual.id ? 0.6 : 1, pointerEvents: uploadingAudioId === ritual.id ? 'none' : 'auto' }}
                        >
                          {uploadingAudioId === ritual.id ? 'Subiendo audio...' : '♪ Subir MP3'}
                        </label>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Máximo {MAX_AUDIO_MB} MB. Se reproduce en la página de Rituales.</span>
                      {fieldDraft.audioUrl && (
                        <audio controls src={fieldDraft.audioUrl} style={{ width: '100%', marginTop: 4 }} />
                      )}
                    </div>

                    {/* Productos EN el pool */}
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                      En el pool ({linkedProducts.length})
                    </p>
                    {linkedProducts.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 16, fontStyle: 'italic' }}>Ningún producto en el pool todavía.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {linkedProducts.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(110,126,107,0.12)', border: '1px solid rgba(110,126,107,0.25)', borderRadius: 20, padding: '5px 10px 5px 6px' }}>
                            <img src={p.imageUrl} alt={p.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-bosque-suave)', fontWeight: 600 }}>{p.name.split('—')[0].trim()}</span>
                            <button
                              onClick={() => toggleProductInRitual(ritual.id, p.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A34C37', padding: '0 2px', fontSize: '0.75rem', lineHeight: 1 }}
                              title="Quitar del pool"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Productos para AGREGAR */}
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                      Agregar al pool
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {unlinkedProducts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => toggleProductInRitual(ritual.id, p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(176,142,98,0.3)', borderRadius: 20, padding: '5px 12px 5px 6px', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-dorado-mate)'; e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176,142,98,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
                        >
                          <img src={p.imageUrl} alt={p.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', opacity: 0.7 }} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>+ {p.name.split('—')[0].trim()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(176,142,98,0.15)', paddingTop: 16 }}>
                      <button
                        style={styles.blockCancelBtn}
                        onClick={() => {
                          setRitualDraftIds(prev => ({ ...prev, [ritual.id]: [...ritual.productIds] }));
                          setRitualFieldDrafts(prev => ({ ...prev, [ritual.id]: ritualToDraft(ritual) }));
                          setExpandedRitualId(null);
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        style={{ ...styles.blockSaveBtn, opacity: savingRitualId === ritual.id ? 0.7 : 1 }}
                        onClick={() => handleSaveRitual(ritual)}
                        disabled={savingRitualId === ritual.id}
                      >
                        <Save size={13} /> {savingRitualId === ritual.id ? 'Guardando...' : 'Guardar ritual'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mainPanel: { padding: '28px', borderRadius: '20px', border: '1px solid rgba(176, 142, 98, 0.18)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  blockRow: { display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid rgba(176, 142, 98, 0.12)', flexWrap: 'wrap' },
  blockLabel: { display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-dark)', marginBottom: '2px' },
  blockKey: { display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' },
  blockValueArea: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' },
  blockValue: { fontSize: '0.88rem', color: 'var(--color-text-muted)', fontStyle: 'italic', flex: 1 },
  blockEditBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(176, 142, 98, 0.1)', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--color-bosque-suave)', whiteSpace: 'nowrap' },
  blockEditArea: { flex: 1, minWidth: '250px' },
  blockTextarea: { width: '100%', padding: '10px 12px', background: 'white', border: '1px solid rgba(176, 142, 98, 0.3)', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
  blockSaveBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'var(--color-oliva-salvia)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'white', fontWeight: 600 },
  blockCancelBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'transparent', border: '1px solid rgba(61,46,40,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text-muted)' },
  subcatTag: { fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(176, 142, 98, 0.1)', border: '1px solid rgba(176, 142, 98, 0.2)', borderRadius: '20px', color: 'var(--color-bosque-suave)' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  label: { color: 'var(--color-text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 },
  input: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none' },
  textarea: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' },
};

export default AdminContentManager;
