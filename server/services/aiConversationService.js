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

  // ==================== INICIO DE LA CORRECCIÓN FINAL ====================
  const systemPrompt = `
    Eres un motor de llamadas a funciones. Tu único propósito es analizar el mensaje del usuario y traducirlo a una llamada de función JSON válida. NO CONVERSES.

    **REGLA MÁXIMA: Tu salida DEBE ser una llamada a una de las herramientas disponibles. No respondas con texto si puedes usar una herramienta.**

    **PROCESO OBLIGATORIO PARA MODIFICACIONES:**
    1.  Lee el mensaje del usuario, por ejemplo: "agrega 80 de envio".
    2.  Identifica el campo a cambiar del JSON de estado actual: 'deliveryCost'.
    3.  Identifica el nuevo valor: 80.
    4.  Construye el objeto 'updates' EXACTAMENTE así: \`{"deliveryCost": 80}\`.
    5.  Llama a la herramienta \`update_folio_data\` con esos argumentos.

    **MÁS EJEMPLOS:**
    - Si el usuario dice: "el nombre es ana", tu llamada a la herramienta DEBE ser: \`update_folio_data(updates={"clientName": "Ana"})\`
    - Si el usuario dice: "ponle 500 de anticipo", tu llamada a la herramienta DEBE ser: \`update_folio_data(updates={"advancePayment": 500})\`
    - Si el usuario dice: "quita la dedicatoria", tu llamada a la herramienta DEBE ser: \`update_folio_data(updates={"dedication": null})\`

    Si el usuario pide finalizar (ej. "genera el folio"), DEBES llamar a \`generate_folio_pdf\`.

    **Estado Actual del Pedido (JSON):**
    ${JSON.stringify(session.extractedData, null, 2)}

    **Conversación Original del Cliente:**
    ${session.whatsappConversation}
  `;
  // ===================== FIN DE LA CORRECCIÓN FINAL ======================

  const messages = [
    { role: "system", content: systemPrompt },
    ...(session.chatHistory || []),
    { role: "user", content: userMessage }
  ];

  console.log("🤖 Enviando petición a OpenAI con el contexto...");
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // Mantenemos el modelo más potente para asegurar el seguimiento de instrucciones.
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log("✅ Respuesta recibida de OpenAI.");
  return response.choices[0].message;
};