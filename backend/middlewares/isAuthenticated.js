module.exports = function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // User is authenticated, proceed to the next middleware/route
  }
  res.redirect('/login'); // Redirect to login if not authenticated
}
 