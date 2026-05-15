import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../api';

export default function PublicProposal() {
  const router = useRouter();
  const { token } = router.query;
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!token) return;
    // Llama al backend: loguea la apertura y devuelve el id
    api.get(`/proposals/p/${token}`)
      .then(({ data }) => setProposal(data))
      .catch(() => setError('Esta propuesta no existe o el link es inválido.'));
  }, [token]);

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFFBF5', flexDirection: 'column', gap: 16 }}>
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

  return (
    <div style={{ background: '#E5E7EB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 48px' }}>
      {/* Header mínimo */}
      <div style={{ width: 794, maxWidth: '100%', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#31353D' }}>
          Firmaway<span style={{ color: '#F15A2F' }}>.</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(49,53,61,0.5)' }}>
          Propuesta para {proposal.lead_name}
        </div>
      </div>

      {/* Propuesta en iframe */}
      <iframe
        src={`${apiUrl}/proposals/${proposal.id}/preview`}
        style={{
          width: 794,
          maxWidth: '100%',
          height: 4200,
          border: 'none',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          borderRadius: 4,
          background: '#fff',
        }}
        title={`Propuesta ${proposal.proposal_number}`}
      />
    </div>
  );
}
