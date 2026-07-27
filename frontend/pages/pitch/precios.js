import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../api';

const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9', border: 'rgba(49,53,61,0.12)', dark: '#3A4557',
};

const ALLOWED = [
  { id: 'daniel', name: 'Daniel' },
  { id: 'ivana',  name: 'Ivana' },
];

const FIELDS_STATES = [
  { key: 'obligUsd',    label: 'Obligación anual base', hint: null },
  { key: 'wyoming',     label: 'Wyoming',      hint: 'fee estatal adicional' },
  { key: 'nuevoMexico', label: 'Nuevo México', hint: 'fee estatal adicional' },
  { key: 'delaware',    label: 'Delaware',     hint: 'fee estatal adicional' },
  { key: 'florida',     label: 'Florida',      hint: 'fee estatal adicional' },
  { key: 'texas',       label: 'Texas',        hint: 'fee estatal adicional' },
];

const FIELDS_PACKAGES = [
  { key: 'pkgSolo',    label: 'Solo LLC' },
  { key: 'pkgStarter', label: 'Starter' },
  { key: 'pkgPro',     label: 'Pro' },
  { key: 'pkgAllin',   label: 'All In' },
];

function inputStyle(accent) {
  return {
    border: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 700,
    color: C.ink, padding: '9px 0', width: '100%', outline: 'none', fontFamily: 'inherit',
  };
}

function MoneyField({ label, hint, value, onChange, prefix, wide }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: hint ? C.bg : C.warm, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, width: wide ? 170 : 140, flexShrink: 0 }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: C.muted, flex: 1 }}>{hint}</div>}
      <div style={{ display: 'flex', alignItems: 'center', background: C.warm, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 10px', width: 110, marginLeft: hint ? 0 : 'auto' }}>
        <span style={{ fontSize: 12.5, color: C.muted, marginRight: 3 }}>{prefix}</span>
        <input type="number" step="0.01" value={value} onChange={e => onChange(e.target.value)} style={inputStyle()} />
      </div>
    </div>
  );
}

export default function PitchPrecios() {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined = todavía no se resolvió
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('fw_pricing_user');
    setUser(stored && ALLOWED.some(u => u.id === stored) ? stored : null);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/pricing').then(r => setForm(r.data)).catch(() => setError('No se pudieron cargar los precios.'));
  }, [user]);

  function pick(id) {
    localStorage.setItem('fw_pricing_user', id);
    setUser(id);
  }

  function setField(key, raw) {
    setForm(f => ({ ...f, [key]: raw === '' ? '' : Number(raw) }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/pricing', form);
      setForm(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  if (user === undefined) return null;

  if (user === null) {
    return (
      <div style={{ minHeight: '100vh', background: C.warm, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", system-ui, sans-serif', padding: 16 }}>
        <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '36px 40px', boxShadow: `4px 4px 0px 0px ${C.border}`, width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: C.ink, marginBottom: 6 }}>¿Quién sos?</h1>
          <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 24 }}>Solo Daniel e Ivana pueden editar los precios del pitch.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ALLOWED.map(u => (
              <button key={u.id} onClick={() => pick(u.id)} style={{
                background: C.warm, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '13px 18px',
                cursor: 'pointer', textAlign: 'left', fontSize: 15, fontWeight: 600, color: C.ink,
                boxShadow: `3px 3px 0px 0px ${C.border}`,
              }}>
                {u.name}
              </button>
            ))}
          </div>
          <button onClick={() => router.push('/pitch')} style={{ marginTop: 20, background: 'transparent', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ minHeight: '100vh', background: C.warm, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", system-ui, sans-serif', gap: 12 }}>
        <div style={{ color: C.muted, fontSize: 14 }}>{error || 'Cargando...'}</div>
        {error && (
          <button onClick={() => router.push('/pitch')} style={{ background: 'transparent', border: 'none', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ← Volver al pitch
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ background: C.dark, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>
          Firmaway<span style={{ color: C.orange }}>.</span>
          <span style={{ fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginLeft: 10 }}>Precios del pitch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.orange, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ALLOWED.find(u => u.id === user).name.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{ALLOWED.find(u => u.id === user).name}</span>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>Precios del pitch</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
            Se usan en las slides de Paquetes y Estados. La versión en portugués se calcula sola con el tipo de cambio.
          </div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.orange, marginBottom: 10 }}>
          Paquetes LLC (USD)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {FIELDS_PACKAGES.map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 12, color: C.ink, fontWeight: 600, marginBottom: 6 }}>{f.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', background: C.warm, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '0 12px' }}>
                <span style={{ fontSize: 13, color: C.muted, marginRight: 4 }}>$</span>
                <input type="number" step="0.01" value={form[f.key]} onChange={e => setField(f.key, e.target.value)} style={{ ...inputStyle(), fontSize: 14, padding: '10px 0' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.orange, marginBottom: 10 }}>
          Estados (USD)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {FIELDS_STATES.map(f => (
            <MoneyField key={f.key} label={f.label} hint={f.hint} value={form[f.key]} onChange={v => setField(f.key, v)} prefix="$" wide={!f.hint} />
          ))}
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.orange, marginBottom: 10 }}>
          Portugués (auto)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.orangeSoft, border: `1.5px solid rgba(241,90,47,0.3)`, borderRadius: 10, padding: '12px 14px', marginBottom: 28 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, width: 140, flexShrink: 0 }}>Tipo de cambio</div>
          <div style={{ fontSize: 12, color: 'rgba(49,53,61,0.55)', flex: 1 }}>USD a BRL — todos los precios en portugués se calculan con este número</div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `1px solid rgba(241,90,47,0.4)`, borderRadius: 8, padding: '0 10px', width: 110 }}>
            <span style={{ fontSize: 12.5, color: C.muted, marginRight: 3 }}>R$</span>
            <input type="number" step="0.01" value={form.exchangeRate} onChange={e => setField('exchangeRate', e.target.value)} style={inputStyle()} />
          </div>
        </div>

        {error && <div style={{ color: '#b3261e', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={() => router.push('/pitch')} style={{ background: '#fff', border: `1.5px solid ${C.border}`, color: C.ink, fontSize: 13, fontWeight: 700, padding: '11px 20px', borderRadius: 10, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            background: C.orange, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            padding: '11px 20px', borderRadius: 10, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar precios'}
          </button>
        </div>
      </div>
    </div>
  );
}
