// Redirects to /login unless the user has logged in (session set by authController.login)
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

module.exports = { authMiddleware };
