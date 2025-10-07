const fs = require('fs').promises;
const path = require('path');
const { format, parseISO, startOfWeek, endOfWeek, getDate, getMonth, lastDayOfMonth } = require('date-fns');
const { es } = require('date-fns/locale');
const { Folio, Client, User, FolioEditHistory, sequelize } = require('../models');
const { Op } = require('sequelize');
const pdfService = require('../services/pdfService');

// ==================== INICIO DE LA CORRECCIÓN ====================
// Función auxiliar para calcular el costo de los rellenos
const calculateFillingCost = (folioType, persons, fillings, tiers) => {
    let cost = 0;
    if (folioType === 'Normal') {
        const numPersons = parseInt(persons, 10) || 0;
        cost = (fillings || []).reduce((sum, filling) => {
            return (filling.hasCost && numPersons > 0) ? sum + ((numPersons / 20) * 30) : sum;
        }, 0);
    } else if (folioType === 'Base/Especial') {
        cost = (tiers || []).reduce((sum, tier) => {
            const tierPersons = parseInt(tier.persons, 10) || 0;
            const tierFillingCost = (tier.rellenos || []).reduce((tierSum, filling) => {
                 return (filling.hasCost && tierPersons > 0) ? tierSum + ((tierPersons / 20) * 30) : tierSum;
            }, 0);
            return sum + tierFillingCost;
        }, 0);
    }
    return cost;
};
// ===================== FIN DE LA CORRECCIÓN ======================

// --- CREAR un nuevo folio ---
exports.createFolio = async (req, res) => {
  try {
    const { 
        clientName, clientPhone, total, advancePayment, deliveryDate, 
        tiers, accessories, additional, isPaid, hasExtraHeight, imageComments, 
        cakeFlavor, filling, ...folioData 
    } = req.body;

    const [client] = await Client.findOrCreate({
      where: { phone: clientPhone },
      defaults: { name: clientName }
    });

    const lastFourDigits = client.phone.slice(-4);
    const date = parseISO(deliveryDate);
    const monthInitial = format(date, 'MMMM', { locale: es }).charAt(0).toUpperCase();
    const dayInitial = format(date, 'EEEE', { locale: es }).charAt(0).toUpperCase();
    const dayOfMonth = format(date, 'dd');
    
    let baseFolioNumber = `${monthInitial}${dayInitial}-${dayOfMonth}-${lastFourDigits}`;
    let finalFolioNumber = baseFolioNumber;
    let counter = 1;

    while (await Folio.findOne({ where: { folioNumber: finalFolioNumber } })) {
        finalFolioNumber = `${baseFolioNumber}-${counter}`;
        counter++;
    }
    
    const additionalData = JSON.parse(additional || '[]');
    const additionalCost = additionalData.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    
    const tiersData = JSON.parse(tiers || '[]');
    const fillingData = JSON.parse(filling || '[]');

    const fillingCost = calculateFillingCost(folioData.folioType, folioData.persons, fillingData, tiersData);

    const finalTotal = parseFloat(total) + parseFloat(folioData.deliveryCost || 0) + additionalCost + fillingCost;
    const balance = finalTotal - parseFloat(advancePayment);

    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    const comments = imageComments ? JSON.parse(imageComments) : [];

    const newFolio = await Folio.create({
      ...folioData,
      deliveryDate,
      folioNumber: finalFolioNumber,
      total: finalTotal,
      advancePayment,
      balance,
      clientId: client.id,
      responsibleUserId: req.user.id,
      imageUrls: imageUrls,
      imageComments: comments,
      tiers: tiersData,
      accessories: accessories,
      additional: additionalData,
      cakeFlavor: cakeFlavor,
      filling: filling,
      isPaid: isPaid === 'true',
      hasExtraHeight: hasExtraHeight === 'true'
    });
    res.status(201).json(newFolio);
  } catch (error) {
    console.error('ERROR DETALLADO AL CREAR FOLIO:', error);
    res.status(400).json({ message: 'Error al crear el folio', error: error.message });
  }
};

// --- OBTENER TODOS los folios (con búsqueda) ---
exports.getAllFolios = async (req, res) => {
  try {
    const { q } = req.query;
    let whereClause = {};

    if (q) {
      whereClause = {
        [Op.or]: [
          { folioNumber: { [Op.like]: `%${q}%` } },
          { '$client.name$': { [Op.like]: `%${q}%` } },
          { '$client.phone$': { [Op.like]: `%${q}%` } }
        ]
      };
    }

    const folios = await Folio.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client', attributes: ['name', 'phone'] },
        { model: User, as: 'responsibleUser', attributes: ['username'] }
      ],
      order: [['deliveryDate', 'ASC'], ['deliveryTime', 'ASC']]
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
            include: [
                { model: Client, as: 'client', attributes: ['name', 'phone'] },
                { model: User, as: 'responsibleUser', attributes: ['username'] },
                {
                    model: FolioEditHistory,
                    as: 'editHistory',
                    attributes: ['createdAt'],
                    include: { model: User, as: 'editor', attributes: ['username'] },
                    order: [['createdAt', 'ASC']]
                }
            ]
        });
        if (!folio) { return res.status(404).json({ message: 'Folio no encontrado' }); }
        res.status(200).json(folio);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el folio', error: error.message });
    }
};

// --- ACTUALIZAR un folio existente (Versión completa) ---
exports.updateFolio = async (req, res) => {
    try {
        const folioId = req.params.id;
        const folio = await Folio.findByPk(folioId);
        if (!folio) { 
            return res.status(404).json({ message: 'Folio no encontrado' }); 
        }

        const { 
            clientName, clientPhone, total, advancePayment, deliveryDate, 
            tiers, accessories, additional, isPaid, hasExtraHeight, imageComments,
            existingImageUrls, existingImageComments, cakeFlavor, filling,
            ...folioData 
        } = req.body;
        
        const client = await Client.findByPk(folio.clientId);
        if (client) {
            await client.update({ name: clientName, phone: clientPhone });
        }
        
        const additionalData = JSON.parse(additional || '[]');
        const additionalCost = additionalData.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        
        const tiersData = JSON.parse(tiers || '[]');
        const fillingData = JSON.parse(filling || '[]');

        const fillingCost = calculateFillingCost(folioData.folioType, folioData.persons, fillingData, tiersData);

        const finalTotal = parseFloat(total) + parseFloat(folioData.deliveryCost || 0) + additionalCost + fillingCost;
        const balance = finalTotal - parseFloat(advancePayment);

        const newImageUrls = req.files ? req.files.map(file => file.path) : [];
        const finalImageUrls = (existingImageUrls ? JSON.parse(existingImageUrls) : []).concat(newImageUrls);
        
        const newComments = imageComments ? JSON.parse(imageComments) : [];
        const finalImageComments = (existingImageComments ? JSON.parse(existingImageComments) : []).concat(newComments);

        await folio.update({
            ...folioData,
            deliveryDate,
            total: finalTotal,
            advancePayment,
            balance,
            imageUrls: finalImageUrls,
            imageComments: finalImageComments,
            tiers: tiersData,
            accessories: accessories,
            additional: additionalData,
            cakeFlavor: cakeFlavor,
            filling: filling,
            isPaid: isPaid === 'true',
            hasExtraHeight: hasExtraHeight === 'true'
        });

        await FolioEditHistory.create({ folioId: folioId, editorUserId: req.user.id });

        res.status(200).json(folio);

    } catch (error) {
        console.error("ERROR AL ACTUALIZAR FOLIO:", error);
        res.status(400).json({ message: 'Error al actualizar el folio', error: error.message });
    }
};

// --- ELIMINAR un folio ---
exports.deleteFolio = async (req, res) => {
    try {
        const folio = await Folio.findByPk(req.params.id);
        if (!folio) { return res.status(404).json({ message: 'Folio no encontrado' }); }
        
        if (folio.imageUrls && folio.imageUrls.length > 0) {
            for (const imageUrl of folio.imageUrls) {
                try {
                    await fs.unlink(path.join(__dirname, '..', '..', imageUrl));
                } catch (err) {
                    console.error(`No se pudo eliminar la imagen ${imageUrl}:`, err);
                }
            }
        }
        
        await folio.destroy();
        res.status(200).json({ message: 'Folio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el folio', error: error.message });
    }
};

// --- GENERAR PDF INDIVIDUAL Y MARCAR COMO IMPRESO ---
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
    const dayName = format(deliveryDate, 'EEEE dd', { locale: es });
    const dayFolder = `${dayName} de ${month}`;
    const directoryPath = path.join(__dirname, '..', '..', 'FOLIOS_GENERADOS', month, weekFolder, dayFolder);
    await fs.mkdir(directoryPath, { recursive: true });
    
    const folioDataForPdf = folio.toJSON();
    
    if (folioDataForPdf.tiers && typeof folioDataForPdf.tiers === 'string') {
        folioDataForPdf.tiers = JSON.parse(folioDataForPdf.tiers);
    }
    if (folioDataForPdf.cakeFlavor && typeof folioDataForPdf.cakeFlavor === 'string') {
        folioDataForPdf.cakeFlavor = JSON.parse(folioDataForPdf.cakeFlavor).join(', ');
    }
    if (folioDataForPdf.filling && typeof folioDataForPdf.filling === 'string') {
        folioDataForPdf.filling = JSON.parse(folioDataForPdf.filling).map(f => f.name).join('; ');
    }

    const dayOfWeek = format(deliveryDate, 'EEEE', { locale: es });
    let dayColor = '#F8F9FA';
    let textColor = '#000000';

    switch (dayOfWeek.toLowerCase()) {
        case 'lunes': dayColor = '#007bff'; textColor = '#ffffff'; break;
        case 'martes': dayColor = '#6f42c1'; textColor = '#ffffff'; break;
        case 'miércoles': dayColor = '#fd7e14'; textColor = '#ffffff'; break;
        case 'jueves': dayColor = '#28a745'; textColor = '#ffffff'; break;
        case 'viernes': dayColor = '#e83e8c'; textColor = '#ffffff'; break;
        case 'sábado': dayColor = '#ffc107'; textColor = '#000000'; break;
        case 'domingo': dayColor = '#343a40'; textColor = '#ffffff'; break;
    }
    folioDataForPdf.dayColor = dayColor;
    folioDataForPdf.textColor = textColor;

    folioDataForPdf.formattedDeliveryDate = format(deliveryDate, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
    const [hour, minute] = folio.deliveryTime.split(':');
    const time = new Date();
    time.setHours(hour, minute);
    folioDataForPdf.formattedDeliveryTime = format(time, 'h:mm a');
    
    const pdfBuffer = await pdfService.createPdf(folioDataForPdf);
    const filePath = path.join(directoryPath, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    console.log(`✅ PDF guardado en: ${filePath}`);

    if (!folio.isPrinted) {
        await folio.update({ isPrinted: true });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error al generar o guardar el PDF:', error);
    res.status(500).json({ message: 'Error al generar y guardar el PDF', error: error.message });
  }
};

// --- NUEVA FUNCIÓN: Marcar un folio como impreso manualmente ---
exports.markAsPrinted = async (req, res) => {
    try {
        const folio = await Folio.findByPk(req.params.id);
        if (!folio) {
            return res.status(404).json({ message: 'Folio no encontrado' });
        }
        await folio.update({ isPrinted: true });
        res.status(200).json({ message: 'Folio marcado como impreso.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar como impreso', error: error.message });
    }
};

// --- NUEVA FUNCIÓN: Generar PDFs masivos (Etiquetas y Comandas) ---
exports.generateDaySummaryPdf = async (req, res) => {
    const { date, type } = req.query;

    if (!date || !type) {
        return res.status(400).json({ message: 'Faltan los parámetros "date" o "type".' });
    }

    try {
        let whereClause = { deliveryDate: date };

        if (type === 'orders') {
            whereClause.deliveryLocation = {
                [Op.ne]: 'Recoge en Tienda'
            };
        }

        const foliosDelDia = await Folio.findAll({
            where: whereClause,
            include: [{ model: Client, as: 'client' }],
            order: [['deliveryTime', 'ASC']]
        });

        if (foliosDelDia.length === 0) {
            return res.status(404).send(`<h1>No se encontraron ${type === 'labels' ? 'etiquetas' : 'comandas'} para la fecha ${date}.</h1>`);
        }

        let pdfBuffer;
        if (type === 'labels') {
            pdfBuffer = await pdfService.createLabelsPdf(foliosDelDia);
        } else if (type === 'orders') {
            pdfBuffer = await pdfService.createOrdersPdf(foliosDelDia);
        } else {
            return res.status(400).json({ message: 'Tipo de PDF no válido.' });
        }
        
        const fileName = `Resumen_${type}_${date}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error(`Error al generar PDF de ${type}:`, error);
        res.status(500).json({ message: 'Error al generar el PDF masivo', error: error.message });
    }
};