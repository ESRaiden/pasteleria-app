const nodemailer = require('nodemailer');

// Configura el "transportador" de correo.
// Reemplaza con tus credenciales o usa variables de entorno para mayor seguridad.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hernandezmolinaisaac05@gmail.com', // Tu correo de Gmail
        pass: 'pqneenvboggwgjss' // ¡Usa una contraseña de aplicación de Google!
    }
});

/**
 * Envía un correo electrónico con un archivo adjunto.
 * @param {string} to - El destinatario del correo.
 * @param {string} subject - El asunto del correo.
 * @param {string} text - El cuerpo del correo en texto plano.
 * @param {Buffer} attachment - El buffer del archivo PDF a adjuntar.
 * @param {string} filename - El nombre del archivo adjunto.
 */
const sendEmailWithAttachment = async (to, subject, text, attachment, filename) => {
    try {
        await transporter.sendMail({
            from: '"Reportes Pastelería La Fiesta" <hernandezmolinaisaac05@gmail.com>',
            to,
            subject,
            text,
            attachments: [{
                filename,
                content: attachment,
                contentType: 'application/pdf'
            }]
        });
        console.log(`✅ Correo enviado exitosamente a ${to}`);
    } catch (error) {
        console.error(`❌ Error al enviar el correo:`, error);
    }
};

module.exports = { sendEmailWithAttachment };