import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../api';

const C = {
  bg:          '#FFFFFF',
  warm:        '#FFFBF5',
  cardBg:      '#FEF1E0',
  ink:         '#31353D',
  muted:       'rgba(49,53,61,0.45)',
  orange:      '#F15A2F',
  orangeSoft:  '#FDEEE9',
  border:      'rgba(49,53,61,0.12)',
  dark:        '#3A4557',
};

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si ya hay usuario guardado, ir directo a /generate
    const saved = localStorage.getItem('fw_user');
    if (saved) {
      router.replace('/generate');
      return;
    }
    api.get('/users')
      .then(r => setUsers(r.data))
      .catch(() => setUsers([
        { id: 'sebastian', name: 'Sebastián Bedoya', nickname: 'Seba' },
        { id: 'paola',     name: 'Paola Marcano',    nickname: 'Paola' },
        { id: 'daniel',    name: 'Daniel',            nickname: 'Daniel' },
        { id: 'tatiana',   name: 'Tatiana',           nickname: 'Tatiana' },
        { id: 'ivana',     name: 'Ivana',             nickname: 'Ivana' },
      ]))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(user) {
    localStorage.setItem('fw_user', JSON.stringify(user));
    router.push('/generate');
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.warm }}>
      <div style={{ color: C.muted, fontSize: 14 }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.warm, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.04em', color: C.ink }}>
          Firmaway<span style={{ color: C.orange }}>.</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginTop: 6 }}>
          Generador de Propuestas
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: C.bg,
        border: `1.5px solid ${C.border}`,
        borderRadius: 20,
        padding: '36px 40px',
        boxShadow: `4px 4px 0px 0px ${C.border}`,
        width: '100%',
        maxWidth: 460,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: C.ink, marginBottom: 6 }}>
          ¿Quién sos?
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
          Seleccioná tu nombre para continuar.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              style={{
                background: selected?.id === user.id ? C.orangeSoft : C.warm,
                border: `1.5px solid ${selected?.id === user.id ? C.orange : C.border}`,
                borderRadius: 12,
                padding: '14px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
                boxShadow: selected?.id === user.id ? `3px 3px 0px 0px ${C.orange}` : `3px 3px 0px 0px ${C.border}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.orange;
                e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${C.orange}`;
              }}
              onMouseLeave={e => {
                if (selected?.id !== user.id) {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${C.border}`;
                }
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: C.orange, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>
                {user.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{user.name}</div>
                {user.language === 'pt' && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Propuestas en português</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
