const express = require('express');
const router = express.Router();
const { isAuthenticatedView } = require('../http/middleware/session');

/* GET home page. */
router.get('/', isAuthenticatedView, function(req, res, next) {
  console.log(req.session.user);
  res.render('home', { user: req.session.user });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/health', function(req, res, next) {
  res.status(200).json({ message: 'OK' });
});

module.exports = router;
