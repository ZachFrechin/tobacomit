const express = require('express');
const router = express.Router();
const { IaController } = require('../http/controller/iaController');
const { isAuthenticated } = require('../http/middleware/session');

const iaController = new IaController();
    
router.get('/get-model-sentence', isAuthenticated, async (req, res) => await iaController.getModelSentence(req, res));


module.exports = router;
