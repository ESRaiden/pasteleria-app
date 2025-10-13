const cron = require('node-cron');
const { Op } = require('sequelize');
const { Commission, Folio } = require('./models');
const pdfService = require('./services/pdfService');
const { sendEmailWithAttachment } = require('./services/emailService');
const { format } = require('date-fns');

// Tarea programada para ejecutarse todos los días a las 9:00 PM.
// El formato es: 'minuto hora * * *'
cron.schedule('0 21 * * *', async () => {
    console.log('🕒 Ejecutando tarea programada: Generando y enviando reporte de comisiones...');

    try {
        const today = new Date();
        const date = format(today, 'yyyy-MM-dd');

        // Definimos el rango de horas: 7:00 AM de hoy a 8:30 PM de hoy.
        const startOfDay = new Date(`${date}T07:00:00.000-06:00`); // -06:00 para CST
        const endOfDay = new Date(`${date}T20:30:00.000-06:00`);

        const commissions = await Commission.findAll({
            include: [{ model: Folio, as: 'folio', attributes: ['folioNumber'] }],
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            order: [['createdAt', 'ASC']]
        });

        const pdfBuffer = await pdfService.createCommissionReportPdf(commissions, date);

        const subject = `Reporte de Comisiones - ${format(today, 'dd/MM/yyyy')}`;
        const text = `Adjunto encontrarás el reporte de comisiones generado el día de hoy.`;
        const filename = `ReporteComisiones_${date}.pdf`;

        await sendEmailWithAttachment('hernandezmolinaisaac05@gmail.com', subject, text, pdfBuffer, filename);

    } catch (error) {
        console.error('❌ Error en la tarea programada de comisiones:', error);
    }
}, {
    scheduled: true,
    timezone: "America/Mexico_City" // Aseguramos la zona horaria correcta
});