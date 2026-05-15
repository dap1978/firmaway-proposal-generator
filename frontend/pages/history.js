import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../api';

const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', cardBg: '#FEF1E0',
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9',
  border: 'rgba(49,53,61,0.12)', dark: '#3A4557',
};

const PKG_LABEL = { starter: 'Starter', pro: 'Pro', all_in: 'All In' };
const PKG_COLOR = {
  starter: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  pro:     { bg: C.orangeSoft, text: C.orange, border: C.orange },
  all_in:  { bg: '#F0FDF4', text: '#15803D', border: '#86EFAC' },
};
const URGENCY_COLORS = {
  alto: { bg: '#FFF0EE', text: C.orange },
  medio: { bg: '#FFF8E7', text: '#B45309' },
  bajo: { bg: '#F0F9FF', text: '#0369A1' },
};

function fmt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function History() {
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/proposals')
      .then(r => setProposals(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = proposals.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      (p.lead_name || '').toLowerCase().includes(q) ||
      (p.commercial_name || '').toLowerCase().includes(q) ||
      (p.proposal_number || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ background: C.warm, minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: 56, background: C.dark }}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.03em', color: '#fff' }}>
          Firmaway<span style={{ color: C.orange }}>.</span>
        </div>
        <button onClick={() => router.push('/generate')} style={{ background: C.orange, border: 'none', borderRadius: 8, padding: '7px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Nueva propuesta
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink, marginBottom: 4 }}>
              Historial de propuestas
            </h1>
            <p style={{ fontSize: 14, color: C.muted }}>{proposals.length} propuesta{proposals.length !== 1 ? 's' : ''} generada{proposals.length !== 1 ? 's' : ''}</p>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por lead o comercial..."
            style={{
              padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`,
              background: C.bg, fontSize: 13, color: C.ink, width: 260, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = C.orange}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 14 }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 14 }}>
            {search ? 'No hay propuestas que coincidan con la búsqueda.' : 'Todavía no hay propuestas generadas.'}
          </div>
        ) : (
          <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: `4px 4px 0px 0px ${C.border}` }}>
            {/* Header tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr 140px 90px 80px 80px 100px',
              padding: '10px 20px',
              background: C.cardBg,
              borderBottom: `1.5px solid ${C.border}`,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: C.muted,
            }}>
              <div>Propuesta</div>
              <div>Lead</div>
              <div>Comercial</div>
              <div>Paquete</div>
              <div>Urgencia</div>
              <div>Editada</div>
              <div>Fecha</div>
            </div>

            {/* Filas */}
            {filtered.map((p, i) => {
              const pkgColor = PKG_COLOR[p.package] || PKG_COLOR.pro;
              const urgColor = URGENCY_COLORS[p.urgency_score] || URGENCY_COLORS.medio;
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/preview/${p.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr 140px 90px 80px 80px 100px',
                    padding: '13px 20px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                    cursor: 'pointer',
                    alignItems: 'center',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.warm}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, letterSpacing: '-0.01em' }}>
                    {p.proposal_number}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 1 }}>{p.lead_name || '—'}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{p.lead_detail || ''}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.ink }}>{p.commercial_name || '—'}</div>
                  <div>
                    <span style={{
                      display: 'inline-block', padding: '3px 9px', borderRadius: 999,
                      background: pkgColor.bg, border: `1px solid ${pkgColor.border}`,
                      fontSize: 11, fontWeight: 700, color: pkgColor.text,
                    }}>
                      {PKG_LABEL[p.package] || p.package}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block', padding: '3px 9px', borderRadius: 999,
                      background: urgColor.bg, fontSize: 11, fontWeight: 700,
                      color: urgColor.text, textTransform: 'capitalize',
                    }}>
                      {p.urgency_score || '—'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: p.was_edited ? C.orange : C.muted, fontWeight: p.was_edited ? 600 : 400 }}>
                    {p.was_edited ? 'Sí' : 'No'}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{fmt(p.created_at)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
