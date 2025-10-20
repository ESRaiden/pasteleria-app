require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. --- Definición de Herramientas (Las acciones que la IA puede realizar) ---
const tools = [
  {
    type: "function",
    function: {
      name: "update_folio_data",
      description: "Modifica uno o más campos de los datos del folio. Usa esta función para corregir o añadir información como el nombre del cliente, la fecha de entrega, el número de personas, etc.",
      parameters: {
        type: "object",
        properties: {
          updates: {
            type: "object",
            description: "Un objeto con los campos a actualizar y sus nuevos valores. Por ejemplo: {'clientName': 'Juan Pérez', 'deliveryDate': '2025-12-24'}",
          },
        },
        required: ["updates"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_folio_pdf",
      description: "Finaliza la conversación y crea el folio oficial con los datos actuales. Usa esta función SOLAMENTE cuando el usuario te lo pida explícitamente (ej. 'crea el folio', 'genera el pdf', 'termina y guarda').",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "answer_question_from_context",
      description: "Responde a una pregunta directa del usuario basándote únicamente en el historial de la conversación con el cliente de WhatsApp.",
      parameters: {
        type: "object",
        properties: {
          answer: {
            type: "string",
            description: "La respuesta directa a la pregunta del usuario, extraída del contexto proporcionado."
          }
        },
        required: ["answer"]
      }
    }
  }
];


/**
 * Procesa un nuevo mensaje del usuario y obtiene la siguiente respuesta o acción del asistente de IA.
 * @param {object} session - La sesión de IA actual de la base de datos.
 * @param {string} userMessage - El nuevo mensaje del empleado.
 * @returns {object} - La respuesta del asistente, que puede ser un mensaje de texto o una solicitud para llamar a una función.
 */
exports.getNextAssistantResponse = async (session, userMessage) => {
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // 2. --- Construcción del Contexto para la IA ---
  const systemPrompt = `
    Eres un asistente de pastelería ultra eficiente. Tu trabajo es ayudar al empleado a finalizar un pedido.
    La fecha de hoy es ${today}.

    Tienes tres herramientas a tu disposición:
    1. 'update_folio_data': para modificar los detalles del pedido.
    2. 'generate_folio_pdf': para finalizar el proceso y crear el folio.
    3. 'answer_question_from_context': para responder preguntas sobre la conversación original.

    A continuación se te proporciona todo el contexto:
    
    --- INICIO CONVERSACIÓN ORIGINAL WHATSAPP ---
    ${session.whatsappConversation}
    --- FIN CONVERSACIÓN ORIGINAL WHATSAPP ---

    --- INICIO DATOS DEL PEDIDO (ESTADO ACTUAL) ---
    ${JSON.stringify(session.extractedData, null, 2)}
    --- FIN DATOS DEL PEDIDO (ESTADO ACTUAL) ---

    Basado en el nuevo mensaje del empleado, decide si debes usar una de tus herramientas o si debes responder con texto.
    Si actualizas datos, responde con un mensaje de confirmación claro y conciso.
  `;

  // Construimos el historial de mensajes para la IA
  const messages = [
    { role: "system", content: systemPrompt },
    ...(session.chatHistory || []), // Historial previo de esta sesión
    { role: "user", content: userMessage } // Nuevo mensaje del empleado
  ];

  // 3. --- Llamada a la API de OpenAI ---
  console.log("🤖 Enviando petición a OpenAI con el contexto...");
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview", // Un modelo más potente para manejar herramientas
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log("✅ Respuesta recibida de OpenAI.");
  return response.choices[0].message;
};