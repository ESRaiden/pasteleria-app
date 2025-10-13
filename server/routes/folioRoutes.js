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

// --- RUTA PARA PDFs MASIVOS (ETIQUETAS Y COMANDAS) ---
router.get('/day-summary-pdf', folioController.generateDaySummaryPdf);

// --- RUTA PARA OBTENER ESTADÍSTICAS (SÓLO ADMIN) ---
router.get('/statistics', authorize('Administrador'), folioController.getStatistics);

// --- RUTA PARA ESTADÍSTICAS DE PRODUCTIVIDAD (SÓLO ADMIN) ---
router.get('/productivity', authorize('Administrador'), folioController.getProductivityStats);

// --- RUTA PARA REPORTE DE COMISIONES (SÓLO ADMIN) ---
router.get('/commission-report', authorize('Administrador'), folioController.generateCommissionReport);

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

// Ruta para generar el PDF de la etiqueta de un solo folio
router.get('/:id/label-pdf', folioController.generateLabelPdf);

// --- RUTA PARA MARCAR UN FOLIO COMO IMPRESO (OBSOLETA, PERO SE MANTIENE POR SI ACASO) ---
router.patch('/:id/mark-as-printed', folioController.markAsPrinted);

// --- RUTA PARA CANCELAR UN FOLIO ---
router.patch('/:id/cancel', folioController.cancelFolio);

// ==================== INICIO DE LA MODIFICACIÓN ====================
// --- NUEVA RUTA PARA ACTUALIZAR ESTADOS DEL FOLIO ---
router.patch('/:id/status', folioController.updateFolioStatus);
// ===================== FIN DE LA MODIFICACIÓN ======================

module.exports = router;