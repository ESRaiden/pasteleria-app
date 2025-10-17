const OpenAI = require('openai');

// La clave de la API se carga automáticamente desde las variables de entorno (process.env.OPENAI_API_KEY)
const openai = new OpenAI();

/**
 * Analiza el texto de una conversación de WhatsApp y extrae los datos del pedido en formato JSON.
 * @param {string} conversationText - El texto completo de la conversación con el cliente.
 * @returns {Promise<object>} - Un objeto con los datos del folio extraídos.
 */
async function extractFolioData(conversationText) {
    // La fecha actual se envía a la IA para que pueda interpretar fechas relativas como "mañana" o "el sábado".
    const today = new Date().toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const prompt = `
        Eres un asistente experto para una pastelería llamada "La Fiesta". Tu tarea es analizar la siguiente conversación de WhatsApp
        y extraer la información clave para generar un folio de pedido. La fecha de hoy es ${today}.

        **Instrucciones:**
        1.  **Analiza la conversación:** Lee todo el texto para entender los detalles del pedido.
        2.  **Interpreta fechas y horas:** Convierte fechas relativas (ej. "mañana", "el próximo lunes", "para este sábado") a un formato AAAA-MM-DD. Convierte las horas a formato de 24 horas (HH:MM:SS).
        3.  **Extrae los datos:** Completa todos los campos del JSON que puedas. Si un campo no se menciona explícitamente en la conversación, déjalo como nulo (null).
        4.  **Formato de Salida:** Responde únicamente con un objeto JSON válido, sin ningún texto adicional antes o después.

        **Campos a extraer:**
        - \`clientName\`: El nombre del cliente.
        - \`clientPhone\`: El número de teléfono del cliente (si se menciona).
        - \`deliveryDate\`: La fecha de entrega en formato YYYY-MM-DD.
        - \`deliveryTime\`: La hora de entrega en formato HH:MM:SS de 24 horas.
        - \`persons\`: El número de personas para el pastel.
        - \`shape\`: La forma del pastel (ej. "Redondo", "Rectangular").
        - \`cakeFlavor\`: Los sabores del pan, como un array de strings.
        - \`filling\`: Los rellenos, como un array de strings.
        - \`designDescription\`: La descripción detallada de la decoración.
        - \`dedication\`: El texto de la dedicatoria si la hay.
        - \`deliveryLocation\`: La dirección de entrega o si "recoge en tienda".
        - \`total\`: El costo total del pedido (solo el número).
        - \`advancePayment\`: El anticipo que dio el cliente (solo el número).

        **Conversación a analizar:**
        ---
        ${conversationText}
        ---
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106", // Un modelo eficiente y optimizado para JSON
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }, // Forzamos la salida en formato JSON
        });

        const extractedJson = response.choices[0].message.content;
        return JSON.parse(extractedJson);

    } catch (error) {
        console.error("❌ Error al contactar la API de OpenAI:", error);
        throw new Error("No se pudieron extraer los datos de la conversación.");
    }
}

module.exports = { extractFolioData };