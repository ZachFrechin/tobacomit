const { UserService } = require('../service/userService');
const { UserRepository } = require('../repository/userRepository');
const { getLogger } = require('../../config/logger');
const log = getLogger('userController.log');
const { dbPool } = require('../../config/database');

class UserController {
    constructor() {
        this.userService = new UserService(new UserRepository(dbPool));
    }

    async register(req, res) {
        try {
            const { name, password } = req.body;
            log.info(`Registering user ${name}`);
            const response = await this.userService.register(name, password);
            if(response.isSuccess() && response.data) {
                await new Promise((resolve, reject) => {
                    req.session.regenerate(function(err) {
                        if (err) {
                            log.error(`Failed to regenerate session: ${err.message}`);
                            return reject(err);
                        }
                        req.session.user = response.data;
                        req.session.save((saveErr) => {
                            if (saveErr) {
                                log.error(`Failed to save session: ${saveErr.message}`);
                                return reject(saveErr);
                            }
                            resolve();
                        });
                    });
                });
                log.info(`User registered successfully ${response.data.name}`);
            }
            if (req.accepts('html')) {
                return res.redirect('/');
            }
            return res.status(response.code).json(response.toJson());
        } catch (error) {
            log.error(`Failed to register user: ${error.message}`);
            return res.status(error.code || 500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            if(req.session.user) {
                return res.status(400).json({ message: 'User already logged in' });
            }
            const { name, password } = req.body;
            log.info(`Logging in user ${name}`);
            const response = await this.userService.login(name, password);
            if(response.isSuccess() && response.data) {
                await new Promise((resolve, reject) => {
                    req.session.regenerate(function(err) {
                        if (err) {
                            log.error(`Failed to regenerate session: ${err.message}`);
                            return reject(err);
                        }
                        req.session.user = response.data;
                        req.session.save((saveErr) => {
                            if (saveErr) {
                                log.error(`Failed to save session: ${saveErr.message}`);
                                return reject(saveErr);
                            }
                            resolve();
                        });
                    });
                });
                log.info(`User logged in successfully ${response.data.name}`);
            }
            if (req.accepts('html')) {
                return res.redirect('/');
            }
            return res.status(response.code).json(response.toJson());
        } catch (error) {
            log.error(`Failed to login user: ${error.message}`);
            return res.status(error.code || 500).json({ message: error.message });
        }
    }

    async logout(req, res) {
        try {
            log.info(`Logging out user ${req.session.user.name}`);
            req.session.destroy();
            log.info(`User logged out successfully`);
            return res.status(200).json({ message: 'User logged out successfully' });
        } catch (error) {
            log.error(`Failed to logout user: ${error.message}`);
            return res.status(error.code || 500).json({ message: "Cannot logout user" });
        }
    }

    async changeDate(req, res) {
        try {
            const { date } = req.body;
            const userId = req.session.user.id;
            log.info(`Changing date for user ${userId}`);
            const response = await this.userService.changeDate(userId, date);
            return res.status(response.code).json(response.toJson());
        } catch (error) {
            log.error(`Failed to change date: ${error.message}`);
            return res.status(error.code || 500).json({ message: "Cannot change date" });
        }
    }
}

module.exports = { UserController };