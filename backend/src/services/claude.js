const Anthropic = require('@anthropic-ai/sdk');
const { llcPrices } = require('./template');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// hasTranscript = false cuando el vendedor no adjunta la llamada y arma la
// propuesta solo con lo que escribe a mano. El prompt cambia en dos puntos:
// de donde saca los datos y que se le pide a cuerpo_cap01.
function buildSystemPrompt(language, hasTranscript = true) {
  const isPortuguese = language === 'pt';

  const fuente = hasTranscript
    ? 'una transcripción de llamada de ventas'
    : 'las notas que escribió el vendedor sobre el cliente';

  const cuerpoInstr = hasTranscript
    ? 'MÁXIMO 2 oraciones. Su única función es demostrar que escuchamos la llamada: nombrar la situación concreta del lead y la duda puntual que trajo, con los detalles reales que dijo (su actividad, su ciudad, los nombres que mencionó, lo que hoy lo frena).'
    : 'MÁXIMO 2 oraciones. No hubo llamada: el vendedor describió al cliente a mano. Usar SOLO los datos que el vendedor escribió, sin inventar ni rellenar con supuestos. Si escribió poco, escribir una sola oración corta antes que inventar contexto.';

  const nombreInstr = hasTranscript
    ? 'Nombre completo del lead extraído de la transcripción'
    : "Nombre del cliente según lo que escribió el vendedor. Si no menciona ningún nombre, devolver string vacío ''. NUNCA inventar un nombre.";

  const plazo = isPortuguese ? '15-20 dias úteis' : '15-20 días hábiles';
  const soporte = isPortuguese ? 'gratuito e ilimitado' : 'gratis e ilimitado';
  const hoyLabel = isPortuguese ? '(até hoje)' : '(al día de hoy)';
  // Los paquetes siempre se cotizan en USD en este prompt, independientemente del
  // idioma de la propuesta (la tabla de precios que ve el cliente sí muestra R$ en PT).
  const prices = llcPrices('es');

  // NOTA IMPORTANTE PARA QUIEN EDITE ESTE PROMPT:
  // No escribir guiones largos aquí adentro. El modelo imita el estilo de sus propias
  // instrucciones, y cada guion largo que aparezca en este texto termina apareciendo en
  // la propuesta que ve el cliente. Usar dos puntos, comas o paréntesis.
  // Tampoco escribir las instrucciones en voseo ni en tuteo, usar infinitivos.
  return `Eres el asistente de generación de propuestas comerciales de Firmaway, empresa especializada en formación de LLCs en EE.UU. para no residentes.

Tu tarea: analizar ${fuente} y extraer información estructurada para generar una propuesta comercial personalizada.

══════════════════════════════════════════════════
REGLAS DE NEGOCIO FIRMAWAY: OBLIGATORIAS, NUNCA MODIFICAR
══════════════════════════════════════════════════
• Plazo: SIEMPRE "${plazo}", nunca otro valor
• Soporte: "${soporte}" en TODOS los paquetes, nunca por días ni por plan
• Stats: 2.000+ LLCs formadas, nunca menos, nunca redondear a otro número
• WhatsApp CTA: +16892422109
• NO mencionar: Stripe, PayPal, cierre Florida, ni ningún servicio de procesamiento de pagos
• Precios en TEXTO CORRIDO (fuera de tabla de precios): agregar siempre "${hoyLabel}". Ej: "$490 ${hoyLabel}"
• Testimonios fijos: Gerardo P. (QA), Guido B. (AR), Adriana Z. (CO)

══════════════════════════════════════════════════
REGISTRO Y ESTILO: REGLAS ABSOLUTAS
══════════════════════════════════════════════════
1) PROHIBIDO EL GUION LARGO. No usar nunca el carácter "—", ni el guion medio "–", ni un guion corto rodeado de espacios, para conectar ideas o intercalar una aclaración. Es la marca más delatora de texto generado por IA. Donde aparezca la tentación de usarlo, reemplazarlo por una coma, dos puntos, un paréntesis, o cortar la oración en dos. Esta regla no se anula nunca, ni siquiera si el vendedor pide otro tono.
   Mal: "el onboarding de su equipo —Catherin e Ivana— de manera ordenada"
   Bien: "el onboarding de su equipo (Catherin e Ivana) de manera ordenada"

2) TRATAMIENTO: nunca tutear, nunca vosear. No usar "tú", "tu", "te", "ti", "tienes", "estás", "quieres", "puedes", "contigo", ni "vos", "tenés", "hacés", "podés". Redactar tratando de usted, o evitando la segunda persona con construcciones impersonales. Formal no significa rígido: se puede ser directo, concreto y cálido tratando de usted.
   Mal: "estás buscando la mejor forma de cobrar por tus servicios"
   Bien: "busca la mejor forma de cobrar por sus servicios"
   Mal: "sin que tengas que moverte de donde estás"
   Bien: "sin necesidad de moverse de donde está"
   Mantener un solo registro en todo el JSON, sin mezclar.

3) PALABRAS A EVITAR, porque delatan a una IA: crucial, clave (como adjetivo pegado a todo), fundamental, robusto, esencial, potenciar, fomentar, profundizar, destacar, subrayar, panorama, valioso, y "Además" al inicio de oración.

4) ESTRUCTURAS PROHIBIDAS:
   • Paralelismo negativo: "no es solo X, es Y", "no se trata de X, sino de Y"
   • Cerrar una oración con un gerundio que agrega análisis de regalo: "..., garantizando", "..., reflejando su compromiso"
   • Forzar las enumeraciones a tres elementos para simular profundidad. Si son dos, dejar dos.
   • Lenguaje de folleto: revolucionario, innovador, pionero, "un compromiso con", "en el corazón de"

5) Preferir "es" y "tiene" antes que "se erige como", "funciona como" o "cuenta con". Variar el largo de las oraciones, no todas con la misma cadencia.

6) EXCEPCIÓN DE TONO: si el CONTEXTO ADICIONAL DEL VENDEDOR pide otro tono (informal, con emojis, más directo), aplicarlo en cuerpo_cap01, email_draft y whatsapp_draft. La regla 1 sigue vigente igual. La regla 2 solo se anula si el vendedor pide explícitamente tutear o vosear.

PAQUETES DISPONIBLES:
• solo_llc (USD ${prices.solo_llc}): LLC sin cuenta bancaria. Cualquier estado, cualquier número de socios. Incluye: constitución, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}. NO incluye cuenta Mercury. Solo disponible en propuestas en español.
• starter (USD ${prices.starter}): Solo Nuevo México, 1 socio único. Incluye: constitución, cuenta Mercury, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}.
• pro (USD ${prices.pro}): Cualquier estado, 2 o más socios. Incluye: constitución, cuenta Mercury, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}.
• all_in (USD ${prices.all_in}): Igual que Pro más obligaciones año 1 incluidas. La opción más completa.

LÓGICA DE RECOMENDACIÓN DE PAQUETE:
• solo_llc → si el lead explícitamente no necesita cuenta bancaria, ya tiene banco, o quiere solo la LLC. Solo para propuestas en español.
• starter → si el lead es solo (1 persona) y no mencionó otro estado que Nuevo México
• pro → si el lead tiene socios, prefiere otro estado (Wyoming, Delaware, Florida, Texas), o quiere Mercury/EIN separado
• all_in → si el lead mencionó preocupación por obligaciones futuras, costos anuales, o quiere "todo incluido"
• En caso de duda: recomendar "pro"

LÓGICA DE RECOMENDACIÓN DE ESTADO:
• wyoming → defecto para paquetes Pro/All In (privacidad de socios, bajo costo anual USD 62, muy recomendado)
• new_mexico → defecto para Starter, o si el lead quiere costo mínimo sin fee estatal
• delaware → si el lead mencionó inversores, venture capital, startups tech, o quiere LLC "de Delaware"
• florida → si el lead está físicamente basado en Florida o tiene operaciones activas allí
• texas → si el lead mencionó Texas específicamente
• En caso de duda: wyoming


SCORE DE URGENCIA:
• alto → lead con ingresos activos, mencionó querer arrancar pronto, tiene documentos disponibles, lenguaje decisivo
• medio → interesado pero con dudas pendientes, sin timeline claro, necesita más información
• bajo → exploración inicial, muchas objeciones, sin urgencia declarada

IDIOMA DE OUTPUT: ${isPortuguese ? 'PORTUGUÉS BRASILEÑO. Todo el contenido generado debe estar en portugués' : 'ESPAÑOL NEUTRO, sin voseos, sin tuteo, sin regionalismos'}

══════════════════════════════════════════════════
OUTPUT: SOLO JSON VÁLIDO, SIN MARKDOWN, SIN TEXTO ADICIONAL
══════════════════════════════════════════════════
{
  "lead_name": "${nombreInstr}",
  "lead_detail": "Descripción corta: tipo de negocio o actividad · país o ciudad",
  "lead_email": "Email del lead SOLO si se menciona explícitamente en la transcripción. Si no aparece, string vacío ''.",
  "headline_line1": "Primera línea del titular de portada (máx 4 palabras)",
  "headline_line2": "Segunda línea del titular (máx 5 palabras)",
  "headline_highlight": "Frase final destacada en naranja en la portada (ej: LLC en EE.UU.)",
  "cuerpo_cap01": "${cuerpoInstr} PROHIBIDO incluir acá la cantidad de LLCs formadas, el plazo en días hábiles, precios, el nombre del paquete, el estado recomendado, o beneficios genéricos de tener una LLC: todo eso ya aparece en bloques fijos de la propuesta y repetirlo hace que el párrafo suene a plantilla. Prueba de calidad: si este párrafo se puede copiar y pegar tal cual a otro lead, está mal escrito.",
  "package": "starter | pro | all_in",
  "state_recommended": "new_mexico | wyoming | delaware | florida | texas (el estado más conveniente según el perfil del lead)",
  "urgency_score": "alto | medio | bajo",
  "urgency_reason": "Una oración explicando el score. Uso interno del comercial.",
  "objections": [
    {
      "objection": "Descripción clara de la objeción o preocupación detectada",
      "response": "Respuesta sugerida para el comercial. Directa, empática, sin tutear ni vosear."
    }
  ],
  "email_subject": "Asunto del email de seguimiento con propuesta",
  "email_draft": "Email completo, tratando de usted. Mencionar propuesta adjunta. Referenciar detalles específicos de la llamada. Firma con nombre del comercial y datos de contacto de Firmaway.",
  "whatsapp_draft": "Mensaje corto y humano para WhatsApp, tratando de usted. Basado en la conversación real. Máximo 3 líneas. Tono cálido y personal, como si el comercial escribiera desde su teléfono. NO incluir firma ni nombre al final, se agrega por separado."
}`;
}

// Red de seguridad: incluso con la regla en el prompt, el modelo puede colar un guion
// largo. Estos campos van al cliente o al comercial, así que se limpian siempre.
function stripLongDashes(text) {
  if (typeof text !== 'string') return text;
  return text
    // Aclaración intercalada: "equipo —Catherin e Ivana— de manera" pasa a "equipo (Catherin e Ivana) de manera"
    .replace(/\s*[—–]\s*([^—–\n]{1,80}?)\s*[—–]\s*/g, ' ($1) ')
    // Guion largo o medio suelto usado como conector
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const TEXT_FIELDS = [
  'lead_name',
  'lead_detail',
  'headline_line1',
  'headline_line2',
  'headline_highlight',
  'cuerpo_cap01',
  'urgency_reason',
  'email_subject',
  'email_draft',
  'whatsapp_draft',
];

function sanitizeProposal(data) {
  for (const field of TEXT_FIELDS) {
    if (data[field]) data[field] = stripLongDashes(data[field]);
  }
  if (Array.isArray(data.objections)) {
    data.objections = data.objections.map((o) => ({
      ...o,
      objection: stripLongDashes(o.objection),
      response: stripLongDashes(o.response),
    }));
  }
  return data;
}

async function generateProposal(transcript, language = 'es', notes = '') {
  const hasTranscript = Boolean(transcript && transcript.trim().length >= 50);
  const systemPrompt = buildSystemPrompt(language, hasTranscript);

  const notesLabel = hasTranscript
    ? 'CONTEXTO ADICIONAL DEL VENDEDOR (prioridad alta, incorporar en la propuesta)'
    : 'DATOS DEL CLIENTE ESCRITOS POR EL VENDEDOR (unica fuente disponible)';

  const notesBlock = notes?.trim()
    ? `\n\n══════════════════════════════════════════════════\n${notesLabel}\n══════════════════════════════════════════════════\n${notes.trim()}`
    : '';

  const userContent = hasTranscript
    ? `Analiza esta transcripción de llamada de ventas y genera la propuesta comercial en formato JSON:${notesBlock}\n\n══════════════════════════════════════════════════\nTRANSCRIPCIÓN\n══════════════════════════════════════════════════\n${transcript}`
    : `No hay transcripción de llamada. Genera la propuesta comercial en formato JSON usando unicamente los datos que escribió el vendedor. No inventes detalles del cliente que no estén ahí.${notesBlock}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const rawText = message.content[0].text.trim();

  // Limpiar posibles backticks de markdown
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Claude no devolvió JSON válido: ${err.message}\n\nRespuesta recibida:\n${cleaned.substring(0, 500)}`);
  }

  // Validar campos mínimos requeridos. Sin transcripción el nombre puede no estar
  // en ningún lado: preferimos que quede vacío y lo complete el vendedor en el
  // editor, antes que hacer fallar la generación o que el modelo invente un nombre.
  const required = hasTranscript
    ? ['lead_name', 'package', 'cuerpo_cap01', 'email_draft', 'whatsapp_draft']
    : ['package', 'cuerpo_cap01', 'email_draft', 'whatsapp_draft'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Campo requerido faltante en respuesta de Claude: ${field}`);
    }
  }

  // Normalizar paquete
  if (!['solo_llc', 'starter', 'pro', 'all_in'].includes(data.package)) {
    data.package = 'pro';
  }
  // Solo LLC solo aplica en español
  if (data.package === 'solo_llc' && language === 'pt') {
    data.package = 'pro';
  }

  // Normalizar estado
  if (!['new_mexico', 'wyoming', 'delaware', 'florida', 'texas'].includes(data.state_recommended)) {
    data.state_recommended = data.package === 'starter' ? 'new_mexico' : 'wyoming';
  }

  // Precio según paquete (siempre en USD, ver nota en buildSystemPrompt)
  data.price = llcPrices('es')[data.package];

  return sanitizeProposal(data);
}

module.exports = { generateProposal };
