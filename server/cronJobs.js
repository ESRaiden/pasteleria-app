const cron = require('node-cron');
const { Op } = require('sequelize');
const { Commission, Folio } = require('./models');
const pdfService = require('./services/pdfService');
const { sendEmailWithAttachment } = require('./services/emailService');
const { format, subDays } = require('date-fns');

// Tarea programada para ejecutarse todos los días a las 9:00 PM.
cron.schedule('0 21 * * *', async () => {
    console.log('🕒 Ejecutando tarea programada: Generando y enviando reporte de comisiones...');

    try {
        const now = new Date();
        const reportDate = format(now, 'yyyy-MM-dd');

        // El final del periodo es hoy a las 8:30 PM
        const endOfPeriod = new Date(now);
        endOfPeriod.setHours(20, 30, 0, 0);

        // El inicio del periodo es ayer a las 8:31 PM
        const startOfPeriod = subDays(endOfPeriod, 1);
        startOfPeriod.setSeconds(startOfPeriod.getSeconds() + 1); // Empezamos un segundo después de las 8:30 de ayer

        const commissions = await Commission.findAll({
            include: [{ model: Folio, as: 'folio', attributes: ['folioNumber'] }],
            where: {
                createdAt: {
                    [Op.between]: [startOfPeriod, endOfPeriod]
                }
            },
            order: [['createdAt', 'ASC']]
        });

        const pdfBuffer = await pdfService.createCommissionReportPdf(commissions, reportDate);

        const subject = `Reporte de Comisiones - ${format(now, 'dd/MM/yyyy')}`;
        const text = `Adjunto encontrarás el reporte de comisiones para el día de trabajo que finalizó a las 8:30 PM.`;
        const filename = `ReporteComisiones_${reportDate}.pdf`;

        await sendEmailWithAttachment('hernandezmolinaisaac05@gmail.com', subject, text, pdfBuffer, filename);

    } catch (error) {
        console.error('❌ Error en la tarea programada de comisiones:', error);
    }
}, {
    scheduled: true,
    timezone: "America/Mexico_City" // Aseguramos la zona horaria correcta
});