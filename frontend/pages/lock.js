import { useState } from 'react';
import { useRouter } from 'next/router';

const C = {
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', border: 'rgba(49,53,61,0.12)',
  warm: '#FFFBF5', dark: '#3A4557',
};

export default function Lock() {
  const router = useRouter();
  const [key, setKey]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!key.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });

      if (res.ok) {
        // Redirigir a la ruta original o al inicio
        const destination = router.query.from || '/';
        router.push(destination);
      } else {
        const data = await res.json();
        setError(data.error || 'Clave incorrecta.');
        setKey('');
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.dark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '40px 36px',
        width: 340,
        boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.25)',
        border: `1.5px solid ${C.border}`,
      }}>
        {/* Logo */}
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink, marginBottom: 6 }}>
          Firmaway<span style={{ color: C.orange }}>.</span>
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 32, lineHeight: 1.5 }}>
          Herramienta interna.<br />Acceso solo para el equipo.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              color: C.muted, marginBottom: 7,
            }}>
              Clave de acceso
            </label>
            <input
              type="password"
              value={key}
              onChange={e => { setKey(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 9,
                border: `1.5px solid ${error ? '#EF4444' : C.border}`,
                background: error ? '#FFF5F5' : C.warm,
                fontSize: 15,
                color: C.ink,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = C.orange; }}
              onBlur={e => { if (!error) e.target.style.borderColor = C.border; }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: '#EF4444',
              marginBottom: 12, padding: '6px 10px',
              background: '#FFF5F5', borderRadius: 6,
              border: '1px solid #FCA5A5',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 9,
              background: loading || !key.trim() ? 'rgba(241,90,47,0.35)' : C.orange,
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || !key.trim() ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar →'}
          </button>
        </form>
      </div>
    </div>
  );
}
