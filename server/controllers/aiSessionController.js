const { AISession, Folio, Client, sequelize } = require('../models');
const { getNextAssistantResponse } = require('../services/aiConversationService');
const folioController = require('./folioController'); // Importamos para reutilizar la lógica de creación

// --- FUNCIONES DE HERRAMIENTA (TOOLS) ---

async function update_folio_data(session, updates) {
  console.log('⚡ Ejecutando herramienta: update_folio_data con:', updates);
  if (!updates || Object.keys(updates).length === 0) {
    console.warn("Se llamó a update_folio_data sin 'updates'. La IA puede estar cometiendo un error.");
    return "Error: No se proporcionaron datos para actualizar.";
  }
  const updatedData = { ...session.extractedData, ...updates };
  session.extractedData = updatedData;
  await session.save();
  return "Datos actualizados exitosamente.";
}

async function generate_folio_pdf(session, req) {
    console.log('⚡ Ejecutando herramienta: generate_folio_pdf');
    const folioData = session.extractedData;

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
                    console.log(`Folio #${newFolio.folioNumber} creado a través del asistente.`);
                }
            }
        })
    };

    const t = await sequelize.transaction();
    try {
        await folioController.createFolio(mockReq, mockRes, t);

        if (!newFolio || !newFolio.folioNumber) {
            throw new Error("No se pudo crear el folio final a partir de los datos de la sesión.");
        }
        
        session.status = 'completed';
        await session.save({ transaction: t });

        await t.commit();
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

        // ***** INICIO DE LA CORRECCIÓN *****
        // El historial de chat ahora se construye paso a paso de forma correcta.

        // 1. Añadimos el mensaje del usuario al historial
        session.chatHistory = [...(session.chatHistory || []), { role: 'user', content: message }];
        // NO guardamos aún, lo haremos después de tener la respuesta del asistente.

        // 2. Obtenemos la respuesta del asistente (puede ser texto o una llamada a herramienta)
        const assistantResponse = await getNextAssistantResponse(session, message);

        if (assistantResponse.tool_calls) {
            // Si la IA quiere usar una herramienta...
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
            
            // 3. Añadimos al historial TANTO la decisión de la IA como el resultado de la herramienta
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
            
            // 4. Pedimos a la IA la respuesta final en texto, ahora que ya conoce el resultado de la herramienta
            const finalResponse = await getNextAssistantResponse(session, ""); // Pasamos un mensaje vacío porque el historial ya lo tiene todo
            session.chatHistory = [...session.chatHistory, finalResponse];
            
            await session.save({ transaction: t });
            await t.commit();
            return res.status(200).json({ message: finalResponse, sessionData: session.toJSON() });

        } else {
            // Si la IA responde directamente con texto...
            session.chatHistory = [...session.chatHistory, assistantResponse];
            await session.save({ transaction: t });
            await t.commit();
            return res.status(200).json({ message: assistantResponse, sessionData: session.toJSON() });
        }
        // ***** FIN DE LA CORRECCIÓN *****
    } catch (error) {
        await t.rollback();
        console.error("Error en postChatMessage:", error);
        res.status(500).json({ message: 'Error al procesar el mensaje', error: error.message });
    }
};