import Head from 'next/head';
import { useRouter } from 'next/router';

const STYLE = `
:root{
  --cream:#FEF1E0; --cream-warm:#FEF1E0; --orange:#F15A2F; --orange-soft:#FDEEE9;
  --ink:#31353D; --ink-light:rgba(49,53,61,0.45); --dark-surface:#3A4557; --white:#FFF;
}
.guide-doc *{margin:0;padding:0;box-sizing:border-box;}
.guide-doc{font-family:'Inter',system-ui,sans-serif;background:var(--cream);color:var(--ink);
  font-size:15px;line-height:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact;min-height:100vh;}
.guide-doc .page{max-width:900px;margin:0 auto;padding:88px 48px 40px;}
.guide-doc .logo{font-weight:700;font-size:18px;letter-spacing:-0.03em;}
.guide-doc .logo span{color:var(--orange);}
.guide-doc h1{font-weight:800;font-size:40px;line-height:1.06;letter-spacing:-0.04em;margin:8px 0 6px;}
.guide-doc h2{font-weight:700;font-size:26px;line-height:1.18;letter-spacing:-0.03em;margin:0;}
.guide-doc h3{font-weight:600;font-size:17px;line-height:1.4;margin:0 0 4px;}
.guide-doc .label{font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:var(--ink-light);}
.guide-doc .chip{display:inline-block;background:var(--orange-soft);border:2px solid var(--orange);
  border-radius:999px;padding:4px 12px;font-size:10.5px;font-weight:500;text-transform:uppercase;
  letter-spacing:0.06em;color:var(--orange);}
.guide-doc .chip-dark{display:inline-block;background:transparent;border:2px solid var(--ink);
  border-radius:999px;padding:4px 12px;font-size:10.5px;font-weight:500;text-transform:uppercase;
  letter-spacing:0.06em;color:var(--ink);}
.guide-doc hr{height:1px;background:rgba(49,53,61,0.1);margin:24px 0;border:none;}
.guide-doc .header-bar{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;
  border-bottom:1px solid rgba(49,53,61,0.1);margin-bottom:28px;}
.guide-doc .intro{background:var(--cream-warm);border:1.5px solid var(--ink);border-radius:14px;
  padding:20px 24px;box-shadow:4px 4px 0 0 var(--ink);margin-bottom:14px;}
.guide-doc .intro p{margin-bottom:10px;}
.guide-doc .intro p:last-child{margin-bottom:0;}
.guide-doc .pillars{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0 8px;}
.guide-doc .pillar{background:var(--white);border:1.5px solid var(--ink);border-radius:12px;padding:12px 16px;}
.guide-doc .pillar .n{font-weight:800;font-size:18px;color:var(--orange);}
.guide-doc .profile{border:1.5px solid var(--ink);border-radius:16px;padding:24px 26px;margin:20px 0;
  background:var(--cream-warm);box-shadow:4px 4px 0 0 var(--ink);break-inside:avoid;page-break-inside:avoid;}
.guide-doc .profile-head{display:flex;align-items:baseline;gap:12px;margin-bottom:4px;}
.guide-doc .profile-head .num{font-weight:800;font-size:14px;color:var(--orange);}
.guide-doc .pain{font-size:14px;color:var(--ink);margin:8px 0 16px;font-style:italic;
  border-left:4px solid var(--orange);background:var(--orange-soft);padding:10px 16px;border-radius:0 10px 10px 0;}
.guide-doc .block-title{font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;
  color:var(--orange);margin:14px 0 6px;}
.guide-doc ul.q{list-style:none;}
.guide-doc ul.q li{position:relative;padding-left:22px;margin-bottom:7px;font-size:14.5px;line-height:22px;}
.guide-doc ul.q li:before{content:"";position:absolute;left:0;top:8px;width:8px;height:8px;
  background:var(--orange);border-radius:50%;}
.guide-doc .script{background:var(--white);border:1.5px dashed var(--ink);border-radius:10px;
  padding:12px 16px;font-size:14px;line-height:22px;margin-top:6px;}
.guide-doc .script strong{color:var(--orange);}
.guide-doc .flag{background:#FFF4F0;border:1.5px solid var(--orange);border-radius:10px;
  padding:10px 14px;font-size:13px;line-height:20px;margin-top:10px;}
.guide-doc .flag b{color:var(--orange);text-transform:uppercase;font-size:11px;letter-spacing:0.05em;}
.guide-doc .dark-page{background:var(--dark-surface);color:var(--white);border-radius:16px;
  padding:28px 32px;margin-top:28px;}
.guide-doc .dark-page h2{color:var(--white);}
.guide-doc .dark-page .label{color:rgba(255,255,255,0.55);}
.guide-doc .dark-page ul.q li{color:var(--white);}
.guide-doc .dark-page ul.q li:before{background:var(--orange);}
.guide-doc .footer{margin-top:32px;padding-top:16px;border-top:1px solid rgba(49,53,61,0.1);
  display:flex;justify-content:space-between;font-size:11px;color:var(--ink-light);
  text-transform:uppercase;letter-spacing:0.06em;}
@media print{.guide-doc .page{padding:24px 32px;max-width:100%;}.guide-doc .profile{box-shadow:3px 3px 0 0 var(--ink);}}
@page{size:A4;margin:12mm;}
`;

const BODY_HTML = `
<div class="page">

  <div class="header-bar">
    <span class="logo">Firmaway<span>.</span></span>
    <span class="label">Guía de Discovery · Uso interno · Equipo comercial</span>
  </div>

  <span class="chip">Playbook comercial</span>
  <h1>Discovery por perfil</h1>
  <p class="label" style="margin-bottom:20px;">Saber a quién tenés enfrente antes de hablar de precio</p>

  <div class="intro">
    <p><strong>Para qué es esto.</strong> Cada lead que entra tiene un dolor distinto según su modelo de negocio. Un discovery genérico ("contame de tu proyecto") desperdicia la llamada. Esta guía te da, por cada perfil, las preguntas que revelan el dolor real, cómo cuantificar el impacto en plata, y un guion pegable para cerrar con segunda fecha.</p>
    <p><strong>Cómo usarla.</strong> Antes de la llamada, mirá la web o el Instagram del prospecto e identificá su perfil. Abrí la sección correspondiente. No leas todo: elegí 3 o 4 preguntas y escuchá más de lo que hablás.</p>
  </div>

  <div class="pillars">
    <div class="pillar"><span class="n">1.</span> <strong>Identificá el perfil</strong> antes de la llamada (web / LinkedIn / Instagram).</div>
    <div class="pillar"><span class="n">2.</span> <strong>Cuantificá el dolor</strong> en dinero, no en features.</div>
    <div class="pillar"><span class="n">3.</span> <strong>Calificá la situación fiscal</strong> para no sobrevender.</div>
    <div class="pillar"><span class="n">4.</span> <strong>Cerrá con segunda fecha</strong> y compromiso de decisión.</div>
  </div>

  <div class="flag">
    <b>Regla de oro de calificación</b><br>
    Toda LLC de dueño único extranjero debe presentar el Form 5472 cada año, incluso sin ingresos, y la multa por no hacerlo arranca en USD 25.000. Esto NO es un argumento de miedo para vender: es un dato que usás para calificar bien y para posicionar el paquete All-in (cumplimiento anual). Nunca prometas "cero obligaciones" ni "no pagás nada de impuestos". Vender mal acá vuelve como reclamo, mala reseña y caída de NPS.
  </div>

  <hr>

  <div class="profile">
    <div class="profile-head"><span class="num">PERFIL 01</span><h2>Amazon FBA</h2></div>
    <div class="pain">El dolor real: no puede cobrar, escalar ni operar la cuenta de vendedor sin una entidad de EE.UU. Cada semana sin LLC es venta que no factura o cuenta en riesgo.</div>

    <div class="block-title">Preguntas de discovery</div>
    <ul class="q">
      <li>¿En qué marketplace vendés hoy y hace cuánto? ¿Ya tenés cuenta de vendedor o la estás por abrir?</li>
      <li>¿Estás operando a nombre personal o de otra entidad? ¿Qué problema te trajo eso hasta ahora?</li>
      <li>¿Cuánto facturás por mes aproximadamente, o cuánto proyectás en los próximos 6 meses?</li>
      <li>¿Tu operación es solo online o tenés depósito, empleados o inventario propio en EE.UU.?</li>
    </ul>

    <div class="block-title">Cómo cuantificar el impacto</div>
    <div class="script">"Si hoy no podés cobrar por no tener la entidad, ¿cuánto es la venta mensual que estás dejando pasar? Multiplicá eso por los días que tardás en resolverlo. La LLC se paga sola en la primera semana de ventas destrabadas."</div>

    <div class="flag">
      <b>Nota fiscal para calificar</b><br>
      Vender solo por Amazon FBA normalmente NO se considera "US trade or business" (ETBUS), salvo que haya actividad física significativa en EE.UU. Eso significa que el cliente típico igual debe presentar el 5472 anual, pero suele no tener impuesto federal sobre la renta. Confirmá si tiene depósito/empleados propios en EE.UU. antes de afirmar nada sobre impuestos.
    </div>
  </div>

  <div class="profile">
    <div class="profile-head"><span class="num">PERFIL 02</span><h2>SaaS / Freelancer tech</h2></div>
    <div class="pain">El dolor real: pierde clientes de EE.UU. o de empresas grandes que no contratan a un particular sin entidad, y no puede recibir pagos en dólares de forma limpia.</div>

    <div class="block-title">Preguntas de discovery</div>
    <ul class="q">
      <li>¿Quiénes son tus clientes hoy y de dónde? ¿Alguno te pidió facturar como empresa o desde EE.UU.?</li>
      <li>¿Cómo cobrás hoy y qué fricción tenés con eso (comisiones, demoras, límites de plataforma)?</li>
      <li>¿Perdiste alguna oportunidad por no tener una entidad o cuenta en EE.UU.?</li>
      <li>¿Trabajás solo o tenés socios/colaboradores que también cobrarían de la LLC?</li>
    </ul>

    <div class="block-title">Cómo cuantificar el impacto</div>
    <div class="script">"¿Cuánto vale el contrato promedio de un cliente de EE.UU. que hoy no podés tomar? Con cerrar uno solo el año que viene, la estructura ya te rindió."</div>

    <div class="flag">
      <b>Nota fiscal para calificar</b><br>
      El freelancer tech que trabaja fuera de EE.UU. sin presencia física allí generalmente no genera ingreso conectado a EE.UU., pero sí tiene el 5472 anual. Si tiene socios (multi-miembro), el tratamiento fiscal cambia: no minimices esto, dejalo para que lo confirme el equipo de Filings.
    </div>
  </div>

  <div class="profile">
    <div class="profile-head"><span class="num">PERFIL 03</span><h2>Servicios profesionales / Consultoría</h2></div>
    <div class="pain">El dolor real: necesita imagen y respaldo internacional para cobrar más y competir por cuentas globales. Una entidad en EE.UU. le da credibilidad frente a clientes que no confían en un monotributista.</div>

    <div class="block-title">Preguntas de discovery</div>
    <ul class="q">
      <li>¿Qué tipo de clientes querés atraer que hoy no estás alcanzando?</li>
      <li>¿Te pasó que un cliente potencial dudó por no tener una estructura formal o internacional?</li>
      <li>¿Cómo te posicionás frente a la competencia? ¿Dónde sentís que perdés terreno?</li>
      <li>¿Facturás a clientes de varios países o pensás expandirte a EE.UU.?</li>
    </ul>

    <div class="block-title">Cómo cuantificar el impacto</div>
    <div class="script">"Si tener una entidad en EE.UU. te permite subir tu tarifa un 15 o 20 por ciento porque proyectás otra escala, ¿cuánto es eso al año sobre tu facturación actual?"</div>

    <div class="flag">
      <b>Nota fiscal para calificar</b><br>
      El servicio prestado de forma remota desde el país del cliente en general no crea obligación de impuesto federal, pero la obligación informativa (5472) sigue. El valor acá es posicionamiento y cobro, no ahorro fiscal: vendé por ese lado.
    </div>
  </div>

  <div class="profile">
    <div class="profile-head"><span class="num">PERFIL 04</span><h2>Protección de activos / Holding</h2></div>
    <div class="pain">El dolor real: quiere separar patrimonio del riesgo operativo, tener activos fuera de la inestabilidad local, y estructurar con orden. Busca seguridad y previsibilidad, no facturación.</div>

    <div class="block-title">Preguntas de discovery</div>
    <ul class="q">
      <li>¿Qué querés proteger y de qué escenario concreto? (riesgo país, litigios, separación patrimonial)</li>
      <li>¿Tenés hoy activos o inversiones que quieras ordenar bajo una estructura?</li>
      <li>¿Buscás una entidad operativa o una holding que solo tenga y administre?</li>
      <li>¿Ya trabajás con un contador o asesor patrimonial que deba estar en la conversación?</li>
    </ul>

    <div class="block-title">Cómo cuantificar el impacto</div>
    <div class="script">"¿Qué valor tiene para vos dormir tranquilo sabiendo que ese patrimonio está fuera de riesgo local y bien estructurado? El costo de la estructura es una fracción de lo que protege."</div>

    <div class="flag">
      <b>Nota fiscal para calificar</b><br>
      Las holdings que mantienen activos suelen tener transacciones reportables (aportes de capital) que igual disparan el 5472. Si hay inmuebles en EE.UU. de por medio, aparecen otras reglas (por ejemplo retenciones): no improvises, marcá que Filings lo revisa. El paquete natural acá es All-in por el cumplimiento anual.
    </div>
  </div>

  <div class="profile">
    <div class="profile-head"><span class="num">PERFIL 05</span><h2>E-commerce propio (Shopify y similares)</h2></div>
    <div class="pain">El dolor real: los procesadores de pago (Stripe, PayPal, pasarelas) le limitan o le retienen fondos por no tener entidad de EE.UU., y no puede escalar campañas ni vender a EE.UU. con confianza.</div>

    <div class="block-title">Preguntas de discovery</div>
    <ul class="q">
      <li>¿Con qué plataforma y qué procesador de pagos operás hoy? ¿Tuviste bloqueos o retenciones?</li>
      <li>¿A qué mercados vendés y cuál querés abrir que hoy no podés?</li>
      <li>¿Cuánto invertís en publicidad por mes? ¿La estructura de pagos te está frenando el escalado?</li>
      <li>¿Manejás inventario propio, dropshipping, o marca propia?</li>
    </ul>

    <div class="block-title">Cómo cuantificar el impacto</div>
    <div class="script">"Si tu procesador te retiene o limita por no tener entidad en EE.UU., ¿cuánto capital de trabajo tenés trabado ahora mismo? Destrabarlo suele valer varias veces el costo de la LLC."</div>

    <div class="flag">
      <b>Nota fiscal para calificar</b><br>
      Igual que FBA: la venta online sin presencia física en EE.UU. normalmente no genera impuesto federal sobre la renta, pero sí el 5472 anual. Si maneja inventario en EE.UU. propio, confirmá antes de afirmar nada.
    </div>
  </div>

  <div class="profile">
    <div class="profile-head"><span class="num">PERFIL 06</span><h2>Trading / Cripto</h2></div>
    <div class="pain">El dolor real: quiere operar en plataformas que exigen entidad, ordenar la operatoria y separar el riesgo personal. Suele tener dudas fuertes sobre legalidad y reporte, y desconfía.</div>

    <div class="block-title">Preguntas de discovery</div>
    <ul class="q">
      <li>¿En qué operás y en qué plataformas? ¿Alguna te exige una entidad para operar o retirar?</li>
      <li>¿Buscás la LLC para acceder a plataformas, para ordenar la operatoria, o para separar riesgo?</li>
      <li>¿Qué te preocupa más del tema: el acceso, la parte impositiva, o la seguridad jurídica?</li>
      <li>¿Trabajás con un contador que entienda cripto y deba validar la estructura?</li>
    </ul>

    <div class="block-title">Cómo cuantificar el impacto</div>
    <div class="script">"Si la falta de entidad te cierra el acceso a la plataforma o al volumen que querés operar, ¿qué oportunidad concreta estás dejando pasar por mes?"</div>

    <div class="flag">
      <b>Nota fiscal para calificar · MÁXIMA PRUDENCIA</b><br>
      Este perfil es el de mayor riesgo de sobreventa y de expectativas equivocadas. La tributación de cripto depende mucho del país de residencia del cliente y de la actividad. No des ninguna afirmación fiscal concreta. Calificá, ofrecé la estructura, y derivá toda pregunta impositiva específica a que la revise un profesional. Registrá bien la conversación en HubSpot.
    </div>
  </div>

  <div class="dark-page">
    <span class="chip" style="background:transparent;">Cierre para todos los perfiles</span>
    <h2 style="margin:10px 0 4px;">Cerrar con segunda fecha</h2>
    <p class="label" style="margin-bottom:14px;">Nunca termines con "te mando la propuesta y quedamos en contacto"</p>

    <ul class="q">
      <li><strong style="color:var(--orange)">Resumí:</strong> "Por lo que me contás, lo que más te sirve es [paquete] porque [dolor concreto que dijo]."</li>
      <li><strong style="color:var(--orange)">Propuesta + fecha:</strong> "Te mando la propuesta hoy y te contacto el [día concreto] a las [hora] para resolver dudas y, si tiene sentido, avanzamos. ¿Te queda bien ese día?"</li>
      <li><strong style="color:var(--orange)">Compromiso sí/no:</strong> "Perfecto. Ese día me confirmás si avanzás o no, así no te persigo con mensajes. ¿Va?"</li>
      <li><strong style="color:var(--orange)">Registro:</strong> Cargá en HubSpot el próximo contacto agendado y sumá el seguimiento.</li>
    </ul>
  </div>

  <div class="footer">
    <span>Firmaway · Documento interno</span>
    <span>Equipo comercial · No compartir con leads</span>
  </div>

</div>
`;

export default function Guide() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Guía de Discovery por Perfil — Firmaway</title>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      </Head>
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 10,
          background: 'rgba(49,53,61,0.06)', border: 'none', borderRadius: 8,
          padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#31353D',
          cursor: 'pointer', fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        ‹ Inicio
      </button>
      <div className="guide-doc" dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
