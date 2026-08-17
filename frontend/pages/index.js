import { useRouter } from 'next/router';

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

const TOOLS = [
  {
    key: 'llc',
    num: '01',
    title: 'Propuesta LLC',
    sub: 'Para un cliente',
    desc: 'Pegá la transcripción de la llamada y Claude arma la propuesta personalizada.',
    action: (router) => router.push('/select-user?tool=llc'),
  },
  {
    key: 'whitelabel',
    num: '02',
    title: 'Propuesta Whitelabel',
    sub: 'Para un socio',
    desc: 'El mismo template para todos los socios: nombre, logo y precio personalizados.',
    action: (router) => router.push('/select-user?tool=whitelabel'),
  },
  {
    key: 'pitch',
    num: '03',
    title: 'Presentación',
    sub: 'Para usar en la reunión',
    desc: 'Carrusel de slides para compartir pantalla durante la reunión con el lead.',
    action: (router) => router.push('/pitch'),
  },
  {
    key: 'guide',
    num: '04',
    title: 'En la reunión',
    sub: 'Guía para preguntar',
    desc: 'Playbook de discovery por perfil de cliente: preguntas, cuantificación del dolor y notas fiscales.',
    action: (router) => router.push('/guide'),
  },
  {
    key: 'namesearch',
    num: '05',
    title: 'Name Search',
    sub: 'Antes de armar la propuesta',
    desc: 'Verificá que el nombre de la LLC no esté ocupado en el estado elegido.',
    action: () => window.open('https://llc-name-search-production.up.railway.app', '_blank', 'noopener,noreferrer'),
  },
  {
    key: 'conversations',
    num: '06',
    title: 'Conversaciones',
    sub: 'Inteligencia comercial',
    desc: 'Analiza las conversaciones online por colaborador, país de origen, intención de compra y nivel de frustración.',
    action: () => window.open('https://web-production-0cb8e.up.railway.app/', '_blank', 'noopener,noreferrer'),
  },
  {
    key: 'politicas-billeteras',
    num: '07',
    title: 'Políticas billeteras',
    sub: 'Info comercial para ayudarte',
    desc: 'Exposición informativa y trato de la LLC por mercado.',
    action: (router) => router.push('/interno/politicas-billeteras'),
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: C.warm, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      {/* Logo */}
      <div style={{ marginBottom: 44, textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.04em', color: C.ink }}>
          Firmaway<span style={{ color: C.orange }}>.</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginTop: 6 }}>
          Herramientas comerciales
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 20, justifyContent: 'center' }}>
        {TOOLS.map(tool => (
          <button
            key={tool.key}
            onClick={() => tool.action(router)}
            style={{
              width: 280, textAlign: 'left', cursor: 'pointer',
              background: C.cardBg, border: `1.5px solid ${C.ink}`, borderRadius: 16,
              padding: '28px 24px', boxShadow: `4px 4px 0px 0px ${C.ink}`,
              transition: 'all 0.15s', fontFamily: 'inherit', display: 'flex', flexDirection: 'column',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.orange;
              e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${C.orange}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.ink;
              e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${C.ink}`;
            }}
          >
            <div style={{ fontSize: 13, lineHeight: 1.2, fontWeight: 800, color: C.orange, letterSpacing: '0.05em', marginBottom: 16 }}>{tool.num}</div>
            <div style={{ fontSize: 19, lineHeight: 1.2, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {tool.title}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.2, fontWeight: 600, letterSpacing: '0.01em', color: C.orange, marginBottom: 14 }}>
              {tool.sub}
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
              {tool.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
