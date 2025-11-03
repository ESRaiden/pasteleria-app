const { AISession, Folio, Client, sequelize } = require('../models');
// Asegúrate que la ruta sea correcta según tu estructura
const { getNextAssistantResponse } = require('../services/aiConversationService');
const folioController = require('./folioController'); // Importamos para reutilizar la lógica de creación

// --- FUNCIONES DE HERRAMIENTA (TOOLS) ---

// Función para actualizar los datos de la sesión basados en la llamada de la IA
async function update_folio_data(session, updates) {
  console.log('⚡ Ejecutando herramienta: update_folio_data con:', updates);
  // Validación básica de los updates
  if (!updates || typeof updates !== 'object' || updates === null || Object.keys(updates).length === 0) {
    console.warn("Llamada a update_folio_data inválida o sin datos. Argumentos:", updates);
    // Devuelve un mensaje de error claro que la IA pueda interpretar
    return "Error: No se proporcionaron datos válidos en formato de objeto para actualizar.";
  }

  try {
    // Obtener datos actuales de forma segura, asegurando que sea un objeto
    const currentExtractedData = (typeof session.extractedData === 'object' && session.extractedData !== null)
                                   ? JSON.parse(JSON.stringify(session.extractedData)) // Clonar para evitar mutación directa
                                   : {};

    // --- Lógica mejorada para manejar arrays y strings ---
    let updatedData = { ...currentExtractedData }; // Empezar con una copia

    for (const key in updates) {
        if (Object.hasOwnProperty.call(updates, key)) {
            const newValue = updates[key];
            // Para arrays, reemplaza completamente con el nuevo array.
            if (['tiers', 'complements', 'additional', 'cakeFlavor', 'filling'].includes(key) && Array.isArray(newValue)) {
                 console.log(`[Session ${session.id}] Actualizando array '${key}' completo.`);
                 updatedData[key] = newValue;
            } else if (key === 'accessories' && typeof newValue === 'string' && typeof updatedData[key] === 'string' && updatedData[key]) {
                 // Si accessories ya tiene algo y lo nuevo es string, concatenar.
                 updatedData[key] = `${updatedData[key]}, ${newValue}`;
                 console.log(`[Session ${session.id}] Concatenando accesorios a '${key}'.`);
            }
             else {
                 // Actualización/reemplazo simple para otros campos.
                 updatedData[key] = newValue;
                 console.log(`[Session ${session.id}] Actualizando campo '${key}'.`);
            }
        }
    }


    // Validar/Limpiar estructura final según folioType
     if (updatedData.folioType === 'Base/Especial') {
         updatedData.cakeFlavor = null; // O []
         updatedData.filling = null;    // O []
     } else if (updatedData.folioType === 'Normal') {
         updatedData.tiers = null; // O []
     }


    session.extractedData = updatedData; // Guardar los datos actualizados en el objeto de sesión (en memoria)
    console.log(`[Session ${session.id}] Datos después de update_folio_data:`, JSON.stringify(session.extractedData, null, 2));
    return "Datos actualizados exitosamente."; // Mensaje de éxito para la IA

  } catch (error) {
      console.error(`[Session ${session.id}] Error dentro de update_folio_data:`, error);
      return `Error al procesar la actualización de datos: ${error.message}`; // Mensaje de error para la IA
  }
}


// Función para generar el Folio PDF usando folioController
// ===== CORRECCIÓN: Eliminado el parámetro 'transaction' =====
async function generate_folio_pdf(session, req /* Sin transaction aquí */) {
    console.log('⚡ Ejecutando herramienta: generate_folio_pdf');
    const folioData = session.extractedData;

    // Validación mínima de datos
    if (!folioData || !folioData.clientName || !folioData.deliveryDate || !folioData.persons || folioData.total === null || folioData.total === undefined) {
        console.error(`[Session ${session.id}] Error: Faltan datos esenciales para generar el folio.`, folioData);
        return "Error: Faltan datos esenciales como nombre, fecha, personas o total para generar el folio. Pide al empleado que los complete.";
    }

    // Obtener teléfono
    const phoneMatch = session.whatsappConversation?.match(/De:\s*(\d+)/) || session.whatsappConversation?.match(/Cliente:\s*(\+?\d+)/);
    const senderPhone = phoneMatch ? phoneMatch[1] : null;
    const clientPhone = folioData.clientPhone || senderPhone;
    // (Advertencia si no hay teléfono, pero no bloqueante por ahora)
    if (!clientPhone) {
        console.warn(`[Session ${session.id}] Advertencia: No se pudo determinar el teléfono del cliente.`);
    }

    // Preparar el objeto mockReq para folioController.createFolio
    const mockReq = {
        body: {
            clientName: folioData.clientName || 'Cliente Desconocido',
            clientPhone: clientPhone || 'Sin Telefono', // Default si falta
            clientPhone2: folioData.clientPhone2 || null,
            deliveryDate: folioData.deliveryDate,
            deliveryTime: folioData.deliveryTime || '00:00:00',
            persons: folioData.persons,
            shape: folioData.shape || 'Redondo',
            cakeFlavor: JSON.stringify(Array.isArray(folioData.cakeFlavor) ? folioData.cakeFlavor : []),
            // Asegurar formato [{name, hasCost}] para filling
            filling: JSON.stringify(
                Array.isArray(folioData.filling)
                    ? folioData.filling.map(f => (typeof f === 'string' ? { name: f, hasCost: false } : (f || {name: 'Inválido', hasCost: false})))
                    : []
            ),
            tiers: JSON.stringify(Array.isArray(folioData.tiers) ? folioData.tiers : []),
            designDescription: folioData.designDescription || 'Sin descripción.',
            dedication: folioData.dedication || null,
            deliveryLocation: folioData.deliveryLocation || 'Recoge en Tienda',
            total: folioData.total, // Costo BASE
            advancePayment: folioData.advancePayment || 0,
            deliveryCost: folioData.deliveryCost || 0,
            folioType: folioData.folioType || 'Normal',
            accessories: folioData.accessories || null,
            // Asegurar formato [{name, price}] para additional
            additional: JSON.stringify(
                 Array.isArray(folioData.additional)
                     ? folioData.additional.map(a => ({ name: a?.name || 'Adicional inválido', price: a?.price || 0 }))
                     : []
             ),
            complements: JSON.stringify(Array.isArray(folioData.complements) ? folioData.complements : []),
            isPaid: folioData.isPaid || false,
            hasExtraHeight: folioData.hasExtraHeight || false,
            addCommissionToCustomer: folioData.addCommissionToCustomer || false,
            existingImageUrls: JSON.stringify(session.imageUrls || []),
            existingImageComments: JSON.stringify([]), // No se usan en este flujo
            imageComments: JSON.stringify([]), // No se usan en este flujo
            status: 'Nuevo' // Siempre 'Nuevo' al crear desde IA
        },
        user: req.user, // Usuario autenticado
        files: [] // No hay archivos subidos en este flujo
    };

    let newFolio = null;
    const mockRes = {
        // Objeto simulado para capturar respuesta de createFolio
        status: (code) => ({
            json: (data) => {
                if (code >= 200 && code < 300 && data && data.folioNumber) {
                    newFolio = data;
                } else {
                     newFolio = { error: data?.message || `Error ${code} al crear folio.` };
                 }
            }
        }),
        send: (message) => { // Capturar si usa res.send
            console.warn(`[Session ${session.id}] folioController.createFolio usó res.send:`, message);
             if (!newFolio) newFolio = { error: message };
        }
    };

    try {
        // Llamar a createFolio SIN transacción, ya que la maneja internamente
        await folioController.createFolio(mockReq, mockRes /* Sin transaction */);

        if (newFolio && newFolio.error) {
             throw new Error(newFolio.error);
        }
        if (!newFolio || !newFolio.folioNumber) {
             throw new Error("La creación del folio no devolvió la información esperada.");
        }

        session.status = 'completed'; // Marcar sesión como completada EN MEMORIA
        console.log(`[Session ${session.id}] Marcada como 'completed'.`);
        // Devolver mensaje de éxito para la IA y el historial
        return `¡Folio ${newFolio.folioNumber} creado exitosamente! La sesión ha finalizado.`;

    } catch (error) {
        console.error(`[Session ${session.id}] Error detallado dentro de generate_folio_pdf:`, error);
        // Devolver mensaje de error para la IA y el historial
        return `Error al intentar generar el folio: ${error.message}. Por favor, revisa los datos o pide ayuda al empleado.`;
    }
}

// Función placeholder para answer_question_from_context
async function answer_question_from_context(session, answer) {
    console.log('⚡ Ejecutando herramienta: answer_question_from_context');
    return answer || "No encontré una respuesta específica en la conversación original.";
}


// --- CONTROLADORES DE RUTA ---

// Obtener sesiones activas
exports.getActiveSessions = async (req, res) => {
    try {
        const sessions = await AISession.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error en getActiveSessions:", error);
        res.status(500).json({ message: 'Error al obtener las sesiones activas', error: error.message });
    }
};

// Obtener sesión por ID
exports.getSessionById = async (req, res) => {
    try {
        const session = await AISession.findByPk(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Sesión no encontrada' });
        }
        res.status(200).json(session);
    } catch (error) {
        console.error("Error en getSessionById:", error);
        res.status(500).json({ message: 'Error al obtener la sesión', error: error.message });
    }
};

// Controlador principal para manejar mensajes del chat
exports.postChatMessage = async (req, res) => {
    const sessionId = req.params.id;
    // Iniciar transacción para update_folio_data y session.save
    const t = await sequelize.transaction();
    console.log(`\n--- [Session ${sessionId || 'ID?'}] Inicio postChatMessage ---`);

    try {
        // Validaciones iniciales
        if (!sessionId) {
            await t.rollback();
            return res.status(400).json({ message: 'Falta el ID de la sesión en la URL.' });
        }
        const { message: userMessageContent } = req.body;
        if (!userMessageContent) {
            await t.rollback();
            return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });
        }
        const session = await AISession.findByPk(sessionId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!session) {
            await t.rollback();
            return res.status(404).json({ message: 'Sesión no encontrada.' });
        }
         if (session.status !== 'active') {
             await t.rollback();
             return res.status(400).json({ message: `La sesión ya está ${session.status}. No se pueden procesar más mensajes.` });
         }
         console.log(`[Session ${sessionId}] Mensaje Usuario: "${userMessageContent}"`);
         const existingHistory = session.chatHistory ? JSON.parse(JSON.stringify(session.chatHistory)) : [];
         // Verificación de consistencia del historial
         if (existingHistory.length > 0) {
            const lastMsg = existingHistory[existingHistory.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.tool_calls) {
                console.error(`[Session ${sessionId}] ¡ERROR DE CONSISTENCIA! Historial termina con tool_calls pendientes.`);
                await t.rollback();
                return res.status(409).json({ message: `Error: La sesión tiene una llamada a herramienta pendiente. No se puede continuar.` });
            }
        }

        let currentHistory = [...existingHistory, { role: 'user', content: userMessageContent }];

        // === Primera Llamada a OpenAI ===
        console.log(`[Session ${sessionId}] Enviando a IA (1ra llamada)...`);
        const firstAssistantResponse = await getNextAssistantResponse({
            extractedData: session.extractedData,
            whatsappConversation: session.whatsappConversation,
            chatHistory: currentHistory
        }, userMessageContent);

        currentHistory.push(firstAssistantResponse);
        console.log(`[Session ${sessionId}] Respuesta IA (1ra llamada):`, JSON.stringify(firstAssistantResponse, null, 2));

        let finalNaturalResponse = { role: 'assistant', content: null }; // Default
        let toolRanAndCompletedSession = false; // Flag para éxito de generate_folio_pdf

        // === Procesamiento de Tool Calls ===
        if (firstAssistantResponse.tool_calls && firstAssistantResponse.tool_calls.length > 0) {
            console.log(`[Session ${sessionId}] Detectadas ${firstAssistantResponse.tool_calls.length} tool_calls.`);
            const toolMessages = []; // Colección de mensajes con role: 'tool'

            for (const toolCall of firstAssistantResponse.tool_calls) {
                const functionName = toolCall.function.name;
                let functionArgs = {};

                 // Parseo de argumentos
                 try {
                    if (typeof toolCall.function.arguments === 'string' && toolCall.function.arguments.trim()) {
                        functionArgs = JSON.parse(toolCall.function.arguments);
                    } else if (functionName !== 'generate_folio_pdf') { // generate_folio_pdf no necesita args
                         throw new Error("Argumentos faltantes o inválidos.");
                    }
                } catch (parseError) {
                    console.error(`[Session ${sessionId}] Error parseando args para ${functionName}:`, parseError);
                     toolMessages.push({ tool_call_id: toolCall.id, role: 'tool', name: functionName, content: `Error: Argumentos inválidos - ${parseError.message}` });
                     continue; // Saltar a la siguiente herramienta si falla el parseo
                }

                let functionResult = "";
                console.log(`[Session ${sessionId}] Ejecutando ${functionName}...`);
                try {
                    if (functionName === 'update_folio_data') {
                        // Pasar 'session' que está bloqueada por la transacción 't'
                        // Pasar functionArgs directamente
                        functionResult = await update_folio_data(session, functionArgs);
                    } else if (functionName === 'generate_folio_pdf') {
                        // Llamar SIN pasar 't'
                        functionResult = await generate_folio_pdf(session, req /* Sin 't' */);
                        // Verificar si tuvo éxito y cambió el estado DE LA SESIÓN EN MEMORIA
                        if (session.status === 'completed' && !String(functionResult).toLowerCase().startsWith('error')) {
                            toolRanAndCompletedSession = true; // Marcar éxito
                        }
                    } else if (functionName === 'answer_question_from_context') {
                        functionResult = await answer_question_from_context(session, functionArgs.answer);
                    } else {
                        functionResult = `Error: Función desconocida "${functionName}".`;
                    }
                 } catch (toolExecError) {
                    console.error(`[Session ${sessionId}] Error EJECUTANDO ${functionName}:`, toolExecError);
                    functionResult = `Error al ejecutar la herramienta: ${toolExecError.message}`;
                 }

                if (typeof functionResult !== 'string') functionResult = JSON.stringify(functionResult);
                console.log(`[Session ${sessionId}] Resultado ${functionName}:`, functionResult);
                toolMessages.push({ tool_call_id: toolCall.id, role: 'tool', name: functionName, content: functionResult });

                // Salir del bucle si generate_pdf completó la sesión
                 if (toolRanAndCompletedSession) {
                     break;
                 }
            } // Fin for toolCall

            currentHistory.push(...toolMessages); // Añadir resultados de tools

            // === Segunda Llamada a OpenAI o Respuesta Final (Corregida) ===
            if (toolRanAndCompletedSession) {
                // Si generate_pdf tuvo éxito, crear el mensaje final de assistant y añadirlo
                const successMsg = toolMessages.find(m => m.name === 'generate_folio_pdf')?.content || "Proceso de creación finalizado.";
                finalNaturalResponse = { role: 'assistant', content: successMsg };
                currentHistory.push(finalNaturalResponse); // <<< AÑADIR AL HISTORIAL
                console.log(`[Session ${sessionId}] Folio generado. Respuesta final directa añadida al historial.`);

            } else if (session.status === 'active') { // Si no se completó y sigue activa
                 // Hacer la segunda llamada para obtener respuesta natural post-update
                 console.log(`[Session ${sessionId}] Enviando a IA (2da llamada) para respuesta natural...`);
                 const secondAssistantResponse = await getNextAssistantResponse({
                     extractedData: session.extractedData,
                     whatsappConversation: session.whatsappConversation,
                     chatHistory: currentHistory // Historial ya incluye resultados 'tool'
                 }, null); // Sin userMessage

                 currentHistory.push(secondAssistantResponse); // Añadir al historial
                 console.log(`[Session ${sessionId}] Respuesta IA (2da llamada - final):`, JSON.stringify(secondAssistantResponse, null, 2));
                 finalNaturalResponse = secondAssistantResponse; // Esta es la que se envía al usuario
            } else {
                 // Caso de error en generate_pdf o cambio de estado inesperado
                 const errorMsg = toolMessages.find(m => m.name === 'generate_folio_pdf')?.content || "El proceso terminó con un estado inesperado.";
                 finalNaturalResponse = { role: 'assistant', content: errorMsg };
                 currentHistory.push(finalNaturalResponse);
                 console.warn(`[Session ${sessionId}] Estado cambió a ${session.status} por error. Añadiendo mensaje de error como respuesta final.`);
            }

        } else {
            console.log(`[Session ${sessionId}] No hubo tool_calls.`);
            finalNaturalResponse = firstAssistantResponse; // La primera respuesta es la final
        }

        // ***** Verificación de Consistencia Final *****
        // El último mensaje DEBE ser 'assistant' y NO tener 'tool_calls'
         const lastMessageToSave = currentHistory[currentHistory.length - 1];
         if (!lastMessageToSave || lastMessageToSave.role !== 'assistant' || (lastMessageToSave.tool_calls && lastMessageToSave.tool_calls.length > 0)) {
             console.error(`[Session ${sessionId}] ¡ERROR DE CONSISTENCIA FINAL! Último mensaje inválido.`, lastMessageToSave);
             // Intentar añadir un mensaje genérico si el último es 'tool' y no hubo error mayor
             if(lastMessageToSave && lastMessageToSave.role === 'tool' && !lastMessageToSave.content.toLowerCase().startsWith('error')) {
                console.warn(`[Session ${sessionId}] Intentando corregir consistencia añadiendo mensaje final genérico.`);
                finalNaturalResponse = { role: 'assistant', content: "Acción procesada." }; // Mensaje genérico post-tool
                currentHistory.push(finalNaturalResponse);
                // Volver a verificar por si acaso, aunque debería estar bien ahora
                const correctedLastMessage = currentHistory[currentHistory.length - 1];
                if (!correctedLastMessage || correctedLastMessage.role !== 'assistant' || (correctedLastMessage.tool_calls && correctedLastMessage.tool_calls.length > 0)) {
                    await t.rollback();
                    return res.status(500).json({ message: 'Error interno crítico: No se pudo corregir el estado final del historial.' });
                }
                 console.log(`[Session ${sessionId}] Consistencia corregida.`);
             } else {
                 // Si el problema es otro (ej. último mensaje 'user' o 'tool' con error), lanzar error
                 await t.rollback();
                 return res.status(500).json({ message: `Error interno crítico: El estado final del historial es inválido (${lastMessageToSave?.role}).` });
             }
         } else {
             console.log(`[Session ${sessionId}] Verificación final OK.`);
         }
        // ***** Fin Verificación *****

        // Guardar historial y estado actualizados
        session.chatHistory = currentHistory;
        await session.save({ transaction: t });

        // Confirmar transacción (guarda historial y status='completed')
        await t.commit();
        console.log(`[Session ${sessionId}] Transacción completada (commit).`);

        // Enviar respuesta y datos
        res.status(200).json({
            message: finalNaturalResponse, // Objeto {role: 'assistant', content: '...'}
            sessionData: session.toJSON() // Datos sesión actualizados (incl. status)
        });

    } catch (error) {
        // Revertir transacción en caso de error no capturado
        if (t && !t.finished) { // Verificar si la transacción sigue activa
            await t.rollback();
            console.log(`[Session ${sessionId || 'ID?'}] Transacción revertida (rollback) en catch principal.`);
        }
        console.error(`[Session ${sessionId || 'ID?'}] Error en postChatMessage:`, error);
        const statusCode = error.status || 500; // Usar status de OpenAI si existe
        // Enviar mensaje de error al frontend
        res.status(statusCode).json({ message: error.message || 'Error interno al procesar el mensaje.' });
    }
};

// ==================== INICIO DE LA MODIFICACIÓN ====================
/**
 * Descarta una sesión de IA (marcandola como 'cancelled').
 */
exports.discardSession = async (req, res) => {
    const sessionId = req.params.id;
    console.log(`🤖 Solicitud para descartar sesión de IA #${sessionId}`);
  
    try {
        const session = await AISession.findByPk(sessionId);
    
        if (!session) {
            console.warn(`Sesión #${sessionId} no encontrada al intentar descartar.`);
            return res.status(404).json({ message: 'Sesión no encontrada.' });
        }

        if (session.status !== 'active') {
            console.warn(`Sesión #${sessionId} ya estaba en estado '${session.status}'.`);
            // Devolvemos éxito de todos modos, ya que el resultado deseado (que no esté activa) se cumple.
            return res.status(200).json({ message: 'La sesión ya estaba finalizada.' });
        }

        // Cambiar el estado a 'cancelled'
        session.status = 'cancelled'; 
        await session.save();
        
        console.log(`✅ Sesión de IA #${sessionId} marcada como 'cancelled'.`);
        res.status(200).json({ message: 'Sesión descartada exitosamente.' });

    } catch (error) {
        console.error(`Error al descartar la sesión #${sessionId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al descartar la sesión.' });
    }
};
// ===================== FIN DE LA MODIFICACIÓN ======================