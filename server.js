const express = require('express');
const crypto = require('crypto');
const morgan = require('morgan');
const faviconMiddleware = require('./middlewares/faviconMiddleware.js');
const cors = require('cors');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var path = require('path');

const { connectMongoDB } = require('./config/db.js');

const app = express();
const port = 3000;
connectMongoDB();


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

app.listen(port, () => {
  console.log(`server runing port ${port} `);
});
