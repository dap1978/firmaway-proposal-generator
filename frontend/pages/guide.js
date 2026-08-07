import { useEffect, useState } from 'react';
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

const BODY_HTML = {
  es: `
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
`,
  pt: `
<div class="page">

  <div class="top">
    <span class="logo">Firmaway<span>.</span></span>
    <span class="label">Guia rápido comercial · Deixe ao lado do monitor</span>
  </div>

  <h1>Antes, durante e ao fechar cada chamada</h1>
  <p class="subtitle">O mínimo indispensável. O guia completo por perfil fica como material de estudo.</p>

  <div class="nono">
    <h2>Os 4 inegociáveis de toda chamada</h2>
    <ul>
      <li><strong>Prepare-se:</strong> antes da chamada, veja o site ou o Instagram do prospect. Nunca entre no frio.</li>
      <li><strong>Discovery real:</strong> pergunte antes de explicar. Entenda a dor concreta, não só "quer uma LLC".</li>
      <li><strong>Quantifique o impacto:</strong> traduza o problema em dinheiro. Quanto ele perde ou deixa de ganhar sem resolver isso.</li>
      <li><strong>Encerre com uma segunda data:</strong> nunca termine com "te mando a proposta e ficamos em contato".</li>
    </ul>
  </div>

  <div class="cierre" style="background:var(--orange-soft);border-color:var(--orange);box-shadow:3px 3px 0 0 var(--orange);">
    <h2>Passo 1 · 4 perguntas gatilho: revele o perfil</h2>
    <div class="step"><b>1 · Contexto</b><span class="say">"O que você faz?"</span></div>
    <div class="step"><b>2 · Modelo</b><span class="say">"Você vende produtos ou serviços? Online ou físico?"</span></div>
    <div class="step"><b>3 · Estado</b><span class="say">"Você já está faturando ou é um projeto novo?"</span></div>
    <div class="step"><b>4 · Gatilho</b><span class="say">"Por que você está buscando a LLC agora?" (te dá a urgência)</span></div>
    <div class="step" style="margin-top:8px;"><span style="font-size:10.5px;color:var(--ink-light);">Com essas 4 você já sabe qual perfil tem na frente. Passe para as 3 perguntas desse perfil.</span></div>
  </div>

  <div class="perfiles">
    <h2>Passo 2 · 3 perguntas-chave por perfil</h2>
    <div class="cols">
      <div>
        <div class="perfil">
          <div class="pname">Amazon FBA</div>
          <ol><li>Você vende no seu nome pessoal ou de uma entidade? Qual problema te trouxe até aqui?</li><li>Quanto você fatura ou projeta faturar em 6 meses?</li><li>Você opera só online ou tem depósito/funcionários nos EUA?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">SaaS / Freelancer tech</div>
          <ol><li>Algum cliente já pediu para você faturar como empresa ou dos EUA?</li><li>Você já perdeu oportunidades por não ter entidade ou conta lá?</li><li>Quanto vale seu contrato médio nos EUA?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">Serviços / Consultoria</div>
          <ol><li>Que clientes você quer atrair que hoje não consegue alcançar?</li><li>Algum lead já hesitou por você não ter uma estrutura formal?</li><li>Quanto você aumentaria sua tarifa com respaldo internacional?</li></ol>
        </div>
      </div>
      <div>
        <div class="perfil">
          <div class="pname">Proteção de ativos / Holding</div>
          <ol><li>O que você quer proteger e de qual cenário concreto?</li><li>Entidade operacional ou holding que só administra?</li><li>Você trabalha com um contador que precise participar da conversa?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">E-commerce próprio (Shopify)</div>
          <ol><li>Seu processador de pagamentos já bloqueou ou reteve fundos?</li><li>Quanto você investe em ads? Os pagamentos travam sua escala?</li><li>Qual mercado você quer abrir que hoje não consegue?</li></ol>
        </div>
        <div class="perfil">
          <div class="pname">Trading / Cripto</div>
          <ol><li>Alguma plataforma exige entidade para operar ou sacar?</li><li>Você busca acesso, organização da operação, ou separar risco?</li><li>O que te preocupa mais: acesso, impostos ou segurança jurídica?</li></ol>
        </div>
      </div>
    </div>
  </div>

  <div class="cierre" style="margin-top:12px;">
    <h2>Passo 3 · O fechamento, passo a passo</h2>
    <div class="step"><b>1 · Resuma</b><span class="say">"Pelo que você me contou, o que mais te serve é [pacote] porque [dor que ele mencionou]."</span></div>
    <div class="step"><b>2 · Proposta + data concreta</b><span class="say">"Te mando a proposta hoje e te chamo no [dia] às [hora] para tirar dúvidas e, se fizer sentido, avançamos. Fica bom pra você?"</span></div>
    <div class="step"><b>3 · Compromisso sim/não</b><span class="say">"Nesse dia você me confirma se avança ou não, assim eu não fico te perseguindo com mensagens. Combinado?"</span></div>
    <div class="step"><b>4 · Registre no HubSpot</b><span>Cadastre o próximo contato agendado e adicione o follow-up. Mínimo 6 toques antes de considerar perdido.</span></div>
  </div>

  <div class="fiscal">
    <b>Regra de ouro · Não prometer demais</b>
    <p>Nunca prometa "zero impostos" nem "sem obrigações". Toda LLC de dono único estrangeiro apresenta o Form 5472 todo ano (mesmo sem receita) e não fazer isso tem multa a partir de USD 25.000. Use isso para posicionar o All-in, não como argumento de medo. Toda pergunta fiscal específica deve ser direcionada à equipe de Filings. Em Trading/Cripto, máxima prudência: não dê nenhuma afirmação fiscal.</p>
  </div>

  <div class="footer">
    <span>Firmaway · Uso interno da equipe comercial</span>
    <span>Não compartilhar com leads</span>
  </div>

</div>
`,
};

const TITLES = { es: 'Chuleta Comercial — Firmaway', pt: 'Guia Comercial — Firmaway' };

export default function Guide() {
  const router = useRouter();
  const [lang, setLang] = useState('es');

  useEffect(() => {
    const stored = localStorage.getItem('fw_guide_lang');
    if (stored === 'es' || stored === 'pt') setLang(stored);
  }, []);

  function changeLang(next) {
    setLang(next);
    localStorage.setItem('fw_guide_lang', next);
  }

  return (
    <>
      <Head>
        <title>{TITLES[lang]}</title>
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
      <div
        className="no-print"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 10,
          display: 'flex', gap: 4, background: 'rgba(49,53,61,0.06)', borderRadius: 8, padding: 3,
        }}
      >
        {[{ value: 'es', label: 'ES' }, { value: 'pt', label: 'PT' }].map(opt => (
          <button
            key={opt.value}
            onClick={() => changeLang(opt.value)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: '"Inter", system-ui, sans-serif',
              background: lang === opt.value ? '#F15A2F' : 'transparent',
              color: lang === opt.value ? '#fff' : '#31353D',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="guide-doc" dangerouslySetInnerHTML={{ __html: BODY_HTML[lang] }} />
    </>
  );
}
