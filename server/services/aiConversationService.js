require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Definición de Herramientas (Tools) ---
const tools = [
  {
    type: "function",
    function: {
      name: "update_folio_data",
      description: "Modifica, añade o elimina campos de los datos del pedido. Para eliminar un campo, actualízalo con un valor nulo (null).",
      parameters: {
        type: "object",
        properties: {
          updates: {
            type: "object",
            description: "Un objeto con los campos a actualizar y sus nuevos valores. Ejemplo para actualizar: {'clientName': 'Juan Pérez'}. Ejemplo para eliminar: {'dedication': null}",
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

exports.getNextAssistantResponse = async (session, userMessage) => {
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // ==================== INICIO DE LA CORRECCIÓN ====================
  const systemPrompt = `
    Eres un asistente de pastelería ultra eficiente. Tu trabajo es ayudar al empleado a finalizar un pedido.
    La fecha de hoy es ${today}.

    **Regla Crítica**: NUNCA confirmes un cambio en los datos del pedido (como 'datos actualizados') a menos que hayas usado la herramienta \`update_folio_data\`. Tu única forma de modificar los datos es llamando a esa función. No puedes cambiar los datos simplemente con una respuesta de texto.

    Siempre debes basarte en la siguiente estructura de datos para el pedido. Estos son TODOS los campos que puedes modificar:
    - clientName: (string) Nombre del cliente.
    - clientPhone: (string) Teléfono principal.
    - deliveryDate: (string) Fecha de entrega en formato YYYY-MM-DD.
    - deliveryTime: (string) Hora de entrega en formato HH:MM:SS.
    - persons: (number) Cantidad de personas.
    - shape: (string) Forma del pastel.
    - cakeFlavor: (array de strings) Sabores del pan.
    - filling: (array de strings) Rellenos.
    - designDescription: (string) Descripción del decorado.
    - dedication: (string) Texto que irá en el pastel.
    - deliveryLocation: (string) Dirección de entrega o "Recoge en Tienda".
    - deliveryCost: (number) Costo del envío.
    - total: (number) Costo base del pastel (sin envío ni adicionales).
    - advancePayment: (number) Anticipo pagado por el cliente.

    Tus herramientas son:
    1. 'update_folio_data': para modificar los detalles del pedido según la estructura anterior.
    2. 'generate_folio_pdf': para finalizar el proceso.
    3. 'answer_question_from_context': para responder preguntas sobre la conversación original.

    Contexto actual:
    
    --- INICIO CONVERSACIÓN ORIGINAL WHATSAPP ---
    ${session.whatsappConversation}
    --- FIN CONVERSACIÓN ORIGINAL WHATSAPP ---

    --- INICIO DATOS DEL PEDIDO (ESTADO ACTUAL) ---
    ${JSON.stringify(session.extractedData, null, 2)}
    --- FIN DATOS DEL PEDIDO (ESTADO ACTUAL) ---

    Basado en el nuevo mensaje del empleado, decide qué herramienta usar o si debes responder con texto. Si el usuario pide modificar, añadir o eliminar cualquier dato, DEBES usar la herramienta 'update_folio_data'.
  `;
  // ===================== FIN DE LA CORRECCIÓN ======================

  const messages = [
    { role: "system", content: systemPrompt },
    ...(session.chatHistory || []),
    { role: "user", content: userMessage }
  ];

  console.log("🤖 Enviando petición a OpenAI con el contexto...");
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log("✅ Respuesta recibida de OpenAI.");
  return response.choices[0].message;
};