// server/services/aiValidationService.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const OpenAI = require('openai');
const openai = new OpenAI(); // La API key se toma de process.env.OPENAI_API_KEY

async function validateAndSuggest(folioData) {
    console.log("🤖 Iniciando validación y sugerencias con IA...");

    // Prepara los datos relevantes del folio para el prompt
    const relevantData = {
        persons: folioData.persons,
        shape: folioData.shape,
        folioType: folioData.folioType,
        cakeFlavor: folioData.cakeFlavor, // Puede ser array o string JSON
        filling: folioData.filling,       // Puede ser array o string JSON
        tiers: folioData.tiers,           // Puede ser array o string JSON
        designDescription: folioData.designDescription,
        dedication: folioData.dedication,
        accessories: folioData.accessories,
        additional: folioData.additional, // Puede ser array o string JSON
        // Podrías añadir más contexto si es necesario (ej. fecha, hora)
    };

    // Intenta parsear campos JSON por si vienen como string desde el form
    try {
        if (typeof relevantData.cakeFlavor === 'string') relevantData.cakeFlavor = JSON.parse(relevantData.cakeFlavor || '[]');
        if (typeof relevantData.filling === 'string') relevantData.filling = JSON.parse(relevantData.filling || '[]');
         if (typeof relevantData.tiers === 'string') relevantData.tiers = JSON.parse(relevantData.tiers || '[]');
         if (typeof relevantData.additional === 'string') relevantData.additional = JSON.parse(relevantData.additional || '[]');
    } catch (e) {
        console.warn("Error parseando datos JSON para validación IA:", e.message);
        // Continúa con los datos que se pudieron parsear
    }


    const prompt = `
        Eres un asistente experto para la Pastelería La Fiesta. Analiza los siguientes datos PARCIALES de un pedido (folio) y proporciona:
        1.  **Validaciones/Advertencias:** Señala posibles inconsistencias o combinaciones inusuales (MÁXIMO 2).
            * Ej. ¿Es común un pastel redondo para 100 personas?
            * Ej. ¿La combinación de sabor X con relleno Y es frecuente o podría ser extraña?
            * Ej. ¿El pan 3 leches suele llevar relleno? (Generalmente no)
        2.  **Sugerencias Contextuales:** Basado en la información (personas, descripción, dedicatoria), sugiere MÁXIMO 2 adicionales relevantes (velas, letreros, cupcakes, etc.) que NO estén ya listados en 'additional'. Infiere si es cumpleaños por la dedicatoria/descripción.

        **Datos del Folio (Parcial):**
        ${JSON.stringify(relevantData, null, 2)}

        **Reglas de Respuesta:**
        * Responde en formato JSON ÚNICAMENTE.
        * La estructura debe ser: { "warnings": ["mensaje 1", "mensaje 2"], "suggestions": ["mensaje sugerencia 1", "mensaje sugerencia 2"] }
        * Si no hay advertencias o sugerencias, devuelve arrays vacíos ([]).
        * Sé conciso y directo en los mensajes. No uses saludos ni despedidas.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // O el modelo que prefieras
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
        });

        const resultJsonString = response.choices[0].message.content;
        console.log("🤖 Respuesta de Validación/Sugerencia IA:", resultJsonString);
        const result = JSON.parse(resultJsonString);

        // Asegurar que la estructura sea la esperada
        if (!result || !Array.isArray(result.warnings) || !Array.isArray(result.suggestions)) {
            throw new Error("La respuesta de la IA no tiene el formato esperado.");
        }

        return result; // { warnings: [...], suggestions: [...] }

    } catch (error) {
        console.error("❌ Error llamando a OpenAI para validación/sugerencia:", error);
        // Devuelve un error estructurado
        return { warnings: [`Error interno de IA: ${error.message}`], suggestions: [] };
    }
}

module.exports = { validateAndSuggest };