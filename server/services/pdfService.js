const pdf = require('html-pdf-node');
const ejs = require('ejs');
const path = require('path');

exports.createPdf = async (folioData) => {
  try {
    const templatePath = path.join(__dirname, '../templates/folioTemplate.ejs');
    const html = await ejs.renderFile(templatePath, { folio: folioData });

    // Opciones de PDF con la corrección para imprimir fondos
    const options = { 
        format: 'Letter',
        printBackground: true, // <-- ESTA LÍNEA ES LA SOLUCIÓN
        margin: {
            top: '25px',
            right: '25px',
            bottom: '25px',
            left: '25px'
        }
    };
    const file = { content: html };

    const pdfBuffer = await pdf.generatePdf(file, options);
    console.log('✅ PDF generado con el nuevo diseño. Tamaño:', pdfBuffer.length, 'bytes.');

    return pdfBuffer;

  } catch (error) {
    console.error('❌ Error durante la creación del PDF con el nuevo diseño:', error);
    throw error;
  }
};