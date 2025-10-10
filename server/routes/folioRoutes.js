const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const folioController = require('../controllers/folioController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `folio_img_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Aplicamos el middleware de autenticación a todas las rutas de folios
router.use(authMiddleware);

// --- NUEVA RUTA PARA PDFs MASIVOS (ETIQUETAS Y COMANDAS) ---
// Se coloca antes de las rutas con /:id para evitar conflictos de enrutamiento
router.get('/day-summary-pdf', folioController.generateDaySummaryPdf);

// Rutas para la colección de folios (/api/folios)
router.route('/')
  .get(folioController.getAllFolios)
  .post(upload.array('referenceImages', 5), folioController.createFolio);

// Rutas para un folio específico (/api/folios/:id)
router.route('/:id')
  .get(folioController.getFolioById)
  .put(upload.array('referenceImages', 5), folioController.updateFolio)
  .delete(authorize('Administrador'), folioController.deleteFolio);

// Ruta especial para generar el PDF de un solo folio
router.get('/:id/pdf', folioController.generateFolioPdf);

// --- RUTA PARA MARCAR UN FOLIO COMO IMPRESO ---
router.patch('/:id/mark-as-printed', folioController.markAsPrinted);

// --- NUEVA RUTA PARA CANCELAR UN FOLIO ---
router.patch('/:id/cancel', folioController.cancelFolio);

module.exports = router;