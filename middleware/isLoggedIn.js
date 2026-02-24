module.exports = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // Store return URL for better UX (optional, but good practice)
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
};
