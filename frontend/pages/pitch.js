import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', cardBg: '#FEF1E0',
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9',
  border: 'rgba(49,53,61,0.12)', dark: '#2E3135',
};

const BG = {
  dark:   { bg: C.dark, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.15)' },
  cream:  { bg: C.warm, ink: C.ink, muted: C.muted, border: C.border },
};

// ── Contenido bilingüe (ES / PT) ────────────────────────────────────────────
const CONTENT = {
  es: {
    nav: { salir: '✕ Salir' },
    cover: {
      headline: 'Tu empresa en Estados Unidos.',
      subtitle: 'Formación de LLCs, EIN y cuenta bancaria. De principio a fin, en un solo lugar.',
    },
    stats: {
      eyebrow: 'Respaldo',
      title: 'Los números hablan solos.',
      items: [
        { n: '2.000+', l: 'LLCs formadas' },
        { n: '4.9',    l: 'Calificación promedio' },
        { n: '4+',     l: 'Años de experiencia' },
        { n: '24h',    l: 'Tiempo promedio de respuesta' },
      ],
    },
    packages: {
      eyebrow: 'Paquetes',
      title: 'Un paquete para cada etapa del negocio.',
      featured: 'Más elegido',
      features: [
        'Constitución de la LLC',
        'Cuenta bancaria Mercury',
        'EIN / Tax ID federal',
        'Registered Agent 1 año',
        'Operating Agreement',
        'Soporte gratis e ilimitado',
        'Obligaciones año 1 incluidas',
      ],
      items: [
        { name: 'Solo LLC', price: '495',   sub: 'Sin cuenta bancaria',          included: [true, false, true, true, true, true, false] },
        { name: 'Starter',  price: '499',   sub: 'Nuevo México · 1 socio',       included: [true, true,  true, true, true, true, false] },
        { name: 'Pro',      price: '645',   sub: 'Cualquier estado · 2+ socios', included: [true, true,  true, true, true, true, false], featured: true },
        { name: 'All In',   price: '1.199', sub: 'Todo incluido',                included: [true, true,  true, true, true, true, true]  },
      ],
    },
    states: {
      eyebrow: 'Estados',
      title: 'Elegimos el estado según tu negocio.',
      items: [
        { name: 'Wyoming',      fee: '$62/año',         note: 'Privacidad de socios. El más recomendado para Pro y All In.' },
        { name: 'Nuevo México', fee: 'Sin fee estatal', note: 'El más económico. Ideal para socio único.' },
        { name: 'Delaware',     fee: '$300/año',        note: 'Preferido por startups con inversores o venture capital.' },
        { name: 'Florida',      fee: '$138,75/año',     note: 'Para negocios con operación física en el estado.' },
        { name: 'Texas',        fee: 'Sin fee estatal', note: 'Para quienes ya operan en Texas.' },
      ],
    },
    timeline: {
      eyebrow: 'Proceso',
      title: 'De la firma a la cuenta bancaria en 15 días.',
      items: [
        { n: '1', title: 'Confirmación de datos', days: 'Día 1',        note: 'Completamos el perfil y validamos la documentación.' },
        { n: '2', title: 'Formación de la LLC',   days: 'Días 2 a 5',   note: 'Presentamos la constitución en el estado elegido.' },
        { n: '3', title: 'Obtención del EIN',     days: 'Días 5 a 10',  note: 'Gestionamos el Tax ID federal ante el IRS.' },
        { n: '4', title: 'Apertura de Mercury',   days: 'Días 10 a 15', note: 'Activamos la cuenta bancaria y la tarjeta de débito Visa.' },
      ],
    },
    mercury: {
      eyebrow: 'Banca',
      title: 'Operamos con Mercury.',
      body: 'El banco elegido por startups y empresas remotas en todo el mundo. Así se ve la cuenta que vas a operar.',
      btn: 'Ver demo en vivo',
      features: [
        'Tarjeta de débito Visa física y virtual.',
        'Transferencias ACH y SWIFT para operar globalmente.',
        'Apertura 100% remota, sin viajar a Estados Unidos.',
        'Conexión directa vía API con Mercury en los planes Pro y All In.',
      ],
    },
    why: {
      eyebrow: 'Diferencial',
      title: 'No es solo abrir una LLC online.',
      items: [
        'Soporte gratis e ilimitado en todos los paquetes.',
        'Personas reales respondiendo tus consultas, no bots.',
        'EIN gestionado directamente ante el IRS.',
        'Registered Agent incluido durante el primer año.',
        'Operating Agreement incluido en todos los paquetes.',
      ],
    },
    closing: {
      testimonialsLabel: 'Lo que dicen nuestros clientes',
      tagline: 'Tu empresa en Estados Unidos.',
      testimonials: [
        { text: 'Llevamos varios años trabajando con Firmaway y la experiencia ha sido excelente desde el primer día. Nos guiaron en cada paso con profesionalismo y dedicación.', author: 'Gerardo P.', tag: 'QA' },
        { text: 'Atención 10 puntos, efectividad muy complaciente. Sin dudas la mejor opción a día de hoy para abrir y emprender tu LLC en Estados Unidos.', author: 'Guido B.', tag: 'AR' },
        { text: 'El proceso fue simple y rápido. En pocas semanas ya tenía mi LLC y mi cuenta bancaria funcionando.', author: 'Adriana Z.', tag: 'CO' },
      ],
    },
  },
  pt: {
    nav: { salir: '✕ Sair' },
    cover: {
      headline: 'Sua empresa nos Estados Unidos.',
      subtitle: 'Formação de LLCs, EIN e conta bancária. Do início ao fim, em um só lugar.',
    },
    stats: {
      eyebrow: 'Respaldo',
      title: 'Os números falam por si.',
      items: [
        { n: '2.000+', l: 'LLCs formadas' },
        { n: '4.9',    l: 'Avaliação média' },
        { n: '4+',     l: 'Anos de experiência' },
        { n: '24h',    l: 'Tempo médio de resposta' },
      ],
    },
    packages: {
      eyebrow: 'Pacotes',
      title: 'Um pacote para cada etapa do negócio.',
      featured: 'Mais escolhido',
      features: [
        'Constituição da LLC',
        'Conta bancária Mercury',
        'EIN / Tax ID federal',
        'Registered Agent por 1 ano',
        'Operating Agreement',
        'Suporte gratuito e ilimitado',
        'Obrigações do ano 1 incluídas',
      ],
      items: [
        { name: 'Solo LLC', price: '495',   sub: 'Sem conta bancária',           included: [true, false, true, true, true, true, false] },
        { name: 'Starter',  price: '499',   sub: 'Novo México · 1 sócio',        included: [true, true,  true, true, true, true, false] },
        { name: 'Pro',      price: '645',   sub: 'Qualquer estado · 2+ sócios',  included: [true, true,  true, true, true, true, false], featured: true },
        { name: 'All In',   price: '1.199', sub: 'Tudo incluído',                included: [true, true,  true, true, true, true, true]  },
      ],
    },
    states: {
      eyebrow: 'Estados',
      title: 'Escolhemos o estado de acordo com o seu negócio.',
      items: [
        { name: 'Wyoming',      fee: '$62/ano',         note: 'Privacidade dos sócios. O mais recomendado para Pro e All In.' },
        { name: 'Novo México',  fee: 'Sem taxa estadual', note: 'O mais econômico. Ideal para sócio único.' },
        { name: 'Delaware',     fee: '$300/ano',        note: 'Preferido por startups com investidores ou venture capital.' },
        { name: 'Flórida',      fee: '$138,75/ano',     note: 'Para negócios com operação física no estado.' },
        { name: 'Texas',        fee: 'Sem taxa estadual', note: 'Para quem já opera no Texas.' },
      ],
    },
    timeline: {
      eyebrow: 'Processo',
      title: 'Da assinatura à conta bancária em 15 dias.',
      items: [
        { n: '1', title: 'Confirmação dos dados', days: 'Dia 1',        note: 'Completamos o perfil e validamos a documentação.' },
        { n: '2', title: 'Formação da LLC',        days: 'Dias 2 a 5',   note: 'Apresentamos a constituição no estado escolhido.' },
        { n: '3', title: 'Obtenção do EIN',         days: 'Dias 5 a 10',  note: 'Gerenciamos o Tax ID federal junto ao IRS.' },
        { n: '4', title: 'Abertura da Mercury',     days: 'Dias 10 a 15', note: 'Ativamos a conta bancária e o cartão de débito Visa.' },
      ],
    },
    mercury: {
      eyebrow: 'Banco',
      title: 'Operamos com a Mercury.',
      body: 'O banco escolhido por startups e empresas remotas em todo o mundo. É assim que fica a conta que você vai operar.',
      btn: 'Ver demo ao vivo',
      features: [
        'Cartão de débito Visa físico e virtual.',
        'Transferências ACH e SWIFT para operar globalmente.',
        'Abertura 100% remota, sem viajar aos Estados Unidos.',
        'Conexão direta via API com a Mercury nos planos Pro e All In.',
      ],
    },
    why: {
      eyebrow: 'Diferencial',
      title: 'Não é só abrir uma LLC online.',
      items: [
        'Suporte gratuito e ilimitado em todos os pacotes.',
        'Pessoas reais respondendo suas dúvidas, não bots.',
        'EIN gerenciado diretamente junto ao IRS.',
        'Registered Agent incluído durante o primeiro ano.',
        'Operating Agreement incluído em todos os pacotes.',
      ],
    },
    closing: {
      testimonialsLabel: 'O que nossos clientes dizem',
      tagline: 'Sua empresa nos Estados Unidos.',
      testimonials: [
        { text: 'Trabalhamos com a Firmaway há vários anos e a experiência foi excelente desde o primeiro dia. Nos guiaram em cada etapa com profissionalismo e dedicação.', author: 'Gerardo P.', tag: 'QA' },
        { text: 'Atendimento nota 10, muito eficiente. Sem dúvida a melhor opção hoje para abrir e empreender sua LLC nos Estados Unidos.', author: 'Guido B.', tag: 'AR' },
        { text: 'O processo foi simples e rápido. Em poucas semanas minha LLC e minha conta bancária já estavam funcionando.', author: 'Adriana Z.', tag: 'CO' },
      ],
    },
  },
};

// ── Componentes base reutilizables por slide ───────────────────────────────
function Eyebrow({ children, theme, center }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.ink, opacity: 0.6, marginBottom: 14, textAlign: center ? 'center' : 'left', width: center ? '100%' : 'auto' }}>
      {children}
    </div>
  );
}

function Title({ children, theme, size = 42, center }) {
  return (
    <h1 style={{
      fontSize: size, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.08, color: theme.ink,
      marginBottom: 20, maxWidth: center ? 720 : 780, textAlign: center ? 'center' : 'left',
      marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0,
    }}>
      {children}
    </h1>
  );
}

// ── Slides ──────────────────────────────────────────────────────────────────
function SlideCover({ theme, lang }) {
  const t = CONTENT[lang].cover;
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/liberty.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '65% 0%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(46,49,53,0.97) 0%, rgba(46,49,53,0.88) 42%, rgba(46,49,53,0.65) 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: 540 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: theme.ink, opacity: 0.7, marginBottom: 28 }}>
          Firmaway<span style={{ color: C.orange }}>.</span>
        </div>
        <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.08, color: theme.ink }}>
          {t.headline}
        </div>
        <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', marginTop: 24, lineHeight: 1.5 }}>
          {t.subtitle}
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 20, right: 28, fontSize: 10, color: 'rgba(255,255,255,0.3)', zIndex: 1 }}>
        Foto: Elcobbola / Wikimedia Commons (CC BY-SA 3.0)
      </div>
    </div>
  );
}

function SlideStats({ theme, lang }) {
  const t = CONTENT[lang].stats;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Eyebrow theme={theme} center>{t.eyebrow}</Eyebrow>
      <div style={{ fontSize: 34, fontWeight: 800, color: theme.ink, marginBottom: 48, letterSpacing: '-0.03em', textAlign: 'center' }}>
        {t.title}
      </div>
      <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
        {t.items.map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', color: C.orange, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.muted, marginTop: 10, maxWidth: 140 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePackages({ theme, lang }) {
  const t = CONTENT[lang].packages;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Eyebrow theme={theme}>{t.eyebrow}</Eyebrow>
      <Title theme={theme} size={34}>{t.title}</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 8 }}>
        {t.items.map(p => (
          <div key={p.name} style={{
            display: 'flex', flexDirection: 'column',
            background: p.featured ? C.orange : C.bg,
            border: `1.5px solid ${p.featured ? C.orange : C.border}`,
            borderRadius: 16, padding: '20px 16px',
            boxShadow: `4px 4px 0px 0px ${p.featured ? C.ink : C.border}`,
          }}>
            {p.featured && (
              <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '3px 8px', borderRadius: 999, marginBottom: 10, alignSelf: 'flex-start' }}>
                {t.featured}
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 700, color: p.featured ? '#fff' : C.ink, marginBottom: 2, letterSpacing: '-0.01em' }}>{p.name}</div>
            <div style={{ fontSize: 10.5, color: p.featured ? 'rgba(255,255,255,0.8)' : C.muted, marginBottom: 10 }}>{p.sub}</div>
            <div style={{ fontSize: 23, fontWeight: 800, color: p.featured ? '#fff' : C.orange, marginBottom: 14, letterSpacing: '-0.02em' }}>USD {p.price}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: `1px solid ${p.featured ? 'rgba(255,255,255,0.25)' : C.border}`, paddingTop: 12 }}>
              {t.features.map((feat, i) => {
                const ok = p.included[i];
                return (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: ok ? (p.featured ? '#fff' : C.orange) : (p.featured ? 'rgba(255,255,255,0.4)' : 'rgba(49,53,61,0.3)'), width: 12, flexShrink: 0 }}>
                      {ok ? '✓' : '–'}
                    </span>
                    <span style={{ fontSize: 10.5, lineHeight: 1.3, color: p.featured ? 'rgba(255,255,255,0.9)' : (ok ? C.ink : C.muted) }}>{feat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideStates({ theme, lang }) {
  const t = CONTENT[lang].states;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Eyebrow theme={theme} center>{t.eyebrow}</Eyebrow>
      <Title theme={theme} size={38} center>{t.title}</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32, maxWidth: 940, width: '100%' }}>
        {t.items.map(s => (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', gap: 24,
            background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '24px 30px',
            boxShadow: `3px 3px 0px 0px ${C.border}`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, width: 150, flexShrink: 0, letterSpacing: '-0.01em' }}>{s.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, width: 130, flexShrink: 0 }}>{s.fee}</div>
            <div style={{ fontSize: 15, color: '#4B505A', lineHeight: 1.45, fontWeight: 500 }}>{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideTimeline({ theme, lang }) {
  const t = CONTENT[lang].timeline;
  const n = t.items.length;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Eyebrow theme={theme}>{t.eyebrow}</Eyebrow>
      <Title theme={theme} size={38}>{t.title}</Title>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, marginTop: 20, position: 'relative' }}>
        {t.items.map(item => (
          <div key={item.n} style={{ position: 'relative', paddingRight: 24 }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{item.n}</span>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.orange, marginBottom: 6 }}>{item.days}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink, marginBottom: 6, letterSpacing: '-0.01em' }}>{item.title}</div>
              <div style={{ fontSize: 12.5, color: theme.muted, lineHeight: 1.45 }}>{item.note}</div>
            </div>
          </div>
        ))}
        {/* Los nodos están pegados al borde izquierdo de su columna (alignItems: flex-start),
            no centrados. El centro real del círculo (40px) queda a 20px del borde de la
            columna, así que el punto de partida es un valor fijo, no un porcentaje. */}
        <div style={{
          position: 'absolute', top: 20, height: 2, background: theme.border, zIndex: 0,
          left: 20,
          width: `${((n - 1) / n) * 100}%`,
        }} />
        <div style={{
          position: 'absolute', top: 20, height: 2, zIndex: 2, pointerEvents: 'none',
          left: 20,
          width: `${((n - 1) / n) * 100}%`,
        }}>
          <span className="flow-dot" style={{ animationDelay: '0s' }} />
          <span className="flow-dot" style={{ animationDelay: '3s' }} />
        </div>
      </div>
      <style jsx>{`
        .flow-dot {
          position: absolute;
          top: 50%;
          left: 0%;
          width: 7px;
          height: 7px;
          margin-top: -3.5px;
          border-radius: 50%;
          background: #F15A2F;
          box-shadow: 0 0 7px rgba(241,90,47,0.9);
          opacity: 0;
          animation: pitchFlow 6s linear infinite;
        }
        @keyframes pitchFlow {
          0%   { left: 0%;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function SlideMercury({ theme, lang }) {
  const t = CONTENT[lang].mercury;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Eyebrow theme={theme}>{t.eyebrow}</Eyebrow>
      <Title theme={theme} size={38}>{t.title}</Title>
      <div style={{ display: 'flex', gap: 40, alignItems: 'center', minWidth: 0, maxWidth: 1140, width: '100%' }}>
        <div style={{ flex: '1.5 1 0', minWidth: 0, background: C.bg, border: `1.5px solid ${C.ink}`, borderRadius: 16, padding: 10, boxShadow: `5px 5px 0px 0px ${C.ink}`, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/mercury-demo.png" alt="Mercury" style={{ width: '100%', display: 'block', borderRadius: 10 }} />
        </div>
        <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: 340 }}>
          <div style={{ fontSize: 13.5, color: theme.muted, marginBottom: 20, lineHeight: 1.5 }}>
            {t.body}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 26 }}>
            {t.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 20, height: 20, background: C.orangeSoft, border: `1.5px solid ${C.orange}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg viewBox="0 0 10 8" fill="none" width="10" height="8"><path d="M1 4L3.5 6.5L9 1" stroke="#F15A2F" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.4 }}>{f}</div>
              </div>
            ))}
          </div>
          <a href="https://demo.mercury.com/dashboard" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', background: C.orange, color: '#fff', fontSize: 13, fontWeight: 700,
            padding: '12px 22px', borderRadius: 10, textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            {t.btn} →
          </a>
        </div>
      </div>
    </div>
  );
}

function SlideWhy({ theme, lang }) {
  const t = CONTENT[lang].why;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Eyebrow theme={theme} center>{t.eyebrow}</Eyebrow>
      <Title theme={theme} size={38} center>{t.title}</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8, maxWidth: 720, width: '100%' }}>
        {t.items.map(w => (
          <div key={w} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14,
            padding: '17px 22px', boxShadow: `3px 3px 0px 0px ${C.border}`,
          }}>
            <div style={{ width: 32, height: 32, background: C.orangeSoft, border: `1.5px solid ${C.orange}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 10 8" fill="none" width="12" height="10"><path d="M1 4L3.5 6.5L9 1" stroke="#F15A2F" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontSize: 16, color: C.ink, lineHeight: 1.4, fontWeight: 600 }}>{w}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideClosing({ theme, lang }) {
  const t = CONTENT[lang].closing;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/liberty-torch.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 12%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(46,49,53,0.9)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Eyebrow theme={theme} center>{t.testimonialsLabel}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 6, marginBottom: 44 }}>
          {t.testimonials.map(item => (
            <div key={item.author} style={{
              display: 'flex', flexDirection: 'column',
              background: C.bg, borderTop: `4px solid ${C.orange}`, borderRadius: 12,
              padding: '26px 22px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            }}>
              <div style={{ fontSize: 14, color: C.orange, marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: C.ink, fontWeight: 500, marginBottom: 18, flex: 1 }}>"{item.text}"</div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted }}>{item.author} · {item.tag}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.035em', color: theme.ink, marginBottom: 10 }}>
            Firmaway<span style={{ color: C.orange }}>.</span>
          </div>
          <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', maxWidth: 460, margin: '0 auto', lineHeight: 1.5 }}>
            {t.tagline}
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { key: 'cover',    theme: 'dark',   Component: SlideCover },
  { key: 'stats',    theme: 'dark',   Component: SlideStats },
  { key: 'packages', theme: 'cream',  Component: SlidePackages },
  { key: 'states',   theme: 'cream',  Component: SlideStates },
  { key: 'timeline', theme: 'dark',   Component: SlideTimeline },
  { key: 'mercury',  theme: 'cream',  Component: SlideMercury },
  { key: 'why',      theme: 'cream',  Component: SlideWhy },
  { key: 'closing',  theme: 'dark',   Component: SlideClosing },
];

export default function Pitch() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [lang, setLang] = useState('es');
  const total = SLIDES.length;

  const goTo = useCallback((i) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
  }, [total]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      else if (e.key === 'Escape') { router.push('/generate'); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, goTo, router]);

  const slide = SLIDES[index];
  const theme = BG[slide.theme];
  const Content = slide.Component;
  const navSalir = CONTENT[lang].nav.salir;

  return (
    <div style={{ height: '100vh', width: '100vw', background: theme.bg, position: 'relative', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif', transition: 'background 0.3s ease' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 40px', zIndex: 10 }}>
        <button onClick={() => router.push('/generate')} style={{ background: 'transparent', border: 'none', color: theme.muted, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          {navSalir}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(128,128,128,0.15)', borderRadius: 8, padding: 3 }}>
            {[{ value: 'es', label: 'ES' }, { value: 'pt', label: 'PT' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setLang(opt.value)}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11.5, fontWeight: 700,
                  background: lang === opt.value ? C.orange : 'transparent',
                  color: lang === opt.value ? '#fff' : theme.muted,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: '0.05em' }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Click zones para avanzar / retroceder */}
      <div onClick={() => goTo(index - 1)} style={{ position: 'absolute', top: 0, left: 0, width: '20%', height: '100%', cursor: index > 0 ? 'pointer' : 'default', zIndex: 5 }} />
      <div onClick={() => goTo(index + 1)} style={{ position: 'absolute', top: 0, right: 0, width: '20%', height: '100%', cursor: index < total - 1 ? 'pointer' : 'default', zIndex: 5 }} />

      {/* Contenido del slide */}
      <div key={`${slide.key}-${lang}`} style={{ height: '100%', padding: '80px 90px 90px', animation: 'pitchFadeIn 0.4s ease' }}>
        <Content theme={theme} lang={lang} />
      </div>

      {/* Flechas */}
      <button
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        style={{
          position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', border: `1.5px solid ${theme.border}`,
          background: 'transparent', color: theme.ink, fontSize: 18, cursor: index === 0 ? 'default' : 'pointer',
          opacity: index === 0 ? 0.25 : 0.8, zIndex: 10,
        }}
      >
        ‹
      </button>
      <button
        onClick={() => goTo(index + 1)}
        disabled={index === total - 1}
        style={{
          position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', border: `1.5px solid ${theme.border}`,
          background: 'transparent', color: theme.ink, fontSize: 18, cursor: index === total - 1 ? 'default' : 'pointer',
          opacity: index === total - 1 ? 0.25 : 0.8, zIndex: 10,
        }}
      >
        ›
      </button>

      {/* Indicador de puntos */}
      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10 }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => goTo(i)}
            style={{
              width: i === index ? 22 : 7, height: 7, borderRadius: 999,
              border: 'none', cursor: 'pointer', padding: 0,
              background: i === index ? C.orange : theme.border,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pitchFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
