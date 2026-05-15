const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../templates/proposal.html');

// ── Textos por idioma ──────────────────────────────────────────────────────
const i18n = {
  es: {
    eyebrow: 'Propuesta comercial',
    kpiPaquete: 'Paquete recomendado',
    kpiPrecio: 'Inversión total',
    kpiPlazo: 'Plazo estimado',
    kpiEstado: 'Estado recomendado',
    plazo: '10–15 días hábiles',
    footerPreparada: 'Preparada por',
    footerFecha: 'Fecha',
    cap01Chip: 'Cap. 01',
    cap01Sub: 'Tu situación',
    cap01Titulo: 'Entendemos\ntu negocio.',
    beneficiosTitulo: 'Lo que incluye tu paquete',
    cap02Chip: 'Cap. 02',
    cap02Sub: 'Tabla comparativa',
    cap02Titulo: 'Elegí el plan\nque mejor te queda.',
    tablaNota: '* Paquete recomendado destacado en naranja. Wyoming no expone los nombres de los socios en registros públicos.',
    cap03Chip: 'Cap. 03',
    cap03Sub: 'Por qué Firmaway',
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
    paqueteNombres: { starter: 'Starter', pro: 'Pro', all_in: 'All In' },
    tablaHeader: 'Qué incluye',
    tablaInversion: 'Inversión total',
    features: [
      'Constitución de sociedad',
      'Cuenta bancaria (Mercury)',
      'EIN / Tax ID federal',
      'Registered Agent (1 año)',
      'Operating Agreement',
      'Soporte gratis e ilimitado',
      'Obligaciones año 1 incluidas',
    ],
    beneficios: {
      starter: [
        ['LLC en Nuevo México', 'el estado más accesible, sin reporte anual y sin fee estatal.'],
        ['Registered Agent (1 año)', 'dirección postal en EE.UU. para correspondencia oficial.'],
        ['Soporte gratis e ilimitado', 'equipo disponible de lunes a viernes para cualquier consulta.'],
      ],
      pro: [
        ['LLC en Wyoming', 'el estado más recomendado: privacidad de socios, baja burocracia y baja administrativa flexible por $490 (al día de hoy).'],
        ['Cuenta Mercury incluida', 'neobanco 100% online, tarjeta Visa física y virtual, ACH y SWIFT para operar globalmente.'],
        ['EIN / Tax ID federal', 'número de identificación fiscal necesario para abrir la cuenta bancaria y operar ante el IRS.'],
        ['Soporte gratis e ilimitado', 'equipo disponible de lunes a viernes para cualquier consulta sobre tu LLC.'],
      ],
      all_in: [
        ['LLC en Wyoming', 'privacidad de socios, baja burocracia y baja administrativa flexible por $490 (al día de hoy).'],
        ['Cuenta Mercury incluida', 'neobanco 100% online, tarjeta Visa física y virtual, ACH y SWIFT.'],
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
    plazo: '10–15 dias úteis',
    footerPreparada: 'Preparada por',
    footerFecha: 'Data',
    cap01Chip: 'Cap. 01',
    cap01Sub: 'Sua situação',
    cap01Titulo: 'Entendemos\nseu negócio.',
    beneficiosTitulo: 'O que inclui seu pacote',
    cap02Chip: 'Cap. 02',
    cap02Sub: 'Tabela comparativa',
    cap02Titulo: 'Escolha o plano\nque mais combina com você.',
    tablaNota: '* Pacote recomendado destacado em laranja. Wyoming não expõe os nomes dos sócios em registros públicos.',
    cap03Chip: 'Cap. 03',
    cap03Sub: 'Por que a Firmaway',
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
    paqueteNombres: { starter: 'Starter', pro: 'Pro', all_in: 'All In' },
    tablaHeader: 'O que inclui',
    tablaInversion: 'Investimento total',
    features: [
      'Constituição da empresa',
      'Conta bancária (Mercury)',
      'EIN / Tax ID federal',
      'Agente Registrado (1 ano)',
      'Operating Agreement',
      'Suporte gratuito e ilimitado',
      'Obrigações do ano 1 incluídas',
    ],
    beneficios: {
      starter: [
        ['LLC no Novo México', 'o estado mais acessível, sem relatório anual e sem taxa estadual.'],
        ['Agente Registrado (1 ano)', 'endereço postal nos EUA para correspondência oficial.'],
        ['Suporte gratuito e ilimitado', 'equipe disponível de segunda a sexta para qualquer dúvida.'],
      ],
      pro: [
        ['LLC no Wyoming', 'o estado mais recomendado: privacidade dos sócios, menos burocracia e encerramento administrativo por $490 (até hoje).'],
        ['Conta Mercury incluída', 'neobank 100% online, cartão Visa físico e virtual, ACH e SWIFT para operar globalmente.'],
        ['EIN / Tax ID federal', 'número de identificação fiscal necessário para abrir a conta bancária e operar junto ao IRS.'],
        ['Suporte gratuito e ilimitado', 'equipe disponível de segunda a sexta para qualquer dúvida sobre sua LLC.'],
      ],
      all_in: [
        ['LLC no Wyoming', 'privacidade dos sócios, menos burocracia e encerramento administrativo por $490 (até hoje).'],
        ['Conta Mercury incluída', 'neobank 100% online, cartão Visa físico e virtual, ACH e SWIFT.'],
        ['EIN / Tax ID federal', 'gestão completa junto ao IRS pela Firmaway.'],
        ['Obrigações do ano 1 incluídas', 'declaração, renovação do agente registrado e relatório anual. Sem custos adicionais até 2028.'],
        ['Suporte gratuito e ilimitado', 'equipe disponível de segunda a sexta para qualquer dúvida.'],
      ],
    },
  },
};

// ── Tabla de precios dinámica ──────────────────────────────────────────────
function buildPricingTable(pkg, lang) {
  const t = i18n[lang];
  const names = t.paqueteNombres;

  const isStarter = pkg === 'starter';
  const isPro = pkg === 'pro';
  const isAllIn = pkg === 'all_in';

  const thClass = (col) => col === pkg ? 'col-recommended' : '';
  const tdClass = (col) => col === pkg ? 'highlight' : '';

  const check = '<span class="check-mark">✓</span>';
  const dash = '<span class="dash-mark">–</span>';

  // Filas: [starter, pro, all_in]
  const rows = [
    [check, check, check],   // Constitución
    [dash, check, check],    // Mercury
    [dash, check, check],    // EIN
    [check, check, check],   // Registered Agent
    [dash, check, check],    // Operating Agreement
    [check, check, check],   // Soporte gratis e ilimitado
    [dash, dash, check],     // Obligaciones año 1
  ];

  const starterStar = isStarter ? ' ★' : '';
  const proStar = isPro ? ' ★' : '';
  const allInStar = isAllIn ? ' ★' : '';

  let html = `<table class="pricing-table">
  <thead>
    <tr>
      <th class="col-feature">${t.tablaHeader}</th>
      <th class="${thClass('starter')}">${names.starter}${starterStar}</th>
      <th class="${thClass('pro')}">${names.pro}${proStar}</th>
      <th class="${thClass('all_in')}">${names.all_in}${allInStar}</th>
    </tr>
  </thead>
  <tbody>`;

  t.features.forEach((feat, i) => {
    html += `
    <tr>
      <td class="feature-name">${feat}</td>
      <td class="${tdClass('starter')}">${rows[i][0]}</td>
      <td class="${tdClass('pro')}">${rows[i][1]}</td>
      <td class="${tdClass('all_in')}">${rows[i][2]}</td>
    </tr>`;
  });

  const priceRow = (col) => {
    const prices = { starter: '499', pro: '645', all_in: '1.199' };
    const featured = col === pkg;
    const style = featured
      ? `background:var(--orange); border: 1.5px solid var(--orange); text-align:center;`
      : `background:var(--cream-warm); border: 1.5px solid var(--ink); text-align:center;`;
    return `<th style="${style}">
      <span class="price-currency${featured ? ' featured' : ''}">USD</span>
      <span class="price-amount${featured ? ' featured' : ''}">${prices[col]}</span>
    </th>`;
  };

  html += `
  </tbody>
  <tfoot>
    <tr class="price-row">
      <th style="text-align:left; background:var(--cream-warm); border: 1.5px solid var(--ink);">
        <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-light);">${t.tablaInversion}</span>
      </th>
      ${priceRow('starter')}
      ${priceRow('pro')}
      ${priceRow('all_in')}
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

// ── Función principal ──────────────────────────────────────────────────────
function renderTemplate(data) {
  const lang = data.language || 'es';
  const t = i18n[lang];
  const pkg = data.package || 'pro';
  const prices = { starter: 499, pro: 645, all_in: 1199 };

  const now = new Date();
  const months = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  };
  const fechaMes = `${months[lang][now.getMonth()]} ${now.getFullYear()}`;

  const final = data.final_data || data.generated_data || {};

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
    KPI_PRECIO: prices[pkg].toLocaleString('es-AR'),
    KPI_PLAZO_LABEL: t.kpiPlazo,
    KPI_PLAZO: t.plazo,
    KPI_ESTADO_LABEL: t.kpiEstado,
    FOOTER_PREPARADA_LABEL: t.footerPreparada,
    FOOTER_FECHA_LABEL: t.footerFecha,
    COMERCIAL_NOMBRE: final.commercial_name || data.commercial_name || 'Sebastián Bedoya',
    COMERCIAL_APODO: final.commercial_nickname || data.commercial_nickname || 'Seba',
    FECHA_MES: fechaMes,
    CAP01_CHIP: t.cap01Chip,
    CAP01_SUB: t.cap01Sub,
    CAP01_TITULO: t.cap01Titulo,
    BENEFICIOS_TITULO: t.beneficiosTitulo,
    CUERPO_CAP01: final.cuerpo_cap01 || data.cuerpo_cap01 || '',
    BENEFICIOS_LIST: buildBenefitsList(pkg, lang),
    CAP02_CHIP: t.cap02Chip,
    CAP02_SUB: t.cap02Sub,
    CAP02_TITULO: t.cap02Titulo,
    PRICING_TABLE: buildPricingTable(pkg, lang),
    TABLA_NOTA: t.tablaNota,
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
    WA_TEXT: t.waText,
  };

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  Object.entries(vars).forEach(([key, value]) => {
    html = html.split(`{{${key}}}`).join(value ?? '');
  });

  return html;
}

module.exports = { renderTemplate };
