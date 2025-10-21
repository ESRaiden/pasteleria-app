const { AISession, Folio, Client, sequelize } = require('../models');
const { getNextAssistantResponse } = require('../services/aiConversationService');
const folioController = require('./folioController'); // Importamos para reutilizar la lógica de creación

// --- FUNCIONES DE HERRAMIENTA (TOOLS) ---

/**
 * Actualiza los datos del folio en la sesión actual.
 * @param {AISession} session - La instancia de la sesión de Sequelize.
 * @param {object} updates - El objeto con los campos y valores a actualizar.
 */
async function update_folio_data(session, updates) {
  console.log('⚡ Ejecutando herramienta: update_folio_data con:', updates);
  // Unimos los datos existentes con las nuevas actualizaciones
  const updatedData = { ...session.extractedData, ...updates };
  session.extractedData = updatedData; // Sequelize se encarga de detectar el cambio en el JSON
  await session.save();
  return "Datos actualizados exitosamente.";
}

/**
 * Crea el folio final y genera el PDF.
 * @param {AISession} session - La instancia de la sesión de Sequelize.
 * @param {object} req - El objeto de la petición (para acceder al usuario).
 */
async function generate_folio_pdf(session, req) {
    console.log('⚡ Ejecutando herramienta: generate_folio_pdf');
    const folioData = session.extractedData;

    // Extraemos el número de teléfono del remitente de la conversación original como respaldo.
    const phoneMatch = session.whatsappConversation.match(/De:\s*(\d+)/) || session.whatsappConversation.match(/Cliente:\s*(\d+)/);
    const senderPhone = phoneMatch ? phoneMatch[1] : null;
    
    const mockReq = {
        body: {
            clientName: folioData.clientName,
            clientPhone: folioData.clientPhone || senderPhone,
            clientPhone2: folioData.clientPhone2,
            deliveryDate: folioData.deliveryDate,
            deliveryTime: folioData.deliveryTime,
            persons: folioData.persons,
            shape: folioData.shape,
            cakeFlavor: JSON.stringify(folioData.cakeFlavor || []),
            filling: JSON.stringify(folioData.filling || []),
            designDescription: folioData.designDescription,
            dedication: folioData.dedication,
            deliveryLocation: folioData.deliveryLocation,
            total: folioData.total,
            advancePayment: folioData.advancePayment || 0,
            folioType: 'Normal',
            existingImageUrls: JSON.stringify(session.imageUrls || [])
        },
        user: req.user,
        files: []
    };

    let newFolio = null;
    const mockRes = {
        status: (code) => ({
            json: (data) => {
                if (code === 201) {
                    newFolio = data;
                    // CORRECCIÓN: Se accede directamente a newFolio.folioNumber
                    console.log(`Folio #${newFolio.folioNumber} creado a través del asistente.`);
                }
            }
        })
    };

    const t = await sequelize.transaction();
    try {
        await folioController.createFolio(mockReq, mockRes, t);

        // CORRECCIÓN: Se valida directamente newFolio y su propiedad folioNumber
        if (!newFolio || !newFolio.folioNumber) {
            throw new Error("No se pudo crear el folio final a partir de los datos de la sesión.");
        }
        
        session.status = 'completed';
        await session.save({ transaction: t });

        await t.commit();
        // CORRECCIÓN: Se accede directamente a newFolio.folioNumber
        return `¡Hecho! Se ha creado el Folio ${newFolio.folioNumber}. Puedes verlo en el calendario.`;
    } catch (error) {
        await t.rollback();
        console.error("Error detallado dentro de generate_folio_pdf:", error);
        throw error;
    }
}

// --- CONTROLADORES DE RUTA ---

exports.getActiveSessions = async (req, res) => {
    try {
        const sessions = await AISession.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las sesiones activas', error: error.message });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const session = await AISession.findByPk(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Sesión no encontrada' });
        }
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la sesión', error: error.message });
    }
};

exports.postChatMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { message } = req.body;
        const { id } = req.params;
        if (!message) return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });

        const session = await AISession.findByPk(id, { transaction: t });
        if (!session) return res.status(404).json({ message: 'Sesión no encontrada.' });

        session.chatHistory = [...(session.chatHistory || []), { role: 'user', content: message }];

        const assistantResponse = await getNextAssistantResponse(session, message);

        if (assistantResponse.tool_calls) {
            const toolCall = assistantResponse.tool_calls[0];
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            let functionResult = "";

            if (functionName === 'update_folio_data') {
                functionResult = await update_folio_data(session, functionArgs.updates);
            } else if (functionName === 'generate_folio_pdf') {
                functionResult = await generate_folio_pdf(session, req);
            } else if (functionName === 'answer_question_from_context') {
                functionResult = functionArgs.answer;
            } else {
                functionResult = `Error: La función "${functionName}" no existe.`;
            }
            
            session.chatHistory = [
                ...session.chatHistory,
                assistantResponse,
                {
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResult,
                },
            ];
            
            const finalResponse = await getNextAssistantResponse(session, "");
            session.chatHistory = [...session.chatHistory, finalResponse];
            await session.save({ transaction: t });
            
            await t.commit();
            return res.status(200).json(finalResponse);

        } else {
            session.chatHistory = [...session.chatHistory, assistantResponse];
            await session.save({ transaction: t });
            await t.commit();
            return res.status(200).json(assistantResponse);
        }
    } catch (error) {
        await t.rollback();
        console.error("Error en postChatMessage:", error);
        res.status(500).json({ message: 'Error al procesar el mensaje', error: error.message });
    }
};