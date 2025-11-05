const { IaService } = require('../service/iaService');
const { getLogger } = require('../../config/logger');
const log = getLogger('iaController.log');

class IaController {
    constructor() {
        this.iaService = new IaService();
    }

    async getModelSentence(req, res) {
        try {
            const date = req.session.user.date;
            if (!date) {
                return res.status(400).json({ message: 'User date is not set' });
            }
            const response = await this.iaService.getModelSentence(date);
            return res.status(response.code).json(response.toJson());
        } catch (error) {
            log.error(`Failed to get model sentence: ${error.message}`);
            return res.status(error.code || 500).json({ message: error.message || "Cannot get model sentence" });
        }
    }
}

module.exports = { IaController };
