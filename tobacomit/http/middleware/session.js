function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

function isAuthenticatedView(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        return res.redirect('/login');
    }
}

module.exports = { isAuthenticated, isAuthenticatedView };