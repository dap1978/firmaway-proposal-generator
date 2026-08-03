import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../../api';

const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', cardBg: '#FEF1E0',
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9',
  border: 'rgba(49,53,61,0.12)', dark: '#3A4557',
};

const PACKAGES_ES = [
  { value: 'solo_llc', label: 'Solo LLC — USD 595' },
  { value: 'starter',  label: 'Starter — USD 599' },
  { value: 'pro',      label: 'Pro — USD 745' },
  { value: 'all_in',   label: 'All In — USD 1.299' },
];
const PACKAGES_PT = [
  { value: 'starter', label: 'Essencial — R$ 3.109' },
  { value: 'pro',     label: 'Pro — R$ 3.809' },
  { value: 'all_in',  label: 'Completo — R$ 6.609' },
];

const STATES = [
  { value: 'wyoming',    label: 'Wyoming',     fee: 63  },
  { value: 'new_mexico', label: 'Nuevo México', fee: 0   },
  { value: 'delaware',   label: 'Delaware',     fee: 300 },
  { value: 'florida',    label: 'Florida',      fee: 138.75 },
  { value: 'texas',      label: 'Texas',        fee: 99   },
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

function buildEmailDraft(edits, pkg, aiData, publicLink) {
  const lang    = aiData.language || 'es';
  const isPt    = lang === 'pt';

  const pkgNamesEs  = { solo_llc: 'Solo LLC', starter: 'Starter', pro: 'Pro', all_in: 'All In'   };
  const pkgNamesPt  = { starter: 'Essencial', pro: 'Pro',         all_in: 'Completo' };
  const pkgPricesEs = { solo_llc: 595, starter: 599, pro: 745,  all_in: 1299 };
  const pkgPricesPt = { starter: 3109,         pro: 3809,         all_in: 6609 };

  const name      = edits.lead_name || 'Lead';
  const pkgName   = isPt ? (pkgNamesPt[pkg] || 'Pro') : (pkgNamesEs[pkg] || 'Pro');
  const price     = isPt ? (pkgPricesPt[pkg] || 3809)  : (pkgPricesEs[pkg] || 745);
  const currency  = isPt ? 'R$' : 'USD';
  const stateName = STATE_NAMES[edits.state_recommended || 'wyoming'] || 'Wyoming';
  const linkLine  = publicLink ? `${publicLink}\n\n` : '';

  if (isPt) {
    return `Olá ${name},\n\nObrigado pelo seu tempo hoje. Foi muito bom conversar e entender o que você precisa — estamos preparados para acompanhá-lo em cada etapa.\n\nSegue o link com a sua proposta personalizada — pacote ${pkgName} (${currency} ${price.toLocaleString('pt-BR')}), abertura em ${stateName}. Pode abrí-lo de qualquer dispositivo, a qualquer momento:\n\n${linkLine}Qualquer dúvida, me chame pelo WhatsApp ou responda este e-mail.`;
  }

  return `Hola ${name},\n\nGracias por tu tiempo hoy. Fue muy bueno conversar y entender lo que necesitás — estamos listos para acompañarte en cada paso.\n\nTe comparto el link con tu propuesta personalizada — paquete ${pkgName} (${currency} ${price.toLocaleString('es-AR')}), formación en ${stateName}. Podés abrirlo desde cualquier dispositivo, en cualquier momento:\n\n${linkLine}Cualquier consulta, escribime por WhatsApp o respondé este mail.`;
}

// ── Whitelabel: contacto + email (cliente-side) ───────────────────────────
function wlContact(commercialName) {
  const first = (commercialName || 'Daniel').trim().split(/\s+/)[0] || 'Daniel';
  const slug = first.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  return { apodo: first, email: `${slug}@firmaway.us` };
}

function buildWhitelabelEmail(edits, commercialName, publicLink, language) {
  const name     = edits.client_name || 'Hola';
  const contact  = wlContact(commercialName);
  const linkLine = publicLink ? `${publicLink}\n\n` : '';

  if (language === 'pt') {
    return `Olá ${name},\n\nObrigado pelo seu tempo. Como comentei, te envio a proposta do nosso programa whitelabel: você forma LLCs nos EUA com sua própria marca e seus próprios preços, e nós processamos todo o back-end.\n\nAqui você pode ver a proposta completa:\n\n${linkLine}Qualquer dúvida me escreva e agendamos uma chamada de 20 minutos para ver na prática.\n\n${contact.apodo} · Firmaway`;
  }

  return `Hola ${name},\n\nGracias por tu tiempo. Como te comenté, te comparto la propuesta de nuestro programa whitelabel: formás LLCs en EE.UU. bajo tu propia marca y con tus propios precios, y nosotros procesamos todo el back-end.\n\nAcá podés ver la propuesta completa:\n\n${linkLine}Cualquier duda me escribís y coordinamos una llamada de 20 minutos para verla en acción.\n\n${contact.apodo} · Firmaway`;
}

// ── Templates de seguimiento (cliente-side) ───────────────────────────────
function buildFollowUp(edits, aiData, delay) {
  const name     = edits.lead_name || 'Lead';
  const nickname = aiData.commercial_nickname || 'Seba';
  if (delay === 24) return `Hola ${name}, ¿llegó bien la propuesta que te mandé?\n\nCualquier consulta que tengas, estoy disponible. — ${nickname}`;
  if (delay === 48) return `Hola ${name}, quería saber si tuviste tiempo de revisar la propuesta.\n\nSi tenés alguna duda o querés ajustar algo, avisame. — ${nickname}`;
  return `Hola ${name}, ¿todo bien? Me quedo disponible por si querés retomar cuando tengas un momento. Sin apuro. — ${nickname}`;
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
      {copied ? '✓ Link copiado' : 'Copiar link público'}
    </button>
  );
}

export default function Preview() {
  const router = useRouter();
  const { id } = router.query;
  const [proposal, setProposal]   = useState(null);
  const [edits, setEdits]         = useState({});
  const [pkg, setPkg]             = useState('pro');
  const [casePrice, setCasePrice] = useState('');
  const [logoDomain, setLogoDomain] = useState('');
  const [logoBusy, setLogoBusy]   = useState(false);
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

      if (data.proposal_type === 'whitelabel') {
        setCasePrice(data.case_price != null ? String(data.case_price) : '');
        setEdits({
          client_name:     src.client_name || '',
          client_type:     src.client_type || '',
          cuerpo_cap01:    src.cuerpo_cap01 || '',
          quote_texto:     src.quote_texto || '',
          quote_autor:     src.quote_autor || 'Tus palabras durante la llamada',
          client_logo_url: src.client_logo_url || '',
          demo_ref:        src.demo_ref || src.client_name || '',
        });
        return;
      }

      setEdits({
        lead_name:          src.lead_name || '',
        lead_detail:        src.lead_detail || '',
        lead_email:         src.lead_email || '',
        headline_line1:     src.headline_line1 || '',
        headline_line2:     src.headline_line2 || '',
        headline_highlight: src.headline_highlight || '',
        cuerpo_cap01:       src.cuerpo_cap01 || '',
        extra_cap01:        src.extra_cap01 || '',
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
        const payload = proposal?.proposal_type === 'whitelabel'
          ? { final_data: edits, case_price: casePrice === '' ? null : casePrice }
          : { final_data: edits, package: pkg };
        await api.patch(`/proposals/${id}`, payload);
        setPreviewKey(k => k + 1);
      } catch (e) {
        console.error('Auto-save error:', e);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [id, edits, pkg, casePrice, proposal]);

  useEffect(() => {
    if (proposal) scheduleSync();
  }, [edits, pkg, casePrice]);

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
      const payload = proposal?.proposal_type === 'whitelabel'
        ? { final_data: edits, case_price: casePrice === '' ? null : casePrice }
        : { final_data: edits, package: pkg };
      await api.patch(`/proposals/${id}`, payload);
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

  function handleLogoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Subí una imagen (PNG, JPG o SVG).'); return; }
    if (file.size > 1.5 * 1024 * 1024) { alert('La imagen pesa demasiado. Máximo 1.5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setEdits(p => ({ ...p, client_logo_url: ev.target.result }));
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleLogoFetch() {
    const raw = logoDomain.trim();
    if (!raw) return;
    const domain = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
    if (!domain.includes('.')) { alert('Ingresá un dominio válido, por ejemplo: empresa.com'); return; }
    setLogoBusy(true);
    setEdits(p => ({ ...p, client_logo_url: `https://logo.clearbit.com/${domain}` }));
    setTimeout(() => setLogoBusy(false), 400);
  }

  if (!proposal) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.warm }}>
      <div style={{ color: C.muted, fontSize: 14 }}>Cargando propuesta...</div>
    </div>
  );

  const isWhitelabel = proposal.proposal_type === 'whitelabel';

  const aiData       = proposal.final_data || proposal.generated_data || {};
  const urgency      = aiData.urgency_score || 'medio';
  const urgencyColor = URGENCY_COLORS[urgency] || URGENCY_COLORS.medio;

  // Email computado client-side — se actualiza con cada edición del panel
  const publicLink   = proposal?.public_token
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://propuestas.firmaway.us'}/p/${proposal.public_token}`
    : '';
  const emailSubject = buildEmailSubject(edits, pkg);
  const emailDraft   = buildEmailDraft(edits, pkg, aiData, publicLink);

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
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, lineHeight: 1.4 }}>Marcá enviada para registrar la fecha en el historial.</div>
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
                    {proposal.view_count} {proposal.view_count === 1 ? 'vez' : 'veces'}
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
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 2 }}>Link para el lead</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, lineHeight: 1.4 }}>Trackea cuándo y cuántas veces el lead abre la propuesta.</div>
              <CopyLinkButton token={proposal.public_token} />
            </div>
          </div>

          {/* Score urgencia — solo LLC */}
          {!isWhitelabel && (
          <div style={{ background: urgencyColor.bg, border: `1.5px solid ${urgencyColor.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: urgencyColor.text, marginBottom: 3 }}>
              Score de urgencia
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: urgencyColor.text, textTransform: 'uppercase' }}>{urgency}</span>
              <span style={{ fontSize: 12, color: urgencyColor.text, opacity: 0.8 }}>— {aiData.urgency_reason || ''}</span>
            </div>
          </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 14 }}>
            Editar propuesta
          </div>

          {isWhitelabel ? (
          <div>
            {/* Nombre del socio */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Nombre del socio</label>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Aparece en la portada ("Propuesta personalizada para…").</div>
              <input value={edits.client_name || ''} onChange={e => setEdits(p => ({ ...p, client_name: e.target.value }))} style={{ ...inp }} onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.border} />
            </div>

            {/* Tipo de negocio */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Tipo de negocio</label>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Contaduría, agencia, consultoría… Ayuda a personalizar el texto.</div>
              <input value={edits.client_type || ''} onChange={e => setEdits(p => ({ ...p, client_type: e.target.value }))} style={{ ...inp }} onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.border} />
            </div>

            {/* Precio por caso */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Costo por caso (USD)</label>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>El único número de la propuesta. Aparece en el KPI de portada. Suele ir entre 399 y 500.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>USD</span>
                <input
                  type="number"
                  value={casePrice}
                  onChange={e => setCasePrice(e.target.value)}
                  placeholder="450"
                  style={{ ...inp, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = C.orange}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            </div>

            {/* Logo del socio */}
            <div style={{ marginBottom: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Logo del socio</label>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>Traelo desde el dominio, o subí el archivo si no sale prolijo.</div>

              {/* Traer desde dominio */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  value={logoDomain}
                  onChange={e => setLogoDomain(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogoFetch(); }}
                  placeholder="empresa.com"
                  style={{ ...inp, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = C.orange}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <button onClick={handleLogoFetch} disabled={logoBusy} style={{
                  background: C.orangeSoft, border: `1.5px solid ${C.orange}`, borderRadius: 8,
                  padding: '0 14px', color: C.orange, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {logoBusy ? '...' : 'Traer'}
                </button>
              </div>

              {/* Subir archivo */}
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                background: C.warm, border: `1.5px dashed ${C.border}`,
                fontSize: 12, fontWeight: 600, color: C.ink,
              }}>
                Subir logo (PNG, JPG, SVG)
                <input type="file" accept="image/*" onChange={handleLogoFile} style={{ display: 'none' }} />
              </label>

              {/* Preview */}
              {edits.client_logo_url ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12, minHeight: 64 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={edits.client_logo_url} alt="Logo del socio" style={{ maxHeight: 44, maxWidth: '80%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.opacity = 0.3; }} />
                  </div>
                  <button onClick={() => setEdits(p => ({ ...p, client_logo_url: '' }))} style={{
                    marginTop: 6, background: 'transparent', border: 'none', color: C.muted,
                    fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
                  }}>
                    Quitar logo
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: 'italic' }}>
                  Sin logo: la portada muestra solo el nombre del socio.
                </div>
              )}
            </div>

            {/* Demo personalizado */}
            <div style={{ marginBottom: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Nombre para el demo (?ref=)</label>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Genera el link de acceso al demo con el nombre del prospecto. Mejor un solo nombre (ej: Darko).</div>
              <input
                value={edits.demo_ref || ''}
                onChange={e => setEdits(p => ({ ...p, demo_ref: e.target.value }))}
                placeholder="Darko"
                style={{ ...inp, marginBottom: 8 }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              {(() => {
                const ref = (edits.demo_ref || '').trim();
                const link = ref
                  ? `https://www.registrollc.com/login?ref=${ref}`
                  : 'https://www.registrollc.com/login';
                return (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, padding: '8px 12px', background: C.warm, borderRadius: 8, fontSize: 12, color: C.ink, border: `1px solid ${C.border}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link}
                    </div>
                    <CopyButton text={link} label="Copiar" />
                  </div>
                );
              })()}
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.4 }}>
                Credenciales fijas en la propuesta: <strong>demo@firmaway.us</strong> / <strong>demo</strong>
              </div>
            </div>

            {/* Email whitelabel */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 6 }}>Email para el socio</div>
              <div style={{ background: C.warm, borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: '20px', color: C.ink, border: `1px solid ${C.border}`, whiteSpace: 'pre-wrap', maxHeight: 260, overflowY: 'auto' }}>
                {buildWhitelabelEmail(edits, proposal.commercial_name, publicLink, proposal.language)}
              </div>
              <div style={{ marginTop: 10 }}>
                <CopyButton text={buildWhitelabelEmail(edits, proposal.commercial_name, publicLink, proposal.language)} label="Copiar email completo" />
              </div>
            </div>
          </div>
          ) : (
          <>
          {/* Paquete */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Paquete</label>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Cambiá si Claude recomendó mal. El PDF se actualiza al instante.</div>
            <select value={pkg} onChange={e => setPkg(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {(aiData.language === 'pt' ? PACKAGES_PT : PACKAGES_ES).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Estado recomendado */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Estado recomendado</label>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Wyoming por defecto para Pro/All In. Nuevo México solo si hay 1 socio y quiere el costo más bajo.</div>
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
            { key: 'lead_name',   label: 'Nombre del lead',    hint: 'Aparece en la portada y en el mail de envío.' },
            { key: 'lead_detail', label: 'Detalle del cliente', hint: 'Visible en la portada. Ej: E-commerce · Argentina' },
            { key: 'lead_email',  label: 'Email del lead',     hint: 'No aparece en la propuesta. Se usa para el reporte de seguimiento comercial.' },
          ].map(({ key, label, hint }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>{label}</label>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>{hint}</div>
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
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>
              Headline portada
            </label>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Titular visual de la propuesta. Editá si Claude no lo capturó bien. La 3ra línea sale en naranja.</div>
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
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>Párrafo Cap. 01</label>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Contexto personalizado en pág. 2. Ajustá el tono según cómo fue la llamada.</div>
            <textarea
              value={edits.cuerpo_cap01 || ''}
              onChange={e => setEdits(p => ({ ...p, cuerpo_cap01: e.target.value }))}
              rows={6}
              style={{ ...inp }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Extra Cap 01 */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>¿Falta algo que Claude no mencionó?</label>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, lineHeight: 1.4 }}>Se agrega al final del párrafo de arriba. Solo lo que no quedó cubierto.</div>
            <textarea
              value={edits.extra_cap01 || ''}
              onChange={e => setEdits(p => ({ ...p, extra_cap01: e.target.value }))}
              placeholder="Solo agregá lo que no quedó en el párrafo de arriba..."
              rows={3}
              style={{ ...inp }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Tabs: Email / WhatsApp / Objeciones */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {[
                { key: 'email',       label: 'Email' },
                { key: 'whatsapp',    label: 'WhatsApp' },
                { key: 'objections',  label: 'Objeciones' },
                { key: 'seguimiento', label: 'Seguimiento' },
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

            {/* Seguimiento */}
            {activeTab === 'seguimiento' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 4 }}>
                  Mensajes de seguimiento listos para copiar. Enviá a las 24h si no hay respuesta, luego a las 48h.
                </div>
                {[
                  { delay: 24, label: 'Seguimiento 24 hs' },
                  { delay: 48, label: 'Seguimiento 48 hs' },
                  { delay: 72, label: 'Seguimiento 72 hs (cierre suave)' },
                ].map(({ delay, label }) => {
                  const msg = buildFollowUp(edits, aiData, delay);
                  return (
                    <div key={delay} style={{ background: C.warm, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 6 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: '20px', color: C.ink, whiteSpace: 'pre-wrap', marginBottom: 10 }}>
                        {msg}
                      </div>
                      <CopyButton text={msg} label="Copiar" />
                    </div>
                  );
                })}
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
          </>
          )}
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
                width: 794, height: isWhitelabel ? 8064 : 6300, border: 'none',
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
