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

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'hace menos de 1h';
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

export default function History() {
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [reportCommercial, setReportCommercial] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/proposals'),
      api.get('/proposals/stats'),
      api.get('/users'),
    ]).then(([pRes, sRes, uRes]) => {
      setProposals(pRes.data);
      setStats(sRes.data);
      setUsers(uRes.data);
    }).finally(() => setLoading(false));
  }, []);

  async function handleDownloadReport() {
    setReportLoading(true);
    try {
      const params = {};
      if (reportMonth) params.month = reportMonth;
      if (reportCommercial) params.commercial = reportCommercial;
      const response = await api.get('/proposals/report', { params: { ...params, format: 'xlsx' }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-propuestas-llc${reportMonth ? `-${reportMonth}` : ''}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el reporte. Intentá de nuevo.');
    } finally {
      setReportLoading(false);
    }
  }

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

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Resumen por colaborador */}
        {stats.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 12 }}>
              Resumen por colaborador
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.commercial_name} style={{
                  background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12,
                  padding: '14px 20px', boxShadow: `4px 4px 0px 0px ${C.border}`,
                  minWidth: 180,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
                    {s.commercial_name}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>{s.total}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>generadas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.orange, letterSpacing: '-0.03em' }}>{s.sent}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>enviadas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#0369A1', letterSpacing: '-0.03em' }}>{s.leads_opened}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>leads vieron</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reporte comercial (LLC) */}
        <div style={{
          background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12,
          padding: '16px 20px', boxShadow: `4px 4px 0px 0px ${C.border}`, marginBottom: 32,
          display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ marginRight: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: 2 }}>
              Reporte comercial
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>Listado de propuestas LLC enviadas — para seguimiento en Wati / HubSpot.</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>Mes</label>
            <input
              type="month"
              value={reportMonth}
              onChange={e => setReportMonth(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.warm, fontSize: 13, color: C.ink, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>Comercial</label>
            <select
              value={reportCommercial}
              onChange={e => setReportCommercial(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.warm, fontSize: 13, color: C.ink, outline: 'none' }}
            >
              <option value="">Todos</option>
              {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={reportLoading}
            style={{
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: reportLoading ? 'rgba(49,53,61,0.15)' : C.orange,
              color: reportLoading ? C.muted : '#fff',
              fontSize: 13, fontWeight: 700, cursor: reportLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {reportLoading ? 'Generando...' : 'Descargar Excel'}
          </button>
        </div>

        {/* Header tabla */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
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
            {search ? 'No hay propuestas que coincidan.' : 'Todavía no hay propuestas generadas.'}
          </div>
        ) : (
          <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: `4px 4px 0px 0px ${C.border}` }}>
            {/* Header columnas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 130px 80px 90px 110px 100px',
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
              <div>Enviada</div>
              <div>Aperturas</div>
              <div>Fecha</div>
            </div>

            {/* Filas */}
            {filtered.map((p, i) => {
              const pkgColor = PKG_COLOR[p.package] || PKG_COLOR.pro;
              const sent = p.status === 'sent';
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/preview/${p.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 130px 80px 90px 110px 100px',
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
                  <div style={{ fontSize: 12, color: sent ? '#15803D' : C.muted, fontWeight: sent ? 600 : 400 }}>
                    {sent ? `✓ ${fmt(p.sent_at)}` : '—'}
                  </div>
                  <div>
                    {p.view_count > 0 ? (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>
                          {p.view_count} {p.view_count === 1 ? 'vez' : 'veces'}
                        </div>
                        <div style={{ fontSize: 10, color: C.muted }}>{timeAgo(p.last_viewed_at)}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: C.muted }}>—</div>
                    )}
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
