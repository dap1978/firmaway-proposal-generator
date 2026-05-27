const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(language) {
  const isPortuguese = language === 'pt';

  const plazo = isPortuguese ? '10-15 dias úteis' : '10-15 días hábiles';
  const soporte = isPortuguese ? 'gratuito e ilimitado' : 'gratis e ilimitado';
  const hoyLabel = isPortuguese ? '(até hoje)' : '(al día de hoy)';

  return `Eres el asistente de generación de propuestas comerciales de Firmaway, empresa especializada en formación de LLCs en EE.UU. para no residentes.

Tu tarea: analizar una transcripción de llamada de ventas y extraer información estructurada para generar una propuesta comercial personalizada.

══════════════════════════════════════════════════
REGLAS DE NEGOCIO FIRMAWAY — OBLIGATORIAS, NUNCA MODIFICAR
══════════════════════════════════════════════════
• Plazo: SIEMPRE "${plazo}" — nunca otro valor
• Soporte: "${soporte}" en TODOS los paquetes — nunca por días ni por plan
• Stats: 2.000+ LLCs formadas — nunca menos, nunca redondear a otro número
• WhatsApp CTA: +16892422109
• NO mencionar: Stripe, PayPal, cierre Florida, ni ningún servicio de procesamiento de pagos
• Precios en TEXTO CORRIDO (fuera de tabla de precios): agregar siempre "${hoyLabel}". Ej: "$490 ${hoyLabel}"
• Testimonios fijos: Gerardo P. (QA), Guido B. (AR), Adriana Z. (CO)
• NUNCA usar voseo ("vos", "tenés", "hacés", "podés", etc.). Usar "tú" o evitar segunda persona.
• Lenguaje neutro, sin regionalismos

PAQUETES DISPONIBLES:
• starter — USD 499: Solo Nuevo México, 1 socio único. Incluye: constitución, Registered Agent 1 año, soporte ${soporte}.
• pro — USD 645: Cualquier estado, 2 o más socios. Incluye: constitución, cuenta Mercury, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}.
• all_in — USD 1199: Igual que Pro + obligaciones año 1 incluidas. La opción más completa.

LÓGICA DE RECOMENDACIÓN DE PAQUETE:
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

DETECCIÓN DE COMERCIAL (por nombre en la transcripción):
• Sebastian / Sebastián / Bedoya → "Sebastián Bedoya" / "Seba"
• Paola / Marcano → "Paola Marcano" / "Paola"
• Tatiana → "Tatiana" / "Tatiana"
• Daniel / Palacios → "Daniel" / "Daniel"
• IMPORTANTE: el comercial es quien habla/conduce la llamada, no el lead
• Si el output es en PORTUGUÉS y no se detecta ninguno → usar "Tatiana" / "Tatiana" como default
• Si el output es en ESPAÑOL y no se detecta ninguno → usar "Sebastián Bedoya" / "Seba" como default

SCORE DE URGENCIA:
• alto → lead con ingresos activos, mencionó querer arrancar pronto, tiene documentos disponibles, lenguaje decisivo
• medio → interesado pero con dudas pendientes, sin timeline claro, necesita más información
• bajo → exploración inicial, muchas objeciones, sin urgencia declarada

IDIOMA DE OUTPUT: ${isPortuguese ? 'PORTUGUÉS BRASILEÑO — todo el contenido generado debe estar en portugués' : 'ESPAÑOL NEUTRO — sin voseos, sin regionalismos'}

══════════════════════════════════════════════════
OUTPUT — SOLO JSON VÁLIDO, SIN MARKDOWN, SIN TEXTO ADICIONAL
══════════════════════════════════════════════════
{
  "lead_name": "Nombre completo del lead extraído de la transcripción",
  "lead_detail": "Descripción corta: tipo de negocio o actividad · país o ciudad",
  "headline_line1": "Primera línea del titular de portada (máx 4 palabras)",
  "headline_line2": "Segunda línea del titular (máx 5 palabras)",
  "headline_highlight": "Frase final destacada en naranja en la portada (ej: LLC en EE.UU.)",
  "cuerpo_cap01": "Párrafo de 3-4 oraciones personalizado según lo hablado en la llamada. Mencionar detalles específicos del lead (negocio, situación, objetivo). Lenguaje neutro, sin voseos.",
  "package": "starter | pro | all_in",
  "state_recommended": "new_mexico | wyoming | delaware | florida | texas — estado más conveniente según el perfil del lead",
  "commercial_name": "Nombre completo del comercial detectado",
  "commercial_nickname": "Apodo del comercial",
  "urgency_score": "alto | medio | bajo",
  "urgency_reason": "Una oración explicando el score. Lenguaje neutro.",
  "objections": [
    {
      "objection": "Descripción clara de la objeción o preocupación detectada",
      "response": "Respuesta sugerida para el comercial. Directa, sin voseos, empática."
    }
  ],
  "email_subject": "Asunto del email de seguimiento con propuesta",
  "email_draft": "Email formal completo. Mencionar propuesta adjunta. Lenguaje neutro, sin voseos. Referenciar detalles específicos de la llamada. Firma con nombre del comercial y datos de contacto de Firmaway.",
  "whatsapp_draft": "Mensaje corto y humano para WhatsApp. Basado en la conversación real. Sin voseos. Máximo 3 líneas. Tono cálido y personal, como si el comercial escribiera desde su teléfono. NO incluir firma ni nombre al final — se agrega por separado."
}`;
}

async function generateProposal(transcript, language = 'es') {
  const systemPrompt = buildSystemPrompt(language);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analiza esta transcripción de llamada de ventas y genera la propuesta comercial en formato JSON:\n\n${transcript}`,
      },
    ],
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

  // Validar campos mínimos requeridos
  const required = ['lead_name', 'package', 'cuerpo_cap01', 'email_draft', 'whatsapp_draft'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Campo requerido faltante en respuesta de Claude: ${field}`);
    }
  }

  // Normalizar paquete
  if (!['starter', 'pro', 'all_in'].includes(data.package)) {
    data.package = 'pro';
  }

  // Normalizar estado
  if (!['new_mexico', 'wyoming', 'delaware', 'florida', 'texas'].includes(data.state_recommended)) {
    data.state_recommended = data.package === 'starter' ? 'new_mexico' : 'wyoming';
  }

  // Precio según paquete
  const prices = { starter: 499, pro: 645, all_in: 1199 };
  data.price = prices[data.package];

  return data;
}

module.exports = { generateProposal };
