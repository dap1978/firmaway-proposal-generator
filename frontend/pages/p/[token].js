import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../../api';

const PROPOSAL_WIDTH  = 794;
const PROPOSAL_HEIGHT = 4200;

// Escala el iframe para que entre en pantalla en mobile
function ScaledIframe({ src, title, contentHeight = PROPOSAL_HEIGHT }) {
  const wrapperRef = useRef(null);
  const [scale, setScale]   = useState(1);
  const [boxHeight, setBoxHeight] = useState(contentHeight);

  useEffect(() => {
    function measure() {
      if (!wrapperRef.current) return;
      const available = wrapperRef.current.offsetWidth;
      const s = available < PROPOSAL_WIDTH ? available / PROPOSAL_WIDTH : 1;
      setScale(s);
      setBoxHeight(Math.ceil(contentHeight * s));
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [contentHeight]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: boxHeight, position: 'relative' }}>
      <iframe
        src={src}
        title={title}
        style={{
          width: PROPOSAL_WIDTH,
          height: contentHeight,
          border: 'none',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          borderRadius: 4,
          background: '#fff',
          display: 'block',
        }}
      />
    </div>
  );
}

export default function PublicProposal() {
  const router = useRouter();
  const { token } = router.query;
  const [proposal, setProposal] = useState(null);
  const [error, setError]       = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!token) return;
    api.get(`/proposals/p/${token}`)
      .then(({ data }) => setProposal(data))
      .catch(() => setError('Esta propuesta no existe o el link es inválido.'));
  }, [token]);

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFFBF5', flexDirection: 'column', gap: 16, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ fontSize: 32 }}>🔍</div>
      <div style={{ fontSize: 16, color: '#31353D', fontWeight: 600 }}>Propuesta no encontrada</div>
      <div style={{ fontSize: 14, color: 'rgba(49,53,61,0.5)' }}>{error}</div>
    </div>
  );

  if (!proposal) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFFBF5' }}>
      <div style={{ color: 'rgba(49,53,61,0.45)', fontSize: 14 }}>Cargando propuesta...</div>
    </div>
  );

  // ── Propuesta vencida ────────────────────────────────────────────────────
  if (proposal.is_expired) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#3A4557',
      flexDirection: 'column', gap: 20, padding: '0 24px',
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', textAlign: 'center', letterSpacing: '-0.03em', maxWidth: 340 }}>
        Esta propuesta ya no está disponible
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.7, maxWidth: 300 }}>
        El link de esta propuesta venció. Para recibir una nueva o consultar sobre tu caso, escribinos a:
      </div>
      <a href="mailto:hola@firmaway.us" style={{
        fontSize: 15, fontWeight: 700, color: '#F15A2F', textDecoration: 'none',
        background: 'rgba(241,90,47,0.1)', border: '1.5px solid #F15A2F',
        borderRadius: 10, padding: '12px 28px', letterSpacing: '-0.01em',
      }}>
        hola@firmaway.us
      </a>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
        Firmaway<span style={{ color: '#F15A2F' }}>.</span>
      </div>
    </div>
  );

  // ── Días restantes (para banner de aviso) ────────────────────────────────
  const daysLeft = proposal.expires_at
    ? Math.ceil((new Date(proposal.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const showExpiryWarning = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

  return (
    <div style={{ background: '#E5E7EB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: PROPOSAL_WIDTH, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#31353D' }}>
          Firmaway<span style={{ color: '#F15A2F' }}>.</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(49,53,61,0.5)' }}>
          Propuesta para {proposal.lead_name}
        </div>
      </div>

      {/* Banner de vencimiento próximo */}
      {showExpiryWarning && (
        <div style={{
          width: '100%', maxWidth: PROPOSAL_WIDTH, marginBottom: 12,
          background: '#FFF8E7', border: '1.5px solid #F59E0B', borderRadius: 10,
          padding: '10px 16px', fontSize: 13, color: '#92400E',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠️</span>
          <span>
            Esta propuesta vence en <strong>{daysLeft === 1 ? '1 día' : `${daysLeft} días`}</strong>.
          </span>
        </div>
      )}

      {/* Propuesta — escalada automáticamente en mobile */}
      <div style={{ width: '100%', maxWidth: PROPOSAL_WIDTH }}>
        <ScaledIframe
          src={`${apiUrl}/proposals/${proposal.id}/preview`}
          title={`Propuesta ${proposal.proposal_number}`}
          contentHeight={proposal.proposal_type === 'whitelabel' ? 6912 : PROPOSAL_HEIGHT}
        />
      </div>
    </div>
  );
}
