const pdf = require('html-pdf-node');
const ejs = require('ejs');
const path = require('path');

exports.createPdf = async (folioData) => {
  try {
    const templatePath = path.join(__dirname, '../templates/folioTemplate.ejs');
    const html = await ejs.renderFile(templatePath, { folio: folioData });

    // --- INICIO DE LA CORRECCIÓN ---

    // 1. Creamos el texto del pie de página dinámicamente
    const footerText = `Pedido capturado por: ${folioData.responsibleUser.username} el ${new Date(folioData.createdAt).toLocaleString('es-MX')}`;

    // 2. Modificamos las opciones del PDF
    const options = { 
        format: 'Letter',
        printBackground: true,
        displayHeaderFooter: true, // <-- MUY IMPORTANTE: Habilita el pie de página
        margin: {
            top: '25px',
            right: '25px',
            bottom: '40px', // <-- Aumentamos el margen inferior para dar espacio
            left: '25px'
        },
        // 3. Añadimos la plantilla del pie de página
        footerTemplate: `
          <div style="width: 100%; font-size: 9pt; text-align: center; padding: 10px 25px 0 25px; border-top: 1px solid #f0f0f0; box-sizing: border-box;">
            ${footerText}
          </div>
        `
    };
    // --- FIN DE LA CORRECCIÓN ---

    const file = { content: html };

    const pdfBuffer = await pdf.generatePdf(file, options);
    console.log('✅ PDF generado con pie de página corregido.');

    return pdfBuffer;

  } catch (error) {
    console.error('❌ Error durante la creación del PDF:', error);
    throw error;
  }
};