const User = require('../models/user.model');
const mProduct = require('../models/product.model');
const mUser = require('../models/user.model');
// const mCart = require('../models/cart.model');
// const mOrder = require('../models/order.model');
const mongoose = require('mongoose');
var moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const { renderLoginError } = require('../utils/responseHandler');

const bashboard = async (req, res, next) => {
  res.render('home/index', {});
};

const login = async (req, res, next) => {
  if (req.method !== 'POST') {
    return res.render('login/login', { msg: '' });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return renderLoginError(res, 'Tài khoản hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return renderLoginError(res, 'Tài khoản hoặc mật khẩu không chính xác 2');
    }

    if (!user.is_admin) {
      return renderLoginError(res, 'Tài khoản không được quyền đăng nhập');
    }

    req.session.userLogin = user;
    res.locals.user = user;
    return res.redirect('/');
  } catch (error) {
    return renderLoginError(res, error.message);
  }
};

const logout = (req, res, next) => {
  try {
    if (req.session.userLogin) {
      delete req.session.userLogin;
    }

    if (res.locals.user) {
      delete res.locals.user;
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Lỗi khi hủy session:', err);
      }

      res.redirect('/r/login');
    });
  } catch (error) {
    console.error('Lỗi trong quá trình đăng xuất:', error);
    res.status(500).send('Đã xảy ra lỗi trong quá trình đăng xuất');
  }
};

module.exports = {
  login,
  logout,
  bashboard
};
