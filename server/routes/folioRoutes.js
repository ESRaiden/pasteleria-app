const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const folioController = require('../controllers/folioController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// --- NUEVO: Importar servicios de IA ---
const aiValidationService = require('../services/aiValidationService');
const aiImageAnalysisService = require('../services/aiImageAnalysisService');

// Configuración de Multer para guardar archivos de referencia en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `folio_img_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const uploadReference = multer({ storage: storage });

// --- NUEVO: Configuración de Multer para imagen de inspiración (en memoria) ---
const memoryStorage = multer.memoryStorage();
const uploadInspiration = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

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

// --- NUEVA RUTA PARA VALIDACIÓN Y SUGERENCIAS IA ---
router.post('/validate-suggest', async (req, res) => {
    try {
        const currentFolioData = req.body;
        if (!currentFolioData || typeof currentFolioData !== 'object') {
            return res.status(400).json({ message: 'No se recibieron datos del folio.' });
        }
        const results = await aiValidationService.validateAndSuggest(currentFolioData);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error en endpoint /validate-suggest:", error);
        res.status(500).json({ message: 'Error al procesar validación/sugerencia', error: error.message });
    }
});

// --- NUEVA RUTA PARA ANÁLISIS DE IMAGEN DE INSPIRACIÓN IA ---
router.post('/analyze-image', uploadInspiration.single('inspirationImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
    }
    try {
        const mimeType = req.file.mimetype;
        const base64Image = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
        const analysisResult = await aiImageAnalysisService.analyzeInspirationImage(base64Image);
        res.status(200).json(analysisResult);
    } catch (error) {
        console.error("Error en endpoint /analyze-image:", error);
        res.status(500).json({ message: 'Error al analizar la imagen', error: error.message });
    }
});

// Rutas para la colección de folios (/api/folios)
router.route('/')
  .get(folioController.getAllFolios)
  // Usa 'uploadReference' para las imágenes de referencia
  .post(uploadReference.array('referenceImages', 5), folioController.createFolio);

// Rutas para un folio específico (/api/folios/:id)
router.route('/:id')
  .get(folioController.getFolioById)
  // Usa 'uploadReference' para las imágenes de referencia
  .put(uploadReference.array('referenceImages', 5), folioController.updateFolio)
  .delete(authorize('Administrador'), folioController.deleteFolio);

// Ruta especial para generar el PDF de un solo folio
router.get('/:id/pdf', folioController.generateFolioPdf);

// Ruta para generar el PDF de la etiqueta de un solo folio
router.get('/:id/label-pdf', folioController.generateLabelPdf);

// --- RUTA PARA MARCAR UN FOLIO COMO IMPRESO (OBSOLETA, PERO SE MANTIENE POR SI ACASO) ---
router.patch('/:id/mark-as-printed', folioController.markAsPrinted);

// --- RUTA PARA CANCELAR UN FOLIO ---
router.patch('/:id/cancel', folioController.cancelFolio);

// --- RUTA PARA ACTUALIZAR ESTADOS DEL FOLIO (isPrinted, fondantChecked, dataChecked) ---
router.patch('/:id/status', folioController.updateFolioStatus);

module.exports = router;