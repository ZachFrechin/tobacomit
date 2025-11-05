const express = require('express');
const router = express.Router();
const { UserController } = require('../http/controller/userController');
const { isAuthenticated } = require('../http/middleware/session');

const userController = new UserController();

/* GET users listing. */
router.post('/register', async (req, res) => await userController.register(req, res));
router.post('/login', async (req, res) => await userController.login(req, res));
router.post('/logout', async (req, res) => await userController.logout(req, res));

router.put('/change-date', isAuthenticated, async (req, res) => await userController.changeDate(req, res));


module.exports = router;
