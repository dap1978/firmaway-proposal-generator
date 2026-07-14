import Head from 'next/head';
import { useRouter } from 'next/router';

const STYLE = `
:root{
  --cream:#FEF1E0; --cream-warm:#FEF1E0; --orange:#F15A2F; --orange-soft:#FDEEE9;
  --ink:#31353D; --ink-light:rgba(49,53,61,0.45); --dark-surface:#3A4557; --white:#FFF;
}
.guide-doc *{margin:0;padding:0;box-sizing:border-box;}
.guide-doc{font-family:'Inter',system-ui,sans-serif;background:var(--cream);color:var(--ink);
  font-size:12px;line-height:16px;-webkit-font-smoothing:antialiased;min-height:100vh;}
.guide-doc .page{max-width:900px;margin:0 auto;padding:22px 26px;}
.guide-doc .logo{font-weight:700;font-size:15px;letter-spacing:-0.03em;}
.guide-doc .logo span{color:var(--orange);}
.guide-doc .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.guide-doc .label{font-weight:500;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;color:var(--ink-light);}
.guide-doc h1{font-weight:800;font-size:22px;line-height:1;letter-spacing:-0.04em;margin-bottom:2px;}
.guide-doc .subtitle{font-size:11px;color:var(--ink-light);margin-bottom:12px;}
.guide-doc .cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.guide-doc .section-title{font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;
  color:var(--orange);margin-bottom:6px;}
.guide-doc .nono{background:var(--dark-surface);color:var(--white);border-radius:12px;padding:14px 16px;margin-bottom:12px;}
.guide-doc .nono h2{color:var(--white);font-size:13px;font-weight:700;margin-bottom:8px;}
.guide-doc .nono ul{list-style:none;}
.guide-doc .nono li{position:relative;padding-left:18px;margin-bottom:5px;font-size:11.5px;line-height:15px;}
.guide-doc .nono li:before{content:"";position:absolute;left:0;top:5px;width:7px;height:7px;background:var(--orange);border-radius:50%;}
.guide-doc .cierre{background:var(--cream-warm);border:1.5px solid var(--ink);border-radius:12px;padding:14px 16px;
  box-shadow:3px 3px 0 0 var(--ink);margin-bottom:12px;}
.guide-doc .cierre h2{font-size:13px;font-weight:700;margin-bottom:8px;}
.guide-doc .step{margin-bottom:7px;font-size:11.5px;line-height:16px;}
.guide-doc .step b{color:var(--orange);text-transform:uppercase;font-size:9px;letter-spacing:0.05em;display:block;}
.guide-doc .step .say{font-style:italic;}
.guide-doc .perfiles{background:var(--white);border:1.5px solid var(--ink);border-radius:12px;padding:12px 14px;}
.guide-doc .perfiles h2{font-size:13px;font-weight:700;margin-bottom:8px;}
.guide-doc .perfil{margin-bottom:9px;padding-bottom:9px;border-bottom:1px solid rgba(49,53,61,0.08);}
.guide-doc .perfil:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.guide-doc .perfil .pname{font-weight:700;font-size:11px;color:var(--orange);margin-bottom:3px;}
.guide-doc .perfil ol{margin-left:15px;font-size:10.5px;line-height:15px;}
.guide-doc .perfil ol li{margin-bottom:1px;}
.guide-doc .fiscal{background:#FFF4F0;border:1.5px solid var(--orange);border-radius:10px;padding:10px 13px;margin-top:12px;}
.guide-doc .fiscal b{color:var(--orange);text-transform:uppercase;font-size:9px;letter-spacing:0.05em;}
.guide-doc .fiscal p{font-size:10.5px;line-height:15px;margin-top:3px;}
.guide-doc .footer{margin-top:12px;padding-top:8px;border-top:1px solid rgba(49,53,61,0.1);
  display:flex;justify-content:space-between;font-size:9px;color:var(--ink-light);
  text-transform:uppercase;letter-spacing:0.06em;}
@page{size:A4;margin:8mm;}
@media print{.guide-doc .page{padding:0;}.no-print{display:none !important;}}
`;

const BODY_HTML = `
<div class="page">

  <div class="top">
    <span class="logo">Firmaway<span>.</span></span>
    <span class="label">Chuleta comercial · Tenela al lado del monitor</span>
  </div>

  <h1>Antes, durante y al cerrar cada llamada</h1>
  <p class="subtitle">Lo mínimo indispensable. La guía completa por perfil queda como material de estudio.</p>

  <div class="nono">
    <h2>Los 4 no-negociables de toda llamada</h2>
    <ul>
      <li><strong>Preparate:</strong> antes de la llamada, mirá la web o el Instagram del prospecto. Nunca entres en frío.</li>
      <li><strong>Discovery real:</strong> preguntá antes de explicar. Entendé el dolor concreto, no solo "quiere una LLC".</li>
      <li><strong>Cuantificá el impacto:</strong> traducí el problema a plata. Cuánto pierde o deja de ganar sin resolverlo.</li>
      <li><strong>Cerrá con segunda fecha:</strong> nunca termines con "te mando la propuesta y quedamos en contacto".</li>
    </ul>
  </div>

  <div class="cierre" style="background:var(--orange-soft);border-color:var(--orange);box-shadow:3px 3px 0 0 var(--orange);">
    <h2>Paso 1 · 4 preguntas disparadoras: revelá el perfil</h2>
    <div class="step"><b>1 · Contexto</b><span class="say">"¿A qué te dedicás?"</span></div>
    <div class="step"><b>2 · Modelo</b><span class="say">"¿Vendés productos o servicios? ¿Online o físico?"</span></div>
    <div class="step"><b>3 · Estado</b><span class="say">"¿Ya estás facturando o es un proyecto nuevo?"</span></div>
    <div class="step"><b>4 · Detonante</b><span class="say">"¿Por qué buscás la LLC ahora?" (te da la urgencia)</span></div>
    <div class="step" style="margin-top:8px;"><span style="font-size:10.5px;color:var(--ink-light);">Con estas 4 ya sabés qué perfil tenés enfrente. Pasá a las 3 preguntas de ese perfil.</span></div>
  </div>

  <div class="perfiles">
    <h2>Paso 2 · 3 preguntas clave por perfil</h2>
    <div class="cols">
      <div>
        <div class="perfil">
          <div class="pname">Amazon FBA</div>
          <ol><li>¿Vendés a nombre personal o de una entidad? ¿Qué problema te trajo?</li><li>¿Cuánto facturás o proyectás en 6 meses?</li><li>¿Operás solo online o tenés depósito/empleados en EE.UU.?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">SaaS / Freelancer tech</div>
          <ol><li>¿Algún cliente te pidió facturar como empresa o desde EE.UU.?</li><li>¿Perdiste oportunidades por no tener entidad o cuenta allá?</li><li>¿Cuánto vale tu contrato promedio de EE.UU.?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">Servicios / Consultoría</div>
          <ol><li>¿Qué clientes querés atraer que hoy no alcanzás?</li><li>¿Un potencial dudó por no tener estructura formal?</li><li>¿Cuánto subirías tu tarifa con respaldo internacional?</li></ol>
        </div>
      </div>
      <div>
        <div class="perfil">
          <div class="pname">Protección de activos / Holding</div>
          <ol><li>¿Qué querés proteger y de qué escenario concreto?</li><li>¿Entidad operativa o holding que solo administre?</li><li>¿Trabajás con un contador que deba estar en la charla?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">E-commerce propio (Shopify)</div>
          <ol><li>¿Tu procesador de pagos te bloqueó o retuvo fondos?</li><li>¿Cuánto invertís en ads? ¿Los pagos te frenan el escalado?</li><li>¿Qué mercado querés abrir que hoy no podés?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">Trading / Cripto</div>
          <ol><li>¿Alguna plataforma te exige entidad para operar o retirar?</li><li>¿Buscás acceso, orden de la operatoria, o separar riesgo?</li><li>¿Qué te preocupa más: acceso, impuestos o seguridad jurídica?</li></ol>
        </div>
      </div>
    </div>
  </div>

  <div class="cierre" style="margin-top:12px;">
    <h2>Paso 3 · El cierre, paso a paso</h2>
    <div class="step"><b>1 · Resumí</b><span class="say">"Por lo que me contás, lo que más te sirve es [paquete] porque [dolor que dijo]."</span></div>
    <div class="step"><b>2 · Propuesta + fecha concreta</b><span class="say">"Te mando la propuesta hoy y te contacto el [día] a las [hora] para dudas y, si tiene sentido, avanzamos. ¿Te queda bien?"</span></div>
    <div class="step"><b>3 · Compromiso sí/no</b><span class="say">"Ese día me confirmás si avanzás o no, así no te persigo con mensajes. ¿Va?"</span></div>
    <div class="step"><b>4 · Registrá en HubSpot</b><span>Cargá el próximo contacto agendado y sumá el seguimiento. Mínimo 6 toques antes de dar por perdido.</span></div>
  </div>

  <div class="fiscal">
    <b>Regla de oro · No sobrevender</b>
    <p>Nunca prometas "cero impuestos" ni "sin obligaciones". Toda LLC de dueño único extranjero presenta el Form 5472 cada año (aunque no tenga ingresos) y no hacerlo tiene multa desde USD 25.000. Usalo para posicionar el All-in, no como argumento de miedo. Toda pregunta impositiva específica se deriva al equipo de Filings. En Trading/Cripto, máxima prudencia: no des ninguna afirmación fiscal.</p>
  </div>

  <div class="footer">
    <span>Firmaway · Uso interno del equipo comercial</span>
    <span>No compartir con leads</span>
  </div>

</div>
`;

export default function Guide() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Chuleta Comercial — Firmaway</title>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      </Head>
      <button
        onClick={() => router.push('/')}
        className="no-print"
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
