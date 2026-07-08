const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../templates/proposal.html');
const WHITELABEL_TEMPLATE_PATH = path.join(__dirname, '../templates/proposal_whitelabel.html');
const MERCURY_IMG_PATH = path.join(__dirname, '../templates/assets/mercury-demo.png');

// Imagen de Mercury embebida como data URI: se ve igual en la web y en el PDF (Puppeteer),
// sin depender de un servidor externo. Se lee una sola vez y se cachea en memoria.
let _mercuryImgCache = null;
function mercuryImageDataUri() {
  if (_mercuryImgCache !== null) return _mercuryImgCache;
  try {
    const buf = fs.readFileSync(MERCURY_IMG_PATH);
    _mercuryImgCache = `data:image/png;base64,${buf.toString('base64')}`;
  } catch (err) {
    _mercuryImgCache = '';
  }
  return _mercuryImgCache;
}

// Textos fijos de la propuesta whitelabel (mismo template para todos los socios).
// Lo único que se personaliza es nombre, logo y precio.
const WL_DEFAULTS = {
  cuerpo_cap01: 'Firmaway te permite ofrecer la formación de LLCs en EE.UU. bajo tu propia marca, sin que tengas que aprender el proceso legal ni montar un equipo. Vos ponés tu logo, tu precio y tu relación con el cliente; nosotros procesamos cada caso de principio a fin: constitución, EIN, cuenta bancaria y soporte. Así sumás un nuevo servicio a tu negocio y cobrás tu margen en cada operación.',
  quote_texto: 'Tu marca al frente. Nuestro equipo detrás de cada caso.',
  quote_autor: 'Programa Whitelabel de Firmaway',
};

// ── Constantes de estados ──────────────────────────────────────────────────
const STATE_FEES = {
  new_mexico: 0,
  wyoming: 62,
  delaware: 300,
  florida: 138.75,
  texas: 0,
};

const STATE_LABELS = {
  es: { new_mexico: 'Nuevo México', wyoming: 'Wyoming', delaware: 'Delaware', florida: 'Florida', texas: 'Texas' },
  pt: { new_mexico: 'Novo México',  wyoming: 'Wyoming', delaware: 'Delaware', florida: 'Florida', texas: 'Texas' },
};

// ── Textos por idioma ──────────────────────────────────────────────────────
const i18n = {
  es: {
    eyebrow: 'Propuesta comercial',
    kpiPaquete: 'Paquete recomendado',
    kpiPrecio: 'Inversión total',
    kpiPlazo: 'Plazo estimado',
    kpiEstado: 'Estado recomendado',
    plazo: '15–20 días hábiles',
    footerPreparada: 'Preparada por',
    footerFecha: 'Fecha',
    cap01Chip: 'Cap. 01',
    cap01Sub: 'Tu situación',
    cap01Titulo: 'Entendemos\ntu negocio.',
    beneficiosTitulo: 'Lo que incluye tu paquete',
    cap02Chip: 'Cap. 02',
    cap02Sub: 'Tabla comparativa',
    cap02Titulo: 'Elegí el plan\nque mejor te queda.',
    tablaNota: '* Paquete recomendado destacado en naranja.',
    cap03Chip: 'Cap. 03',
    cap03Sub: 'Por qué <strong>Firmaway</strong>',
    cap03Titulo: 'Más de 2.000 empresas\nya operan con nosotros.',
    stat1: 'LLCs formadas',
    stat2: 'Calificación promedio',
    stat3: 'Años de experiencia',
    stat4: 'Tiempo promedio de inicio',
    test1Texto: 'Llevamos varios años trabajando con Firmaway y la experiencia ha sido excelente desde el primer día. Nos guiaron en cada paso con profesionalismo y dedicación.',
    test1Autor: 'Gerardo P. · QA · 5 estrellas',
    test2Texto: 'Atención 10 puntos, efectividad muy complaciente. Sin dudas la mejor opción a día de hoy para abrir y emprender tu LLC en Estados Unidos.',
    test2Autor: 'Guido B. · AR · 5 estrellas',
    ctaTitulo: '¿Listo para arrancar',
    ctaSubtitulo: 'Respondé este mensaje y arrancamos hoy.',
    ctaBoton: 'Escribile a',
    waText: 'Hola%2C+quiero+arrancar+con+mi+LLC',
    mercuryChip: 'Banca',
    mercurySub: 'Tu cuenta bancaria',
    mercuryTitulo: 'Así vas a operar\ntu cuenta.',
    mercuryBody: 'Tu LLC opera con Mercury, el banco elegido por startups y empresas remotas en todo el mundo. Todo se gestiona en dólares, desde cualquier país, sin pisar Estados Unidos.',
    mercuryFeature1: 'Tarjeta de débito Visa física y virtual.',
    mercuryFeature2: 'Transferencias ACH y SWIFT para operar globalmente.',
    mercuryFeature3: 'Apertura 100% remota, sin viajar a Estados Unidos.',
    mercuryCaption: 'Vista del entorno de demostración de Mercury. Los montos son de ejemplo.',
    mercuryBoton: 'Ver demo en vivo',
    paqueteNombres: { solo_llc: 'Solo LLC', starter: 'Starter', pro: 'Pro', all_in: 'All In' },
    tablaHeader: 'Qué incluye',
    tablaInversion: 'Inversión total',
    features: [
      'Constitución de sociedad',
      'Cuenta bancaria (Mercury)',
      'EIN / Tax ID federal',
      'Agente Registrado gratis por 1 año',
      'Operating Agreement',
      'Soporte gratis e ilimitado',
      'Obligaciones año 1 incluidas',
      'Te responden personas reales',
      'Estado de formación',
      'Miembros',
    ],
    beneficios: {
      starter: [
        ['LLC en Nuevo México', 'el estado más accesible, sin reporte anual y sin fee estatal.'],
        ['Agente Registrado gratis por 1 año', 'dirección postal en EE.UU. para correspondencia oficial.'],
        ['Soporte gratis e ilimitado', 'equipo disponible de lunes a viernes para cualquier consulta.'],
      ],
      pro: [
        ['LLC en Wyoming', 'el estado más recomendado: privacidad de socios y baja burocracia.'],
        ['Cuenta Mercury incluida', 'el mejor banco para operar con una LLC, tarjeta de débito Visa física y virtual, ACH y SWIFT para operar globalmente.'],
        ['EIN / Tax ID federal', 'número de identificación fiscal necesario para abrir la cuenta bancaria y operar ante el IRS.'],
        ['Soporte gratis e ilimitado', 'equipo disponible de lunes a viernes para cualquier consulta sobre tu LLC.'],
      ],
      all_in: [
        ['LLC en Wyoming', 'privacidad de socios y baja burocracia.'],
        ['Cuenta Mercury incluida', 'el mejor banco para operar con una LLC, tarjeta de débito Visa física y virtual, ACH y SWIFT.'],
        ['EIN / Tax ID federal', 'gestión completa ante el IRS por Firmaway.'],
        ['Obligaciones año 1 incluidas', 'declaración, renovación del agente registrado y reporte anual. Hasta 2028 sin costos adicionales.'],
        ['Soporte gratis e ilimitado', 'equipo disponible de lunes a viernes para cualquier consulta.'],
      ],
    },
  },
  pt: {
    eyebrow: 'Proposta comercial',
    kpiPaquete: 'Pacote recomendado',
    kpiPrecio: 'Investimento total',
    kpiPlazo: 'Prazo estimado',
    kpiEstado: 'Estado recomendado',
    plazo: '15–20 dias úteis',
    footerPreparada: 'Preparada por',
    footerFecha: 'Data',
    cap01Chip: 'Cap. 01',
    cap01Sub: 'Sua situação',
    cap01Titulo: 'Entendemos\nseu negócio.',
    beneficiosTitulo: 'O que inclui seu pacote',
    cap02Chip: 'Cap. 02',
    cap02Sub: 'Tabela comparativa',
    cap02Titulo: 'Escolha o plano\nque mais combina com você.',
    tablaNota: '* Pacote recomendado destacado em laranja.',
    cap03Chip: 'Cap. 03',
    cap03Sub: 'Por que a <strong>Firmaway</strong>',
    cap03Titulo: 'Mais de 2.000 empresas\njá operam conosco.',
    stat1: 'LLCs formadas',
    stat2: 'Avaliação média',
    stat3: 'Anos de experiência',
    stat4: 'Tempo médio de início',
    test1Texto: 'Trabalhamos com a Firmaway há vários anos e a experiência foi excelente desde o primeiro dia. Nos guiaram em cada etapa com profissionalismo e dedicação.',
    test1Autor: 'Gerardo P. · QA · 5 estrelas',
    test2Texto: 'Atendimento nota 10, muito eficiente. Sem dúvida a melhor opção hoje para abrir e empreender sua LLC nos Estados Unidos.',
    test2Autor: 'Guido B. · AR · 5 estrelas',
    ctaTitulo: 'Pronto para começar',
    ctaSubtitulo: 'Responda esta mensagem e começamos hoje.',
    ctaBoton: 'Fale com',
    waText: 'Ola%2C+quero+abrir+minha+LLC',
    mercuryChip: 'Banco',
    mercurySub: 'Sua conta bancária',
    mercuryTitulo: 'É assim que você vai\noperar sua conta.',
    mercuryBody: 'Sua LLC opera com a Mercury, o banco escolhido por startups e empresas remotas em todo o mundo. Tudo é gerenciado em dólares, de qualquer país, sem pisar nos Estados Unidos.',
    mercuryFeature1: 'Cartão de débito Visa físico e virtual.',
    mercuryFeature2: 'Transferências ACH e SWIFT para operar globalmente.',
    mercuryFeature3: 'Abertura 100% remota, sem viajar aos Estados Unidos.',
    mercuryCaption: 'Visão do ambiente de demonstração da Mercury. Os valores são de exemplo.',
    mercuryBoton: 'Ver demo ao vivo',
    paqueteNombres: { starter: 'Essencial', pro: 'Pro', all_in: 'Completo' },
    tablaHeader: 'O que inclui',
    tablaInversion: 'Investimento total',
    features: [
      'Constituição da empresa',
      'Conta bancária (Mercury)',
      'EIN / Tax ID federal',
      'Agente Registrado grátis por 1 ano',
      'Operating Agreement',
      'Suporte gratuito e ilimitado',
      'Obrigações do ano 1 incluídas',
      'Você fala com pessoas reais',
      'Estado de formação',
      'Membros',
    ],
    beneficios: {
      starter: [
        ['LLC no Novo México', 'o estado mais acessível, sem relatório anual e sem taxa estadual.'],
        ['Agente Registrado grátis por 1 ano', 'endereço postal nos EUA para correspondência oficial.'],
        ['Suporte gratuito e ilimitado', 'equipe disponível de segunda a sexta para qualquer dúvida.'],
      ],
      pro: [
        ['LLC no Wyoming', 'o estado mais recomendado: privacidade dos sócios e menos burocracia.'],
        ['Conta Mercury incluída', 'o melhor banco para operar com uma LLC, cartão de débito Visa físico e virtual, ACH e SWIFT para operar globalmente.'],
        ['EIN / Tax ID federal', 'número de identificação fiscal necessário para abrir a conta bancária e operar junto ao IRS.'],
        ['Suporte gratuito e ilimitado', 'equipe disponível de segunda a sexta para qualquer dúvida sobre sua LLC.'],
      ],
      all_in: [
        ['LLC no Wyoming', 'privacidade dos sócios e menos burocracia.'],
        ['Conta Mercury incluída', 'o melhor banco para operar com uma LLC, cartão de débito Visa físico e virtual, ACH e SWIFT.'],
        ['EIN / Tax ID federal', 'gestão completa junto ao IRS pela Firmaway.'],
        ['Obrigações do ano 1 incluídas', 'declaração, renovação do agente registrado e relatório anual. Sem custos adicionais até 2028.'],
        ['Suporte gratuito e ilimitado', 'equipe disponível de segunda a sexta para qualquer dúvida.'],
      ],
    },
  },
};

// ── Tabla de precios dinámica ──────────────────────────────────────────────
function buildPricingTable(pkg, lang) {
  const t    = i18n[lang];
  const names = t.paqueteNombres;
  const isEs  = lang !== 'pt';

  // ES muestra 4 paquetes (incluye Solo LLC); PT muestra 3
  const cols = isEs
    ? ['solo_llc', 'starter', 'pro', 'all_in']
    : ['starter',  'pro',     'all_in'];

  const thClass = (col) => col === pkg ? 'col-recommended' : '';
  const tdClass = (col) => col === pkg ? 'highlight' : '';
  const starFor = (col) => col === pkg ? ' ★' : '';

  const check = '<span class="check-mark">✓</span>';
  const dash  = '<span class="dash-mark">–</span>';

  // Padding más compacto en ES (4 columnas)
  const cp = isEs ? '7px 9px' : '10px 14px';

  // ── Filas de features — [solo_llc, starter, pro, all_in] para ES
  //                        [starter, pro, all_in] para PT
  const featureRowsEs = [
    [check, check, check, check],  // Constitución
    [dash,  check, check, check],  // Mercury — Solo LLC NO incluye cuenta
    [check, check, check, check],  // EIN
    [check, check, check, check],  // Agente Registrado
    [check, check, check, check],  // Operating Agreement
    [check, check, check, check],  // Soporte
    [dash,  dash,  dash,  check],  // Obligaciones año 1
    [check, check, check, check],  // Personas reales
  ];
  const featureRowsPt = [
    [check, check, check],
    [check, check, check],
    [check, check, check],
    [check, check, check],
    [check, check, check],
    [check, check, check],
    [dash,  dash,  check],
    [check, check, check],
  ];
  const featureRows = isEs ? featureRowsEs : featureRowsPt;

  // ── Filas diferenciadoras
  const estadoRow = isEs
    ? ['Cualquier estado', 'Nuevo México', 'Cualquier estado', 'Cualquier estado']
    : ['Novo México', 'Qualquer estado', 'Qualquer estado'];
  const membrosRow = isEs
    ? ['1 o más', '1 miembro', '2 o más', '2 o más']
    : ['1 membro', '2 ou mais', '2 ou mais'];

  let html = `<table class="pricing-table">
  <thead>
    <tr>
      <th class="col-feature" style="padding:${cp};">${t.tablaHeader}</th>
      ${cols.map(col => `<th class="${thClass(col)}" style="padding:${cp};">${names[col] || col}${starFor(col)}</th>`).join('')}
    </tr>
  </thead>
  <tbody>`;

  // Primeras 8 filas: features con ✓/✗
  t.features.slice(0, 8).forEach((feat, i) => {
    html += `
    <tr>
      <td class="feature-name" style="padding:${cp};">${feat}</td>
      ${cols.map((col, ci) => `<td class="${tdClass(col)}" style="padding:${cp};">${featureRows[i][ci]}</td>`).join('')}
    </tr>`;
  });

  // Filas diferenciadoras
  const diffStyle = 'background:rgba(49,53,61,0.04);';
  const labelStyle = `font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--ink-light); padding:${cp};`;
  const valStyle   = `font-size:12px; font-weight:700; color:var(--ink); padding:${cp};`;

  html += `
    <tr style="${diffStyle}">
      <td class="feature-name" style="${labelStyle}">${t.features[8]}</td>
      ${cols.map((col, ci) => `<td class="${tdClass(col)}" style="${valStyle}">${estadoRow[ci]}</td>`).join('')}
    </tr>
    <tr style="${diffStyle}">
      <td class="feature-name" style="${labelStyle}">${t.features[9]}</td>
      ${cols.map((col, ci) => `<td class="${tdClass(col)}" style="${valStyle}">${membrosRow[ci]}</td>`).join('')}
    </tr>`;

  const priceRow = (col) => {
    const isPt     = lang === 'pt';
    const pricesEs = { solo_llc: '495', starter: '499', pro: '645', all_in: '1.199' };
    const pricesPt = { starter: '2.599', pro: '3.299', all_in: '6.099' };
    const priceVal = isPt ? pricesPt[col] : pricesEs[col];
    const currency = isPt ? 'R$' : 'USD';
    const featured = col === pkg;
    const style = featured
      ? `background:var(--orange); border:1.5px solid var(--orange); text-align:center; padding:${cp};`
      : `background:var(--cream-warm); border:1.5px solid var(--ink); text-align:center; padding:${cp};`;
    return `<th style="${style}">
      <span class="price-currency${featured ? ' featured' : ''}">${currency}</span>
      <span class="price-amount${featured ? ' featured' : ''}">${priceVal}</span>
    </th>`;
  };

  html += `
  </tbody>
  <tfoot>
    <tr class="price-row">
      <th style="text-align:left; background:var(--cream-warm); border:1.5px solid var(--ink); padding:${cp};">
        <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-light);">${t.tablaInversion}</span>
      </th>
      ${cols.map(col => priceRow(col)).join('')}
    </tr>
  </tfoot>
</table>`;

  return html;
}

// ── Lista de beneficios ────────────────────────────────────────────────────
function buildBenefitsList(pkg, lang) {
  const t = i18n[lang];
  const items = t.beneficios[pkg] || t.beneficios.pro;
  const svgCheck = `<svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#F15A2F" stroke-width="2" stroke-linecap="round"/></svg>`;

  return items.map(([title, desc]) => `
    <li>
      <div class="check-icon">${svgCheck}</div>
      <div><strong>${title}</strong> — ${desc}</div>
    </li>`).join('');
}

// ── Timeline del proceso ──────────────────────────────────────────────────
function buildTimeline(lang) {
  const isEs = lang !== 'pt';
  const title = isEs ? 'Cómo funciona el proceso' : 'Como funciona o processo';

  const steps = isEs
    ? [
        ['1', 'Confirmación de datos',  'Completamos tu perfil y validamos la documentación.',           'Día 1'],
        ['2', 'Formación de la LLC',    'Presentamos la constitución al estado que elegiste.',           'Días 2–5'],
        ['3', 'Obtención del EIN',      'Gestionamos tu Tax ID federal ante el IRS.',                   'Días 5–10'],
        ['4', 'Apertura de Mercury',    'Activamos tu cuenta bancaria y tarjeta de débito Visa.',       'Días 10–15'],
      ]
    : [
        ['1', 'Confirmação dos dados',  'Completamos o perfil e validamos a documentação.',             'Dia 1'],
        ['2', 'Formação da LLC',        'Enviamos a constituição ao estado que você escolheu.',         'Dias 2–5'],
        ['3', 'Obtenção do EIN',        'Gerenciamos o Tax ID federal junto ao IRS.',                   'Dias 5–10'],
        ['4', 'Abertura da Mercury',    'Ativamos a conta bancária e o cartão de débito Visa.',         'Dias 10–15'],
      ];

  const items = steps.map(([num, stepTitle, desc, days]) => `
    <div style="display:flex; align-items:flex-start; gap:14px; margin-bottom:14px;">
      <div style="flex-shrink:0; width:26px; height:26px; border-radius:50%; background:var(--orange); display:flex; align-items:center; justify-content:center;">
        <span style="font-size:11px; font-weight:800; color:#fff;">${num}</span>
      </div>
      <div style="flex:1; padding-top:3px;">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:2px;">
          <span style="font-size:13px; font-weight:700; color:var(--ink);">${stepTitle}</span>
          <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--orange); white-space:nowrap; margin-left:12px;">${days}</span>
        </div>
        <p style="font-size:12px; color:var(--ink-light); margin:0; line-height:1.5;">${desc}</p>
      </div>
    </div>`).join('');

  return `
<div style="margin-top:28px; padding-top:20px; border-top:1px solid rgba(49,53,61,0.1);">
  <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-light); margin-bottom:16px;">${title}</p>
  ${items}
</div>`;
}

// ── Obligaciones anuales ───────────────────────────────────────────────────
function buildAnnualObligations(pkg, state, lang) {
  const isEs = lang !== 'pt';
  const stateLabel = (STATE_LABELS[lang] || STATE_LABELS.es)[state] || 'Wyoming';
  const fee = STATE_FEES[state] ?? 0;

  if (pkg === 'all_in') {
    const title = isEs ? 'Obligaciones anuales' : 'Obrigações anuais';
    const text  = isEs
      ? 'Las obligaciones del año 1 ya están incluidas en tu paquete All In. ✓'
      : 'As obrigações do ano 1 já estão incluídas no seu pacote All In. ✓';
    return `
<div style="margin-top:20px; padding:14px 16px; background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:8px;">
  <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#15803D; margin:0 0 6px 0;">${title}</p>
  <p style="font-size:12px; color:#15803D; font-weight:600; margin:0;">${text}</p>
</div>`;
  }

  const feeText = fee > 0
    ? (isEs ? ` + fee estatal ${stateLabel}: <strong>USD ${fee}</strong>` : ` + taxa estadual ${stateLabel}: <strong>USD ${fee}</strong>`)
    : (isEs ? ` (sin fee estatal en ${stateLabel})` : ` (sem taxa estadual no ${stateLabel})`);

  const title    = isEs ? 'Obligaciones anuales (desde año 2)' : 'Obrigações anuais (a partir do ano 2)';
  const mainText = isEs
    ? `USD 699 anuales (a la fecha)${feeText}`
    : `USD 699 anuais (até o momento)${feeText}`;

  return `
<div style="margin-top:20px; padding:14px 16px; background:#FFFBF5; border:1.5px solid rgba(49,53,61,0.12); border-radius:8px;">
  <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:rgba(49,53,61,0.45); margin:0 0 6px 0;">${title}</p>
  <p style="font-size:12px; color:#31353D; margin:0;">${mainText}</p>
</div>`;
}

// ── Documentación necesaria ────────────────────────────────────────────────
function buildRequirements(lang) {
  const isEs = lang !== 'pt';
  const title = isEs ? 'Documentación necesaria' : 'Documentação necessária';

  const items = isEs
    ? [
        'Pasaporte vigente',
        'Factura de servicio básico a tu nombre',
        'Extracto bancario personal con no más de 60 días de antigüedad',
        'LinkedIn personal o corporativo',
      ]
    : [
        'Passaporte válido',
        'Conta de serviço básico em seu nome',
        'Extrato bancário pessoal com no máximo 60 dias',
        'LinkedIn pessoal ou corporativo',
      ];

  const liItems = items
    .map(item => `<li style="font-size:12px; color:#31353D; margin-bottom:5px;">${item}</li>`)
    .join('');

  return `
<div style="margin-top:16px; padding:14px 16px; background:#F0F9FF; border:1.5px solid #BAE6FD; border-radius:8px;">
  <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#0369A1; margin:0 0 10px 0;">${title}</p>
  <ul style="margin:0; padding-left:18px;">
    ${liItems}
  </ul>
</div>`;
}

// ── Contacto whitelabel: deriva email/apodo del comercial ──────────────────
function whitelabelContact(commercialName) {
  const full  = (commercialName || 'Daniel').trim();
  const first = full.split(/\s+/)[0] || 'Daniel';
  const slug  = first
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z]/g, '');
  return { apodo: first, email: `${slug}@firmaway.us` };
}

// ── Render propuesta Whitelabel ────────────────────────────────────────────
function renderTemplateWhitelabel(data) {
  const final = data.final_data || data.generated_data || {};

  const now = new Date();
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const fechaMes = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const clientName = final.client_name || data.lead_name || 'tu empresa';
  const contact    = whitelabelContact(data.commercial_name);

  // Validez de la oferta: 15 días (usa expires_at real; si no, created_at + 15d)
  const created = data.created_at ? new Date(data.created_at) : null;
  const expires = data.expires_at
    ? new Date(data.expires_at)
    : (created ? new Date(created.getTime() + 15 * 24 * 60 * 60 * 1000) : null);
  const validez = expires
    ? `Propuesta válida por 15 días — hasta el ${expires.getDate()} de ${months[expires.getMonth()].toLowerCase()} de ${expires.getFullYear()}.`
    : 'Propuesta válida por 15 días desde su emisión.';

  // Precio libre (399–500 aprox). Puede venir null hasta que el vendedor lo cargue.
  const rawPrice = data.case_price ?? final.case_price ?? null;
  const precio   = (rawPrice !== null && rawPrice !== '' && !Number.isNaN(Number(rawPrice)))
    ? Number(rawPrice).toLocaleString('es-AR')
    : '—';

  // Logo del cliente: data URI (subido) o URL. Si no hay, se omite el recuadro.
  const logoSrc = final.client_logo_url || '';
  const clientLogo = logoSrc
    ? `<div class="client-logo-chip"><img src="${logoSrc}" alt="${clientName}"></div>`
    : '';

  // Link de demo personalizado con ?ref= (por defecto, a nombre del socio)
  const demoRef = (final.demo_ref || clientName || '').trim();
  const demoBase = 'https://www.registrollc.com/login';
  const demoLink        = demoRef ? `${demoBase}?ref=${encodeURIComponent(demoRef)}` : demoBase;
  const demoLinkDisplay = demoRef ? `${demoBase}?ref=${demoRef}` : demoBase;

  const vars = {
    LANG: 'es',
    PROPUESTA_ID: data.proposal_number || 'FW-2026-0001',
    EYEBROW: `Propuesta whitelabel · ${fechaMes}`,
    CLIENT_NAME: clientName,
    CLIENT_LOGO: clientLogo,
    PRECIO_CASO: precio,
    CUERPO_CAP01: final.cuerpo_cap01 || data.cuerpo_cap01 || WL_DEFAULTS.cuerpo_cap01,
    QUOTE_TEXTO: final.quote_texto || WL_DEFAULTS.quote_texto,
    QUOTE_AUTOR: final.quote_autor || WL_DEFAULTS.quote_autor,
    COMERCIAL_NOMBRE: data.commercial_name || 'Daniel',
    COMERCIAL_APODO: contact.apodo,
    CONTACT_EMAIL: contact.email,
    DEMO_LINK: demoLink,
    DEMO_LINK_DISPLAY: demoLinkDisplay,
    VALIDEZ: validez,
    MERCURY_IMG: mercuryImageDataUri(),
    FECHA_MES: fechaMes,
  };

  let html = fs.readFileSync(WHITELABEL_TEMPLATE_PATH, 'utf-8');
  Object.entries(vars).forEach(([key, value]) => {
    html = html.split(`{{${key}}}`).join(value ?? '');
  });
  return html;
}

// ── Función principal ──────────────────────────────────────────────────────
function renderTemplate(data) {
  if (data.proposal_type === 'whitelabel') {
    return renderTemplateWhitelabel(data);
  }

  const lang = data.language || 'es';
  const t = i18n[lang];
  const pkg  = data.package || 'pro';
  const isPt = lang === 'pt';
  const prices = isPt
    ? { starter: 2599,  pro: 3299,  all_in: 6099  }
    : { solo_llc: 495,  starter: 499, pro: 645, all_in: 1199 };
  const currency = isPt ? 'R$' : 'USD';

  const now = new Date();
  const months = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  };
  const fechaMes = `${months[lang][now.getMonth()]} ${now.getFullYear()}`;

  const final = data.final_data || data.generated_data || {};

  // Estado y nickname para personalización dinámica
  const state      = final.state_recommended || data.state_recommended || (pkg === 'starter' ? 'new_mexico' : 'wyoming');
  const stateLabel = (STATE_LABELS[lang] || STATE_LABELS.es)[state] || 'Wyoming';
  const nickname   = final.commercial_nickname || data.commercial_nickname || (isPt ? 'Tatiana' : 'Seba');

  // WA text personalizado con el nombre del comercial
  const waTextRaw = lang === 'pt'
    ? `Oi ${nickname}, quero abrir minha LLC`
    : `Hola ${nickname}, quiero avanzar con mi LLC`;
  const waText = encodeURIComponent(waTextRaw).replace(/%20/g, '+');

  const vars = {
    LANG: lang,
    PROPUESTA_ID: data.proposal_number || 'FW-2026-0001',
    NOMBRE_CLIENTE: final.lead_name || data.lead_name || '',
    DETALLE_CLIENTE: final.lead_detail || data.lead_detail || '',
    EYEBROW: `${t.eyebrow} · ${fechaMes}`,
    HEADLINE_L1: final.headline_line1 || '',
    HEADLINE_L2: final.headline_line2 || '',
    HEADLINE_HIGHLIGHT: final.headline_highlight || 'LLC en EE.UU.',
    KPI_PAQUETE_LABEL: t.kpiPaquete,
    KPI_PAQUETE: t.paqueteNombres[pkg],
    KPI_PRECIO_LABEL: t.kpiPrecio,
    KPI_MONEDA: currency,
    KPI_PRECIO: prices[pkg].toLocaleString('es-AR'),
    KPI_PLAZO_LABEL: t.kpiPlazo,
    KPI_PLAZO: t.plazo,
    KPI_ESTADO_LABEL: t.kpiEstado,
    KPI_ESTADO: stateLabel,
    FOOTER_PREPARADA_LABEL: t.footerPreparada,
    FOOTER_FECHA_LABEL: t.footerFecha,
    COMERCIAL_NOMBRE: final.commercial_name || data.commercial_name || 'Sebastián Bedoya',
    COMERCIAL_APODO: final.commercial_nickname || data.commercial_nickname || 'Seba',
    FECHA_MES: fechaMes,
    CAP01_CHIP: t.cap01Chip,
    CAP01_SUB: t.cap01Sub,
    CAP01_TITULO: t.cap01Titulo,
    CUERPO_CAP01: final.cuerpo_cap01 || data.cuerpo_cap01 || '',
    EXTRA_CAP01: final.extra_cap01 ? `\n\n${final.extra_cap01}` : '',
    TIMELINE: buildTimeline(lang),
    CAP02_CHIP: t.cap02Chip,
    CAP02_SUB: t.cap02Sub,
    CAP02_TITULO: t.cap02Titulo,
    PRICING_TABLE: buildPricingTable(pkg, lang),
    TABLA_NOTA: t.tablaNota,
    ANNUAL_OBLIGATIONS: buildAnnualObligations(pkg, state, lang),
    REQUIREMENTS_SECTION: buildRequirements(lang),
    MERCURY_CHIP: t.mercuryChip,
    MERCURY_SUB: t.mercurySub,
    MERCURY_TITULO: t.mercuryTitulo,
    MERCURY_BODY: t.mercuryBody,
    MERCURY_FEATURE1: t.mercuryFeature1,
    MERCURY_FEATURE2: t.mercuryFeature2,
    MERCURY_FEATURE3: t.mercuryFeature3,
    MERCURY_CAPTION: t.mercuryCaption,
    MERCURY_BOTON: t.mercuryBoton,
    MERCURY_IMG: mercuryImageDataUri(),
    CAP03_CHIP: t.cap03Chip,
    CAP03_SUB: t.cap03Sub,
    CAP03_TITULO: t.cap03Titulo,
    STAT1_LABEL: t.stat1,
    STAT2_LABEL: t.stat2,
    STAT3_LABEL: t.stat3,
    STAT4_LABEL: t.stat4,
    TEST1_TEXTO: t.test1Texto,
    TEST1_AUTOR: t.test1Autor,
    TEST2_TEXTO: t.test2Texto,
    TEST2_AUTOR: t.test2Autor,
    CTA_TITULO: t.ctaTitulo,
    CTA_SUBTITULO: t.ctaSubtitulo,
    CTA_BOTON: t.ctaBoton,
    WA_TEXT: waText,
  };

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  Object.entries(vars).forEach(([key, value]) => {
    html = html.split(`{{${key}}}`).join(value ?? '');
  });

  return html;
}

module.exports = { renderTemplate, WL_DEFAULTS };
