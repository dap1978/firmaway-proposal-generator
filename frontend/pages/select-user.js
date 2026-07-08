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
  dark:        '#2E3135',
};

const DEFAULT_USERS = [
  { id: 'sebastian', name: 'Sebastián Bedoya', nickname: 'Seba' },
  { id: 'paola',     name: 'Paola Marcano',    nickname: 'Paola' },
  { id: 'daniel',    name: 'Daniel',            nickname: 'Daniel' },
  { id: 'tatiana',   name: 'Tatiana',           nickname: 'Tatiana', language: 'pt' },
  { id: 'ivana',     name: 'Ivana',             nickname: 'Ivana' },
];

// Quién puede firmar cada tipo de propuesta.
const ALLOWED_IDS = {
  llc:        ['paola', 'sebastian', 'ivana', 'daniel'],
  whitelabel: ['daniel', 'tatiana', 'ivana'],
};

const TOOL_COPY = {
  llc: {
    title: '¿Quién sos?',
    subtitle: 'Seleccioná tu nombre para armar la propuesta LLC.',
    allowAdd: true,
  },
  whitelabel: {
    title: '¿Quién firma la propuesta?',
    subtitle: 'Solo estas personas pueden personalizar propuestas whitelabel.',
    allowAdd: false,
  },
};

export default function SelectUser() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');

  const tool = router.query.tool;
  const copy = TOOL_COPY[tool];

  useEffect(() => {
    if (!router.isReady) return;
    if (!copy) { router.replace('/'); return; }

    const allowedIds = ALLOWED_IDS[tool];
    const custom = copy.allowAdd
      ? JSON.parse(localStorage.getItem('fw_custom_users') || '[]')
      : [];

    api.get('/users')
      .then(r => setUsers([...r.data.filter(u => allowedIds.includes(u.id)), ...custom]))
      .catch(() => setUsers([...DEFAULT_USERS.filter(u => allowedIds.includes(u.id)), ...custom]))
      .finally(() => setLoading(false));
  }, [router.isReady, tool]);

  function handleSelect(user) {
    localStorage.setItem('fw_user', JSON.stringify(user));
    router.push(`/generate?tool=${tool}`);
  }

  function handleAddUser() {
    const name = newName.trim();
    const nickname = newNickname.trim() || name.split(' ')[0];
    if (!name) return;

    const newUser = { id: `custom_${Date.now()}`, name, nickname };

    const existing = JSON.parse(localStorage.getItem('fw_custom_users') || '[]');
    const updated = [...existing, newUser];
    localStorage.setItem('fw_custom_users', JSON.stringify(updated));

    setUsers(prev => [...prev, newUser]);
    setNewName('');
    setNewNickname('');
    setShowAddForm(false);
  }

  if (!copy || loading) return (
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
          {tool === 'whitelabel' ? 'Propuesta Whitelabel' : 'Propuesta LLC'}
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 20,
        padding: '36px 40px', boxShadow: `4px 4px 0px 0px ${C.border}`,
        width: '100%', maxWidth: 460,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: C.ink, marginBottom: 6 }}>
          {copy.title}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
          {copy.subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              style={{
                background: C.warm, border: `1.5px solid ${C.border}`, borderRadius: 12,
                padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.15s', boxShadow: `3px 3px 0px 0px ${C.border}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.orange;
                e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${C.orange}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${C.border}`;
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: C.orange, color: '#fff',
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

          {copy.allowAdd && (showAddForm ? (
            <div style={{
              border: `1.5px solid ${C.orange}`, borderRadius: 12, padding: '16px 18px',
              background: C.orangeSoft, boxShadow: `3px 3px 0px 0px ${C.orange}`,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.orange }}>
                Nuevo usuario
              </div>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre completo (ej: Lucía García)"
                style={{ padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.ink, outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border}
                onKeyDown={e => e.key === 'Enter' && handleAddUser()}
              />
              <input
                value={newNickname}
                onChange={e => setNewNickname(e.target.value)}
                placeholder="Apodo para WhatsApp (ej: Lucía) — opcional"
                style={{ padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.ink, outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border}
                onKeyDown={e => e.key === 'Enter' && handleAddUser()}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleAddUser}
                  disabled={!newName.trim()}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 8, cursor: newName.trim() ? 'pointer' : 'not-allowed',
                    background: newName.trim() ? C.orange : 'rgba(49,53,61,0.15)',
                    border: 'none', color: newName.trim() ? '#fff' : C.muted, fontSize: 13, fontWeight: 700,
                  }}
                >
                  Guardar
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewName(''); setNewNickname(''); }}
                  style={{ padding: '9px 16px', borderRadius: 8, cursor: 'pointer', background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted, fontSize: 13 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'transparent', border: `1.5px dashed ${C.border}`, borderRadius: 12,
                padding: '13px 18px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12, color: C.muted, fontSize: 14,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: `1.5px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                +
              </div>
              <span style={{ fontWeight: 500 }}>Agregar nombre nuevo</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => router.push('/')} style={{ marginTop: 20, background: 'transparent', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
        ← Volver
      </button>
    </div>
  );
}
