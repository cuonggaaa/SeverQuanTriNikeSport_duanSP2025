const requiresLogin = (req, res, next) => {
  if (req.session.userLogin) {
    return next();
  }
  res.redirect('/r/login');
};

const noLoginRequired = (req, res, next) => {
  if (!req.session.userLogin) {
    return next();
  }
  res.redirect('/');
};
const checkLogin = (req, res, next) => {
  if (req.session && req.session.userLogin) {
    res.locals.user = req.session.userLogin;
    next();
  } else {
    res.redirect('/r/login');
  }
};

module.exports = {
  requiresLogin,
  noLoginRequired,
  checkLogin
};
