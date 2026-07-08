import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../api';

const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', cardBg: '#FEF1E0',
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9',
  border: 'rgba(49,53,61,0.12)', dark: '#3A4557',
};

const nav = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0 32px', height: 56, background: C.dark, position: 'fixed',
  top: 0, left: 0, right: 0, zIndex: 100,
};

export default function Generate() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState('es');
  const [proposalType, setProposalType] = useState('llc');
  const [clientName, setClientName] = useState('');
  const [wlPrice, setWlPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isWhitelabel = proposalType === 'whitelabel';
  const canGenerate = isWhitelabel
    ? clientName.trim().length > 0
    : transcript.trim().length >= 50;

  useEffect(() => {
    if (!router.isReady) return;
    const saved = localStorage.getItem('fw_user');
    if (!saved) { router.replace('/'); return; }
    const tool = router.query.tool;
    if (tool !== 'llc' && tool !== 'whitelabel') { router.replace('/'); return; }
    const u = JSON.parse(saved);
    setUser(u);
    setLanguage(u.language || 'es');
    setProposalType(tool);
  }, [router.isReady]);

  async function handleGenerate() {
    if (isWhitelabel && !clientName.trim()) {
      setError('Ingresá el nombre del socio.');
      return;
    }
    if (!isWhitelabel && transcript.trim().length < 50) {
      setError('La transcripción es demasiado corta. Pegá la llamada completa.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = isWhitelabel
        ? {
            proposal_type: 'whitelabel',
            client_name: clientName.trim(),
            case_price: wlPrice.trim() || undefined,
            commercial_name: user?.name,
            language,
          }
        : {
            proposal_type: 'llc',
            transcript,
            language,
            notes: notes.trim() || undefined,
            commercial_name: user?.name,
            commercial_nickname: user?.nickname,
          };
      const { data } = await api.post('/proposals/generate', payload);
      router.push(`/preview/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar la propuesta. Intentá de nuevo.');
      setLoading(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      setError('Solo se aceptan archivos .txt');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTranscript(ev.target.result);
      setError('');
    };
    reader.readAsText(file, 'utf-8');
    // reset input so the same file can be re-selected
    e.target.value = '';
  }

  function handleLogout() {
    localStorage.removeItem('fw_user');
    router.push('/');
  }

  return (
    <div style={{ background: C.warm, minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.03em', color: '#fff' }}>
            Firmaway<span style={{ color: C.orange }}>.</span>
          </div>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>
            ← Inicio
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                {user.name?.charAt(0)}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>{user.name}</span>
            </div>
          )}
          <button onClick={() => window.open('/pitch', '_blank')} style={{ background: C.orangeSoft, border: `1px solid ${C.orange}`, borderRadius: 8, padding: '6px 14px', color: C.orange, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            📊 Presentación
          </button>
          <button onClick={() => router.push('/history')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Historial
          </button>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>
            Cambiar usuario
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={{ paddingTop: 88, paddingBottom: 48, maxWidth: 780, margin: '0 auto', padding: '88px 24px 48px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink, marginBottom: 6 }}>
            Nueva propuesta
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>
            {isWhitelabel
              ? 'Pegá la llamada con el posible socio y Claude arma la propuesta whitelabel.'
              : 'Pegá la transcripción de la llamada y Claude va a generar la propuesta completa.'}
          </p>
        </div>

        {/* Card principal */}
        <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: 28, boxShadow: `4px 4px 0px 0px ${C.border}`, marginBottom: 20 }}>
          {/* Idioma — disponible para LLC y Whitelabel */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 8 }}>
              Idioma de la propuesta
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ value: 'es', label: '🇦🇷 Español' }, { value: 'pt', label: '🇧🇷 Português' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  style={{
                    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: language === opt.value ? C.orangeSoft : C.warm,
                    border: `1.5px solid ${language === opt.value ? C.orange : C.border}`,
                    color: language === opt.value ? C.orange : C.ink,
                    boxShadow: language === opt.value ? `2px 2px 0px 0px ${C.orange}` : 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isWhitelabel ? (
          <div>
            {/* Nombre del socio */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 4 }}>
                Nombre del socio
              </label>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
                Es el mismo template para todos los socios. Lo único que se personaliza es el nombre, el logo y el precio.
              </p>
              <input
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Ej: Estudio Contable González"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${C.border}`, background: C.warm,
                  fontSize: 14, color: C.ink, outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Precio por caso */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 4 }}>
                Costo por caso (USD) <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
                Podés cargarlo ahora o después en la vista previa. Aparece en el KPI de portada.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.muted }}>USD</span>
                <input
                  type="number"
                  value={wlPrice}
                  onChange={e => setWlPrice(e.target.value)}
                  placeholder="450"
                  style={{
                    flex: 1, padding: '12px 14px', borderRadius: 10,
                    border: `1.5px solid ${C.border}`, background: C.warm,
                    fontSize: 14, color: C.ink, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = C.orange}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
                El logo del socio se carga en el siguiente paso (vista previa).
              </p>
            </div>
          </div>
          ) : (
          <>
          {/* Transcripción */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted }}>
                Transcripción de la llamada
              </label>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                background: C.warm, border: `1.5px solid ${C.border}`,
                fontSize: 12, fontWeight: 600, color: C.ink,
              }}>
                📎 Subir .txt
                <input type="file" accept=".txt" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </div>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Pegá acá la transcripción completa de la llamada SAMU..."
              rows={16}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                border: `1.5px solid ${C.border}`, background: C.warm,
                fontSize: 14, lineHeight: '22px', color: C.ink,
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
              {transcript.length > 0 && `${transcript.split(/\s+/).filter(Boolean).length} palabras`}
            </div>
          </div>

          {/* Contexto adicional */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 4 }}>
              Contexto adicional <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
            </label>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
              Agregá lo que no quedó en la transcripción: la vibe del lead, objeciones clave, qué querés que Claude enfatice.
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: El lead ya tiene clientes en USA y está convencido, pero le preocupa el costo anual. Quiero que el párrafo de cap. 01 sea directo y enfocado en la simplicidad del proceso."
              rows={4}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${C.border}`, background: C.warm,
                fontSize: 13, lineHeight: '20px', color: C.ink,
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
          </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FFF0EE', border: `1.5px solid ${C.orange}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: C.orange }}>
            {error}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          style={{
            width: '100%', padding: '16px', borderRadius: 12,
            background: loading || !canGenerate ? 'rgba(49,53,61,0.15)' : C.orange,
            color: loading || !canGenerate ? C.muted : '#fff',
            border: 'none', fontWeight: 700, fontSize: 16,
            cursor: loading || !canGenerate ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.01em',
            boxShadow: loading || !canGenerate ? 'none' : `4px 4px 0px 0px rgba(241,90,47,0.3)`,
            transition: 'all 0.15s',
          }}
        >
          {loading ? '⏳ Generando propuesta con Claude...' : (isWhitelabel ? '✦ Generar propuesta Whitelabel' : '✦ Generar propuesta LLC')}
        </button>

        {loading && !isWhitelabel && (
          <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 12 }}>
            Claude está analizando la llamada. Esto tarda entre 15 y 30 segundos.
          </p>
        )}
      </div>
    </div>
  );
}
