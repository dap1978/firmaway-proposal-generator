const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(language) {
  const isPortuguese = language === 'pt';

  const plazo = isPortuguese ? '15-20 dias úteis' : '15-20 días hábiles';
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
• Lenguaje neutro por defecto — SALVO que el CONTEXTO ADICIONAL DEL VENDEDOR indique otro tono (informal, emojis, directo, etc.). En ese caso, aplicar ese tono en cuerpo_cap01, email_draft y whatsapp_draft.
• NUNCA usar voseo ("vos", "tenés", "hacés", "podés", etc.) salvo que el vendedor lo indique explícitamente en el contexto adicional.

PAQUETES DISPONIBLES:
• solo_llc — USD 495: LLC sin cuenta bancaria. Cualquier estado, cualquier número de socios. Incluye: constitución, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}. NO incluye cuenta Mercury. Solo disponible en propuestas en español.
• starter — USD 499: Solo Nuevo México, 1 socio único. Incluye: constitución, cuenta Mercury, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}.
• pro — USD 645: Cualquier estado, 2 o más socios. Incluye: constitución, cuenta Mercury, EIN, Registered Agent 1 año, Operating Agreement, soporte ${soporte}.
• all_in — USD 1199: Igual que Pro + obligaciones año 1 incluidas. La opción más completa.

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

async function generateProposal(transcript, language = 'es', notes = '') {
  const systemPrompt = buildSystemPrompt(language);

  const notesBlock = notes?.trim()
    ? `\n\n══════════════════════════════════════════════════\nCONTEXTO ADICIONAL DEL VENDEDOR (prioridad alta — incorporar en la propuesta)\n══════════════════════════════════════════════════\n${notes.trim()}`
    : '';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analiza esta transcripción de llamada de ventas y genera la propuesta comercial en formato JSON:${notesBlock}\n\n══════════════════════════════════════════════════\nTRANSCRIPCIÓN\n══════════════════════════════════════════════════\n${transcript}`,
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

  // Precio según paquete
  const prices = { starter: 499, pro: 645, all_in: 1199 };
  data.price = prices[data.package];

  return data;
}

module.exports = { generateProposal };
