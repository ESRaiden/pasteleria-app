const pdf = require('html-pdf-node');
const ejs = require('ejs');
const path = require('path');

exports.createPdf = async (folioData) => {
  try {
    // 1. Apuntamos a la ubicación de nuestra plantilla
    const templatePath = path.join(__dirname, '../templates/folioTemplate.ejs');

    // 2. Renderizamos el HTML, inyectando los datos del folio
    const html = await ejs.renderFile(templatePath, { folio: folioData });

    // 3. Opciones para el PDF
    const options = { format: 'Letter' }; // Formato Carta
    const file = { content: html };

    // 4. Generamos el PDF con la nueva librería
    const pdfBuffer = await pdf.generatePdf(file, options);
    console.log('✅ PDF generado con html-pdf-node. Tamaño:', pdfBuffer.length, 'bytes.');

    return pdfBuffer;

  } catch (error) {
    console.error('❌ Error durante la creación del PDF con html-pdf-node:', error);
    throw error;
  }
};