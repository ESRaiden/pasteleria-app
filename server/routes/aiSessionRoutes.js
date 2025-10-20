const express = require('express');
const router = express.Router();
const aiSessionController = require('../controllers/aiSessionController');
const authMiddleware = require('../middleware/authMiddleware');

// Protegemos todas las rutas de sesiones con autenticación
router.use(authMiddleware);

router.route('/')
    .get(aiSessionController.getActiveSessions);

router.route('/:id')
    .get(aiSessionController.getSessionById);

router.route('/:id/chat')
    .post(aiSessionController.postChatMessage);

module.exports = router;