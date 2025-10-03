const fs = require('fs').promises;
const path = require('path');
const { format, parseISO, startOfWeek, endOfWeek, getDate, getMonth, lastDayOfMonth } = require('date-fns');
const { es } = require('date-fns/locale');
const { Folio, Client, User, FolioEditHistory } = require('../models');
const pdfService = require('../services/pdfService');

// --- CREAR un nuevo folio (CORRECCIÓN DEFINITIVA) ---
exports.createFolio = async (req, res) => {
  try {
    // CORRECCIÓN: Leemos TODOS los datos necesarios del req.body
    const { clientName, clientPhone, total, advancePayment, deliveryDate, tiers, accessories, additional, isPaid, ...folioData } = req.body;

    // Ahora sí podemos usar las variables para buscar o crear al cliente
    const [client] = await Client.findOrCreate({
      where: { phone: clientPhone },
      defaults: { name: clientName }
    });

    // Lógica para generar el número de folio
    const lastFourDigits = client.phone.slice(-4);
    const date = parseISO(deliveryDate);
    const monthInitial = format(date, 'MMMM', { locale: es }).charAt(0).toUpperCase();
    const dayInitial = format(date, 'EEEE', { locale: es }).charAt(0).toUpperCase();
    const dayOfMonth = format(date, 'dd');
    const folioNumber = `${monthInitial}${dayInitial}-${dayOfMonth}-${lastFourDigits}`;
    
    // Lógica para calcular costos
    const additionalData = typeof additional === 'string' ? JSON.parse(additional) : [];
    const additionalCost = additionalData.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    const finalTotal = parseFloat(total) + parseFloat(folioData.deliveryCost || 0) + additionalCost;
    const balance = finalTotal - advancePayment;

    // Lógica para procesar datos opcionales
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    const tiersData = typeof tiers === 'string' ? JSON.parse(tiers) : tiers;

    const newFolio = await Folio.create({
      ...folioData,
      deliveryDate,
      folioNumber,
      total: finalTotal,
      advancePayment,
      balance,
      clientId: client.id,
      responsibleUserId: req.user.id,
      imageUrls: imageUrls,
      tiers: tiersData,
      accessories: accessories, // Se guarda como texto simple
      additional: additionalData, // Se guarda como JSON
      isPaid: isPaid === 'true'
    });
    res.status(201).json(newFolio);
  } catch (error) {
    console.error('ERROR DETALLADO AL CREAR FOLIO:', error); // Log mejorado para ver el error en la terminal
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Error: Ya existe un folio con este número o un cliente con este teléfono.', error: error.message });
    }
    res.status(400).json({ message: 'Error al crear el folio', error: error.message });
  }
};


// --- OBTENER TODOS los folios ---
exports.getAllFolios = async (req, res) => {
  try {
    const folios = await Folio.findAll({
      include: [ { model: Client, as: 'client', attributes: ['name', 'phone'] }, { model: User, as: 'responsibleUser', attributes: ['username'] } ],
      order: [['deliveryDate', 'ASC']]
    });
    res.status(200).json(folios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los folios', error: error.message });
  }
};

// --- OBTENER UN SOLO folio por su ID ---
exports.getFolioById = async (req, res) => {
    try {
        const folio = await Folio.findByPk(req.params.id, {
            include: [ { model: Client, as: 'client', attributes: ['name', 'phone'] }, { model: User, as: 'responsibleUser', attributes: ['username'] }, { model: FolioEditHistory, as: 'editHistory', attributes: ['createdAt'], include: { model: User, as: 'editor', attributes: ['username'] }, order: [['createdAt', 'ASC']] } ]
        });
        if (!folio) { return res.status(404).json({ message: 'Folio no encontrado' }); }
        res.status(200).json(folio);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el folio', error: error.message });
    }
};

// --- ACTUALIZAR un folio existente ---
exports.updateFolio = async (req, res) => {
    try {
        const folioId = req.params.id;
        const editorUserId = req.user.id;
        const folio = await Folio.findByPk(folioId);
        if (!folio) { return res.status(404).json({ message: 'Folio no encontrado' }); }
        await folio.update(req.body);
        if (req.body.total !== undefined || req.body.advancePayment !== undefined) {
          const updatedBalance = folio.total - folio.advancePayment;
          await folio.update({ balance: updatedBalance });
        }
        await FolioEditHistory.create({ folioId: folioId, editorUserId: editorUserId });
        res.status(200).json(folio);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el folio', error: error.message });
    }
};

// --- ELIMINAR un folio ---
exports.deleteFolio = async (req, res) => {
    try {
        const folio = await Folio.findByPk(req.params.id);
        if (!folio) { return res.status(404).json({ message: 'Folio no encontrado' }); }
        await folio.destroy();
        res.status(200).json({ message: 'Folio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el folio', error: error.message });
    }
};

// --- FUNCIÓN PARA GENERAR Y GUARDAR EL PDF ---
exports.generateFolioPdf = async (req, res) => {
  try {
    const folio = await Folio.findByPk(req.params.id, {
      include: [ { model: Client, as: 'client' }, { model: User, as: 'responsibleUser' } ]
    });
    if (!folio) { return res.status(404).json({ message: 'Folio no encontrado' }); }

    const fileName = `Folio-${folio.folioNumber}.pdf`;
    const deliveryDate = parseISO(folio.deliveryDate);
    const month = format(deliveryDate, 'MMMM', { locale: es });
    const weekOptions = { weekStartsOn: 1 };
    const startOfWeekDate = startOfWeek(deliveryDate, weekOptions);
    const endOfWeekDate = endOfWeek(deliveryDate, weekOptions);
    let weekStartDay = getDate(startOfWeekDate);
    let weekEndDay = getDate(endOfWeekDate);
    if (getMonth(startOfWeekDate) !== getMonth(deliveryDate)) { weekStartDay = 1; }
    if (getMonth(endOfWeekDate) !== getMonth(deliveryDate)) { weekEndDay = getDate(lastDayOfMonth(deliveryDate)); }
    const weekFolder = `Semana ${weekStartDay}-${weekEndDay}`;
    const dayName = format(deliveryDate, 'EEEE', { locale: es });
    const dayOfMonth = getDate(deliveryDate);
    const dayFolder = `${dayName} ${dayOfMonth} de ${month}`;
    const directoryPath = path.join(__dirname, '..', '..', 'FOLIOS_GENERADOS', month, weekFolder, dayFolder);
    await fs.mkdir(directoryPath, { recursive: true });
    
    const folioDataForPdf = folio.toJSON();

    // --- LÓGICA PARA ASIGNAR COLORES SEGÚN EL DÍA ---
    const dayOfWeek = format(deliveryDate, 'EEEE', { locale: es });
    let dayColor = '#F8F9FA'; // Color gris por defecto
    let textColor = '#000000'; // Color de texto negro por defecto

    switch (dayOfWeek.toLowerCase()) {
        case 'lunes':
            dayColor = '#007bff'; // Azul
            textColor = '#ffffff';
            break;
        case 'martes':
            dayColor = '#6f42c1'; // Morado
            textColor = '#ffffff';
            break;
        case 'miércoles':
            dayColor = '#fd7e14'; // Naranja
            textColor = '#ffffff';
            break;
        case 'jueves':
            dayColor = '#28a745'; // Verde
            textColor = '#ffffff';
            break;
        case 'viernes':
            dayColor = '#e83e8c'; // Rosa
            textColor = '#ffffff';
            break;
        case 'sábado':
            dayColor = '#ffc107'; // Amarillo
            textColor = '#000000';
            break;
        case 'domingo':
            dayColor = '#343a40'; // Negro
            textColor = '#ffffff';
            break;
    }
    folioDataForPdf.dayColor = dayColor;
    folioDataForPdf.textColor = textColor;
    // --- FIN DE LA LÓGICA DE COLORES ---

    folioDataForPdf.formattedDeliveryDate = format(deliveryDate, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es, timeZone: 'UTC' });
    const [hour, minute] = folio.deliveryTime.split(':');
    const time = new Date();
    time.setHours(hour, minute);
    folioDataForPdf.formattedDeliveryTime = format(time, 'h:mm a');
    
    const pdfBuffer = await pdfService.createPdf(folioDataForPdf);
    const filePath = path.join(directoryPath, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    console.log(`✅ PDF guardado en: ${filePath}`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error al generar o guardar el PDF:', error);
    res.status(500).json({ message: 'Error al generar y guardar el PDF', error: error.message });
  }
};