const { AISession, Folio, Client, sequelize } = require('../models');
const { getNextAssistantResponse } = require('../services/aiConversationService');
const folioController = require('./folioController'); // Importamos para reutilizar la lógica de creación

// --- FUNCIONES DE HERRAMIENTA (TOOLS) ---

async function update_folio_data(session, updates) {
  // (Sin cambios)
  console.log('⚡ Ejecutando herramienta: update_folio_data con:', updates);
  if (!updates || Object.keys(updates).length === 0) {
    console.warn("Se llamó a update_folio_data sin 'updates'. La IA puede estar cometiendo un error.");
    return "Error: No se proporcionaron datos para actualizar.";
  }
  if (typeof updates !== 'object' || updates === null) {
       console.error("Error: 'updates' no es un objeto válido:", updates);
       return "Error: Los datos para actualizar no tienen el formato correcto.";
   }
  const currentExtractedData = (typeof session.extractedData === 'object' && session.extractedData !== null) ? session.extractedData : {};
  const updatedData = { ...currentExtractedData, ...updates };
  session.extractedData = updatedData;
  return "Datos actualizados exitosamente.";
}

async function generate_folio_pdf(session, req, transaction) {
    // (Sin cambios)
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
            cakeFlavor: JSON.stringify(Array.isArray(folioData.cakeFlavor) ? folioData.cakeFlavor : []),
            filling: JSON.stringify(Array.isArray(folioData.filling) ? folioData.filling : []),
            designDescription: folioData.designDescription,
            dedication: folioData.dedication,
            deliveryLocation: folioData.deliveryLocation,
            total: folioData.total,
            advancePayment: folioData.advancePayment || 0,
            folioType: folioData.folioType || 'Normal',
            existingImageUrls: JSON.stringify(session.imageUrls || []),
            deliveryCost: folioData.deliveryCost || 0,
            accessories: folioData.accessories || '',
            additional: JSON.stringify(Array.isArray(folioData.additional) ? folioData.additional : []),
            complements: JSON.stringify(Array.isArray(folioData.complements) ? folioData.complements : []),
            isPaid: folioData.isPaid || false,
            hasExtraHeight: folioData.hasExtraHeight || false,
            addCommissionToCustomer: folioData.addCommissionToCustomer || false,
            imageComments: JSON.stringify(folioData.imageComments || []),
            existingImageComments: JSON.stringify([])
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
                } else {
                    console.error(`Error al crear folio desde asistente (${code}):`, data.message || data);
                 }
            }
        }),
        send: (message) => {
            console.warn("generate_folio_pdf mockRes.send llamado:", message);
        }
    };

    try {
        await folioController.createFolio(mockReq, mockRes, transaction);
        if (!newFolio || !newFolio.folioNumber) {
             throw new Error("No se pudo obtener la información del folio creado. Revisa los logs del servidor para detalles del error en folioController.createFolio.");
        }
        session.status = 'completed';
        return `¡Hecho! Se ha creado el Folio ${newFolio.folioNumber}. Puedes verlo en el calendario.`;
    } catch (error) {
        console.error("Error detallado dentro de generate_folio_pdf:", error);
        return `Error al generar el folio PDF: ${error.message}`;
    }
}


// --- CONTROLADORES DE RUTA ---

// (exports.getActiveSessions sin cambios)
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

// (exports.getSessionById sin cambios)
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
    const sessionId = req.params.id;
    console.log(`\n--- [Session ${sessionId || 'ID?'}] DEBUG: Inicio postChatMessage ---`);

    try {
        if (!sessionId) {
            await t.rollback();
            console.error(`Error: No se recibió sessionId en req.params.`);
            return res.status(400).json({ message: 'Falta el ID de la sesión en la URL.' });
        }

        const { message } = req.body;
        if (!message) {
            await t.rollback();
            console.error(`[Session ${sessionId}] Error: Mensaje vacío recibido.`);
            return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });
        }

        const session = await AISession.findByPk(sessionId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!session) {
            await t.rollback();
            console.error(`[Session ${sessionId}] Error: Sesión no encontrada.`);
            return res.status(404).json({ message: 'Sesión no encontrada.' });
        }

        console.log(`[Session ${sessionId}] Mensaje Usuario: "${message}"`);
        const existingHistory = session.chatHistory ? JSON.parse(JSON.stringify(session.chatHistory)) : [];
        console.log(`[Session ${sessionId}] Historial existente (roles):`, JSON.stringify(existingHistory.map(m => m.role), null, 2));

        // *** IMPORTANTE: Verificar si el historial existente ya está corrupto ***
        if (existingHistory.length > 0) {
            const lastExistingMessage = existingHistory[existingHistory.length - 1];
            if (lastExistingMessage.role === 'assistant' && lastExistingMessage.tool_calls && lastExistingMessage.tool_calls.length > 0) {
                 console.error(`[Session ${sessionId}] ¡ERROR! El historial existente ya termina con tool_calls pendientes. No se puede continuar. ID de llamada pendiente: ${lastExistingMessage.tool_calls[0].id}`);
                 await t.rollback(); // Cancelar transacción
                 return res.status(409).json({ message: `La sesión está en un estado inconsistente (llamada a herramienta ${lastExistingMessage.tool_calls[0].id} pendiente). Por favor, corrige manualmente o cancela la sesión.` });
            }
        }
        // *** FIN VERIFICACIÓN ***

        let currentHistory = [...existingHistory, { role: 'user', content: message }];
        console.log(`[Session ${sessionId}] Historial PARA 1ra llamada OpenAI (roles):`, JSON.stringify(currentHistory.map(m => m.role), null, 2));

        const firstAssistantResponse = await getNextAssistantResponse({
            extractedData: session.extractedData,
            whatsappConversation: session.whatsappConversation,
            chatHistory: currentHistory
        }, message);
        console.log(`[Session ${sessionId}] Respuesta 1ra llamada OpenAI:`, JSON.stringify(firstAssistantResponse, null, 2));

        currentHistory.push(firstAssistantResponse);

        let finalResponseToSend;

        if (firstAssistantResponse.tool_calls && firstAssistantResponse.tool_calls.length > 0) {
            console.log(`[Session ${sessionId}] DEBUG: Detectado ${firstAssistantResponse.tool_calls.length} tool_calls.`);
            const toolMessages = [];
            for (const toolCall of firstAssistantResponse.tool_calls) {
                const functionName = toolCall.function.name;
                let functionArgs = {};
                 try {
                     if (typeof toolCall.function.arguments === 'string') {
                         functionArgs = JSON.parse(toolCall.function.arguments);
                     } else {
                         console.warn(`[Session ${sessionId}] Warning: tool_call.function.arguments no es un string:`, toolCall.function.arguments);
                      }
                 } catch (parseError) {
                     console.error(`[Session ${sessionId}] Error parseando argumentos de ${functionName}:`, parseError, "Argumentos recibidos:", toolCall.function.arguments);
                     functionArgs = {};
                  }

                let functionResult = "";
                console.log(`[Session ${sessionId}] DEBUG: Ejecutando herramienta ${functionName} con args:`, functionArgs);
                try {
                    if (functionName === 'update_folio_data') {
                        functionResult = await update_folio_data(session, functionArgs.updates);
                    } else if (functionName === 'generate_folio_pdf') {
                        functionResult = await generate_folio_pdf(session, req, t);
                    } else if (functionName === 'answer_question_from_context') {
                         functionResult = functionArgs.answer || "No encontré una respuesta en el contexto.";
                     } else {
                        functionResult = `Error: La función "${functionName}" no existe.`;
                    }
                 } catch (toolError) {
                    console.error(`[Session ${sessionId}] Error EJECUTANDO herramienta ${functionName}:`, toolError);
                    functionResult = `Error al ejecutar la herramienta ${functionName}: ${toolError.message}`;
                  }

                if (typeof functionResult !== 'string') {
                    console.warn(`[Session ${sessionId}] Resultado de ${functionName} no es string:`, functionResult);
                    functionResult = JSON.stringify(functionResult);
                }
                console.log(`[Session ${sessionId}] DEBUG: Resultado de ${functionName}:`, functionResult);

                toolMessages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResult,
                });
            }

            currentHistory.push(...toolMessages);
            console.log(`[Session ${sessionId}] Historial PARA 2da llamada OpenAI (roles):`, JSON.stringify(currentHistory.map(m => m.role), null, 2));

            const finalAssistantResponse = await getNextAssistantResponse({
                 extractedData: session.extractedData,
                 whatsappConversation: session.whatsappConversation,
                 chatHistory: currentHistory
            }, "");
            console.log(`[Session ${sessionId}] Respuesta 2da llamada OpenAI (final):`, JSON.stringify(finalAssistantResponse, null, 2));

            currentHistory.push(finalAssistantResponse);
            finalResponseToSend = finalAssistantResponse;

        } else {
            console.log(`[Session ${sessionId}] DEBUG: No se detectaron tool_calls. Usando primera respuesta.`);
            finalResponseToSend = firstAssistantResponse;
        }

        session.chatHistory = currentHistory;
        console.log(`[Session ${sessionId}] Historial FINAL a guardar (roles):`, JSON.stringify(session.chatHistory.map(m => m.role), null, 2));

        const lastMessageBeforeSave = currentHistory[currentHistory.length - 1];
        // **** INICIO VERIFICACIÓN PRE-GUARDADO ****
        if (lastMessageBeforeSave && lastMessageBeforeSave.role === 'assistant' && lastMessageBeforeSave.tool_calls && lastMessageBeforeSave.tool_calls.length > 0) {
             console.error(`[Session ${sessionId}] ¡ERROR CRÍTICO! El historial final termina con una llamada a herramienta pendiente. NO SE GUARDARÁ. Último mensaje:`, JSON.stringify(lastMessageBeforeSave, null, 2));
             await t.rollback(); // <-- ROLLBACK ANTES DE SALIR
             console.log(`[Session ${sessionId}] DEBUG: Transacción revertida (rollback) debido a estado final inválido.`);
             return res.status(500).json({ message: 'Error interno del servidor al procesar la respuesta del asistente. El estado final era inválido.' });
        } else if (!lastMessageBeforeSave || lastMessageBeforeSave.role !== 'assistant') {
             console.warn(`[Session ${sessionId}] Advertencia: El último mensaje antes de guardar no es del asistente o está ausente. Revisar flujo. Último mensaje:`, JSON.stringify(lastMessageBeforeSave, null, 2));
        } else {
            console.log(`[Session ${sessionId}] Verificación: Último mensaje es role=assistant y sin tool_calls. OK para guardar.`);
        }
         // **** FIN VERIFICACIÓN PRE-GUARDADO ****

        await session.save({ transaction: t });

        await t.commit();
        console.log(`[Session ${sessionId}] DEBUG: Transacción completada (commit).`);

        res.status(200).json({ message: finalResponseToSend, sessionData: session.toJSON() });

    } catch (error) {
        await t.rollback();
        console.error(`[Session ${sessionId || 'ID?'}] Error DETALLADO en postChatMessage:`, error);
        if (error.status === 400 && error.type === 'invalid_request_error') {
            console.error(`[Session ${sessionId || 'ID?'}] Error específico de OpenAI:`, error.error);
            // Intentar dar un mensaje más útil basado en el param
             let userMessage = `Error de OpenAI: ${error.message}`;
             if (error.param && error.param.startsWith('messages.')) {
                 userMessage += ` (Problema con la secuencia de mensajes)`;
             }
             res.status(400).json({ message: userMessage });
        } else {
            res.status(500).json({ message: 'Error interno al procesar el mensaje.' });
        }
        console.log(`[Session ${sessionId || 'ID?'}] DEBUG: Transacción revertida (rollback).`);
    }
};