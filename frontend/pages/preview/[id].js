import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../../api';

const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', cardBg: '#FEF1E0',
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9',
  border: 'rgba(49,53,61,0.12)', dark: '#3A4557',
};

const PACKAGES = [
  { value: 'starter', label: 'Starter — USD 499' },
  { value: 'pro',     label: 'Pro — USD 645' },
  { value: 'all_in',  label: 'All In — USD 1.199' },
];

const STATES = [
  { value: 'wyoming',    label: 'Wyoming',     fee: 62  },
  { value: 'new_mexico', label: 'Nuevo México', fee: 0   },
  { value: 'delaware',   label: 'Delaware',     fee: 300 },
  { value: 'florida',    label: 'Florida',      fee: 0   },
  { value: 'texas',      label: 'Texas',        fee: 0   },
];

const STATE_NAMES = {
  new_mexico: 'Nuevo México', wyoming: 'Wyoming',
  delaware: 'Delaware', florida: 'Florida', texas: 'Texas',
};

const URGENCY_COLORS = {
  alto:  { bg: '#FFF0EE', text: C.orange,  border: C.orange  },
  medio: { bg: '#FFF8E7', text: '#B45309', border: '#F59E0B' },
  bajo:  { bg: '#F0F9FF', text: '#0369A1', border: '#38BDF8' },
};

const inp = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: `1.5px solid ${C.border}`, background: C.warm,
  fontSize: 13, color: C.ink, fontFamily: 'inherit',
  outline: 'none', resize: 'vertical',
};

// ── Email cliente-side (se regenera sin llamar a Claude) ──────────────────
function buildEmailSubject(edits, pkg) {
  const pkgNames = { starter: 'Starter', pro: 'Pro', all_in: 'All In' };
  const name = edits.lead_name || 'Lead';
  return `Propuesta Firmaway · LLC ${pkgNames[pkg] || 'Pro'} para ${name}`;
}

function buildEmailDraft(edits, pkg, aiData) {
  const pkgNames  = { starter: 'Starter', pro: 'Pro', all_in: 'All In' };
  const pkgPrices = { starter: 499, pro: 645, all_in: 1199 };

  const name           = edits.lead_name || 'Lead';
  const pkgName        = pkgNames[pkg] || 'Pro';
  const price          = pkgPrices[pkg] || 645;
  const stateName      = STATE_NAMES[edits.state_recommended || 'wyoming'] || 'Wyoming';
  const commercialName = aiData.commercial_name || 'Sebastián Bedoya';
  const lang           = aiData.language || 'es';

  if (lang === 'pt') {
    return `Olá ${name},\n\nObrigado pelo seu tempo hoje. Foi ótimo conversar e entender o que você precisa — estamos preparados para ajudá-lo em cada etapa.\n\nSegue a proposta com o pacote ${pkgName} (USD ${price}), com abertura no estado de ${stateName}. Você encontrará todos os detalhes no link ou PDF em anexo.\n\nQualquer dúvida, me chame pelo WhatsApp ou responda este e-mail.\n\n${commercialName}\nFirmaway · firmaway.us | +1 689 242 2109`;
  }

  return `Hola ${name},\n\nGracias por tu tiempo hoy. Fue muy bueno conversar y entender lo que necesitás — estamos listos para acompañarte en cada paso.\n\nTe mando la propuesta con el paquete ${pkgName} (USD ${price}), con formación en ${stateName}. Encontrás todos los detalles en el link o PDF adjunto.\n\nCualquier consulta, escribime por WhatsApp o respondé este mail.\n\n${commercialName}\nFirmaway · firmaway.us | +1 689 242 2109`;
}

// ── Componentes ───────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} style={{
      background: copied ? '#E8F5E9' : C.orangeSoft,
      border: `1.5px solid ${copied ? '#4CAF50' : C.orange}`,
      borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, color: copied ? '#2E7D32' : C.orange,
      whiteSpace: 'nowrap',
    }}>
      {copied ? '✓ Copiado' : label}
    </button>
  );
}

function CopyLinkButton({ token }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const link = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} style={{
      width: '100%', padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
      background: copied ? '#E8F5E9' : C.bg,
      border: `1.5px solid ${copied ? '#4CAF50' : C.border}`,
      fontSize: 12, fontWeight: 600,
      color: copied ? '#2E7D32' : C.ink,
      textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {copied ? '✓ Link copiado' : '🔗 Copiar link público'}
    </button>
  );
}

export default function Preview() {
  const router = useRouter();
  const { id } = router.query;
  const [proposal, setProposal]   = useState(null);
  const [edits, setEdits]         = useState({});
  const [pkg, setPkg]             = useState('pro');
  const [activeTab, setActiveTab] = useState('email');
  const [saving, setSaving]       = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending]     = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const saveTimer = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!id) return;
    api.get(`/proposals/${id}`).then(({ data }) => {
      setProposal(data);
      setPkg(data.package || 'pro');
      const src = data.final_data || data.generated_data || {};
      setEdits({
        lead_name:          src.lead_name || '',
        lead_detail:        src.lead_detail || '',
        headline_line1:     src.headline_line1 || '',
        headline_line2:     src.headline_line2 || '',
        headline_highlight: src.headline_highlight || '',
        cuerpo_cap01:       src.cuerpo_cap01 || '',
        state_recommended:  src.state_recommended || (data.package === 'starter' ? 'new_mexico' : 'wyoming'),
      });
    });
  }, [id]);

  // Auto-save con debounce 800ms
  const scheduleSync = useCallback(() => {
    if (!id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.patch(`/proposals/${id}`, { final_data: edits, package: pkg });
        setPreviewKey(k => k + 1);
      } catch (e) {
        console.error('Auto-save error:', e);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [id, edits, pkg]);

  useEffect(() => {
    if (proposal) scheduleSync();
  }, [edits, pkg]);

  async function handleMarkSent() {
    setSending(true);
    try {
      const { data } = await api.post(`/proposals/${id}/send`);
      setProposal(p => ({ ...p, status: data.status, sent_at: data.sent_at }));
    } catch {
      alert('Error al marcar como enviada.');
    } finally {
      setSending(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await api.patch(`/proposals/${id}`, { final_data: edits, package: pkg });
      const response = await api.post(`/proposals/${id}/pdf`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `propuesta-${proposal?.proposal_number}-${(edits.lead_name || 'lead').replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el PDF. Intentá de nuevo.');
    } finally {
      setDownloading(false);
    }
  }

  if (!proposal) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.warm }}>
      <div style={{ color: C.muted, fontSize: 14 }}>Cargando propuesta...</div>
    </div>
  );

  const aiData       = proposal.final_data || proposal.generated_data || {};
  const urgency      = aiData.urgency_score || 'medio';
  const urgencyColor = URGENCY_COLORS[urgency] || URGENCY_COLORS.medio;

  // Email computado client-side — se actualiza con cada edición del panel
  const emailSubject = buildEmailSubject(edits, pkg);
  const emailDraft   = buildEmailDraft(edits, pkg, aiData);

  return (
    <div style={{ background: C.warm, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: 52, background: C.dark, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/generate')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>
            ← Nueva propuesta
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>
            {proposal.proposal_number}
          </span>
          {saving && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Guardando...</span>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/history')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 7, padding: '6px 14px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
            Historial
          </button>
          <button onClick={handleDownload} disabled={downloading} style={{
            background: downloading ? 'rgba(241,90,47,0.5)' : C.orange,
            border: 'none', borderRadius: 7, padding: '6px 18px',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer',
          }}>
            {downloading ? 'Generando...' : '⬇ Descargar PDF'}
          </button>
        </div>
      </nav>

      {/* Layout 2 columnas */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 52px)' }}>

        {/* ── Columna izquierda: campos editables ── */}
        <div style={{ width: 360, flexShrink: 0, overflowY: 'auto', background: C.bg, borderRight: `1px solid ${C.border}`, padding: '20px 20px 32px' }}>

          {/* Panel envío + link público */}
          <div style={{ background: C.warm, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>

            {/* Fila enviada */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 2 }}>Estado</div>
                {proposal.status === 'sent' ? (
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>
                    ✓ Enviada {proposal.sent_at ? `· ${new Date(proposal.sent_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}` : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: C.muted }}>No enviada</div>
                )}
              </div>
              {proposal.status !== 'sent' && (
                <button
                  onClick={handleMarkSent}
                  disabled={sending}
                  style={{
                    background: C.orange, border: 'none', borderRadius: 7,
                    padding: '6px 12px', color: '#fff', fontSize: 12,
                    fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
                    opacity: sending ? 0.6 : 1,
                  }}
                >
                  {sending ? '...' : 'Marcar enviada'}
                </button>
              )}
            </div>

            {/* Fila vistas */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 2 }}>Aperturas del lead</div>
                {proposal.view_count > 0 ? (
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
                    👁 {proposal.view_count} {proposal.view_count === 1 ? 'vez' : 'veces'}
                    {proposal.last_viewed_at && (
                      <span style={{ fontWeight: 400, color: C.muted, fontSize: 12 }}>
                        {' · última: '}{new Date(proposal.last_viewed_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: C.muted }}>No abierta aún</div>
                )}
              </div>
            </div>

            {/* Link público */}
            <div style={{ paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 6 }}>Link para el lead</div>
              <CopyLinkButton token={proposal.public_token} />
            </div>
          </div>

          {/* Score urgencia */}
          <div style={{ background: urgencyColor.bg, border: `1.5px solid ${urgencyColor.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: urgencyColor.text, marginBottom: 3 }}>
              Score de urgencia
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: urgencyColor.text, textTransform: 'uppercase' }}>{urgency}</span>
              <span style={{ fontSize: 12, color: urgencyColor.text, opacity: 0.8 }}>— {aiData.urgency_reason || ''}</span>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 14 }}>
            Editar propuesta
          </div>

          {/* Paquete */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 5 }}>Paquete</label>
            <select value={pkg} onChange={e => setPkg(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {PACKAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Estado recomendado */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 5 }}>Estado recomendado</label>
            <select
              value={edits.state_recommended || 'wyoming'}
              onChange={e => setEdits(p => ({ ...p, state_recommended: e.target.value }))}
              style={{ ...inp, cursor: 'pointer' }}
            >
              {STATES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}{s.fee > 0 ? ` – $${s.fee} est.` : ' – gratis'}
                </option>
              ))}
            </select>
          </div>

          {/* Lead */}
          {[
            { key: 'lead_name',   label: 'Nombre del lead' },
            { key: 'lead_detail', label: 'Detalle del cliente' },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 5 }}>{label}</label>
              <input
                value={edits[key] || ''}
                onChange={e => setEdits(p => ({ ...p, [key]: e.target.value }))}
                style={{ ...inp }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          ))}

          {/* Headline */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 5 }}>
              Headline portada
            </label>
            {['headline_line1', 'headline_line2', 'headline_highlight'].map((key, i) => (
              <input
                key={key}
                value={edits[key] || ''}
                onChange={e => setEdits(p => ({ ...p, [key]: e.target.value }))}
                placeholder={['Línea 1', 'Línea 2', 'Frase naranja'][i]}
                style={{ ...inp, marginBottom: i < 2 ? 6 : 0 }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            ))}
          </div>

          {/* Cuerpo Cap 01 */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 5 }}>Párrafo Cap. 01</label>
            <textarea
              value={edits.cuerpo_cap01 || ''}
              onChange={e => setEdits(p => ({ ...p, cuerpo_cap01: e.target.value }))}
              rows={6}
              style={{ ...inp }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Tabs: Email / WhatsApp / Objeciones */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { key: 'email',      label: '✉ Email' },
                { key: 'whatsapp',   label: '💬 WhatsApp' },
                { key: 'objections', label: '🎯 Objeciones' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: activeTab === tab.key ? C.orangeSoft : C.warm,
                  border: `1.5px solid ${activeTab === tab.key ? C.orange : C.border}`,
                  color: activeTab === tab.key ? C.orange : C.ink,
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Email — se regenera desde edits (sin llamada a Claude) */}
            {activeTab === 'email' && (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>Asunto</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, padding: '8px 12px', background: C.warm, borderRadius: 8, fontSize: 13, color: C.ink, border: `1px solid ${C.border}` }}>
                      {emailSubject}
                    </div>
                    <CopyButton text={emailSubject} label="Copiar" />
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Cuerpo del email</div>
                <div style={{ background: C.warm, borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: '20px', color: C.ink, border: `1px solid ${C.border}`, whiteSpace: 'pre-wrap', maxHeight: 280, overflowY: 'auto' }}>
                  {emailDraft}
                </div>
                <div style={{ marginTop: 10 }}>
                  <CopyButton text={emailDraft} label="Copiar email completo" />
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {activeTab === 'whatsapp' && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Sugerencia WhatsApp</div>
                <div style={{ background: '#E8F5E9', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: '20px', color: C.ink, border: '1px solid #A5D6A7', whiteSpace: 'pre-wrap' }}>
                  {aiData.whatsapp_draft || ''}
                </div>
                <div style={{ marginTop: 10 }}>
                  <CopyButton text={aiData.whatsapp_draft || ''} label="Copiar mensaje" />
                </div>
              </div>
            )}

            {/* Objeciones */}
            {activeTab === 'objections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(proposal.objections || []).length === 0 && (
                  <div style={{ fontSize: 13, color: C.muted }}>No se detectaron objeciones en esta llamada.</div>
                )}
                {(proposal.objections || []).map((obj, i) => (
                  <div key={i} style={{ background: C.warm, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', boxShadow: `3px 3px 0px 0px ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 4 }}>
                      Objeción {i + 1}
                    </div>
                    <div style={{ fontSize: 13, color: C.ink, marginBottom: 8, fontStyle: 'italic' }}>
                      "{obj.objection_text}"
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>
                      Respuesta sugerida
                    </div>
                    <div style={{ fontSize: 13, color: C.ink, lineHeight: '19px' }}>
                      {obj.suggested_response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha: preview iframe ── */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#D1D5DB', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', background: '#F9FAFB', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Vista previa</span>
            {saving && <span style={{ color: C.orange }}>• Actualizando...</span>}
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '20px 16px' }}>
            <iframe
              key={previewKey}
              src={`${apiUrl}/proposals/${id}/preview`}
              style={{
                width: 794, height: 4200, border: 'none',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                borderRadius: 4, background: '#fff',
              }}
              title="Preview propuesta"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
