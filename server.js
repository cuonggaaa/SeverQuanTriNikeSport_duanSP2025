const express = require('express');
const crypto = require('crypto');
const morgan = require('morgan');
const faviconMiddleware = require('./middlewares/faviconMiddleware');
const cors = require('cors');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var path = require('path');

const { connectMongoDB } = require('./config/db');
// mdv
const checklogin = require('./middlewares/checklogin.js');

const app = express();
const port = 3000;
connectMongoDB();

const apiRouter = require('./routes/api');
const mainRoute = require('./routes/main.js');
const r = require('./routes/index.js');
const product = require('./routes/product.js');
const category = require('./routes/category.js');
const voucher = require('./routes/voucher.js');
const user = require('./routes/user.js');
// const review = require('./routes/review.js');
const order = require('./routes/order_admin.js');


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(faviconMiddleware);
app.use(morgan('dev'));
app.use(cors());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const secret = crypto.randomBytes(64).toString('hex');
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true
  })
);

app.use('/api', apiRouter);

//admin
app.use('/product', checklogin.requiresLogin, product);
app.use('/category', checklogin.requiresLogin, category);
app.use('/voucher', checklogin.requiresLogin, voucher);
app.use('/user', checklogin.requiresLogin, user);
// app.use('/review', checklogin.requiresLogin, review);
app.use('/order', checklogin.requiresLogin, order);
app.use('/r', r);
app.use('/', checklogin.requiresLogin, mainRoute);


app.listen(port, () => {
  console.log(`server runing port ${port} `);
});
