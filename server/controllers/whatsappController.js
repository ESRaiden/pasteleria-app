const { Client, Folio } = require('../models');
const { extractFolioData } = require('../services/aiExtractorService');
const { format, parseISO } = require('date-fns');
const { es } = require('date-fns/locale');

// El comando que el empleado usará en WhatsApp para activar la IA
const TRIGGER_COMMAND = '/crearfolio';

/**
 * Maneja los webhooks de WhatsApp. Si detecta el comando de activación,
 * extrae los datos de la conversación con IA y crea un folio en estado 'Pendiente'.
 */
exports.handleWebhook = async (req, res) => {
  try {
    const messageData = req.body.data;

    // 1. Verificamos si el cuerpo del mensaje contiene nuestro comando de activación.
    if (!messageData || !messageData.body || !messageData.body.trim().toLowerCase().includes(TRIGGER_COMMAND)) {
      console.log("Webhook recibido, pero no es un comando de activación. Ignorando.");
      return res.status(200).send('EVENT_RECEIVED_BUT_IGNORED');
    }

    console.log(`✅ Comando '${TRIGGER_COMMAND}' detectado. Iniciando extracción con IA...`);
    const conversationText = messageData.conversation;

    // 2. Enviamos la conversación a nuestro servicio de IA para que la analice.
    const extractedData = await extractFolioData(conversationText);
    console.log("🤖 Datos extraídos por la IA:", JSON.stringify(extractedData, null, 2));

    // 3. Validamos los datos mínimos necesarios para crear un folio.
    if (!extractedData.clientName || !extractedData.deliveryDate || !extractedData.persons) {
        throw new Error("La IA no pudo extraer los datos mínimos requeridos (nombre, fecha o personas).");
    }

    // 4. Buscamos o creamos al cliente en la base de datos.
    const [client] = await Client.findOrCreate({
        where: { phone: messageData.from }, // Usamos el número de WhatsApp como identificador único
        defaults: { name: extractedData.clientName },
    });

    // 5. Generamos un número de folio único (lógica similar a la creación manual).
    const lastFourDigits = messageData.from.slice(-4);
    const date = parseISO(extractedData.deliveryDate);
    const monthInitial = format(date, 'MMMM', { locale: es }).charAt(0).toUpperCase();
    const dayInitial = format(date, 'EEEE', { locale: es }).charAt(0).toUpperCase();
    const dayOfMonth = format(date, 'dd');
    
    let baseFolioNumber = `${monthInitial}${dayInitial}-${dayOfMonth}-${lastFourDigits}`;
    let finalFolioNumber = baseFolioNumber;
    let counter = 1;
    while (await Folio.findOne({ where: { folioNumber: finalFolioNumber } })) {
        finalFolioNumber = `${baseFolioNumber}-${counter++}`;
    }

    // 6. Creamos el nuevo folio en la base de datos con estado "Pendiente".
    const newFolio = await Folio.create({
        folioNumber: finalFolioNumber,
        folioType: 'Normal', // Por defecto, la IA crea folios de tipo 'Normal'
        status: 'Pendiente', // <-- ¡Importante! Se crea como borrador.
        clientId: client.id,
        deliveryDate: extractedData.deliveryDate,
        deliveryTime: extractedData.deliveryTime || '13:00:00', // Hora por defecto si no se detecta
        persons: extractedData.persons,
        shape: extractedData.shape || 'Redondo',
        cakeFlavor: JSON.stringify(extractedData.cakeFlavor || []),
        filling: JSON.stringify(extractedData.filling || []),
        designDescription: extractedData.designDescription || 'Descripción pendiente.',
        dedication: extractedData.dedication,
        deliveryLocation: extractedData.deliveryLocation,
        total: parseFloat(extractedData.total) || 0,
        advancePayment: parseFloat(extractedData.advancePayment) || 0,
        balance: (parseFloat(extractedData.total) || 0) - (parseFloat(extractedData.advancePayment) || 0),
        // Los demás campos (imágenes, complementos, etc.) quedan nulos para ser completados en la revisión.
    });

    console.log(`✅ Folio borrador #${newFolio.folioNumber} creado exitosamente para el cliente ${client.name}.`);

    res.status(200).send('FOLIO_CREATED');

  } catch (error) {
    console.error("❌ Error procesando el webhook:", error.message);
    res.status(500).send('ERROR_PROCESSING_WEBHOOK');
  }
};