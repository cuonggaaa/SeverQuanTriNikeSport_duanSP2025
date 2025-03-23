let dateFormat = require('date-format');
let moment = require('moment');
var config = require('../config/vnpay-config');
//==
const mongoose = require('mongoose');
let mdOrder = require('../models/order.model');
let mdPaymentMethod = require('../models/paymentMethod.model');
let mdProduct = require('../models/product.model');
let mdCart = require('../models/cart.model');
let mdUser = require('../models/user.model');
let mdVoucher = require('../models/voucher.model');
const { responseHandler } = require('../utils/responseHandler');


// Function to sort an object by its keys
/**
 * @param {Object} obj - The object to be sorted
 * @returns {Object} - The sorted object
 */
function sortObject(obj) {
  // Create an empty object to store the sorted keys and values
  let sorted = {};
  // Create an empty array to store the sorted keys
  let str = [];
  // Variable to store the current key
  let key;

  // Iterate over the object's keys
  for (key in obj) {
    // Check if the key belongs to the object itself
    if (obj.hasOwnProperty(key)) {
      // Push the encoded key to the array
      str.push(encodeURIComponent(key));
    }
  }

  // Sort the array of encoded keys
  str.sort();

  // Iterate over the sorted keys
  for (key = 0; key < str.length; key++) {
    // Assign the encoded value to the sorted object, replacing %20 with +
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }

  // Return the sorted object
  return sorted;
}

let globalCartID;
let globalUserID;
let globalAmount;
let globalVoucherID;
let globalPaymentMethodID;
let globalAddress;

/**
 * This function creates a VNPay payment URL and returns it to the client.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} - The payment URL and other information
 */
const createPaymentUrl = async (req, res, next) => {
  // Extract the IP address from the request headers
  var ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // Extract the necessary configuration values
  var tmnCode = config.vnp_TmnCode;
  var secretKey = config.vnp_HashSecret;
  var vnpUrl = config.vnp_Url;
  var returnUrl = config.vnp_ReturnUrl;

  // Create a new date object and format it as a string
  var date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');
  var orderId = dateFormat(date, 'HHmmss');

  // Extract the user ID and cart ID from the request parameters and body
  let userID = req.body.userId;
  let cartID = req.body.cartId;
  let paymentMethodID = req.body.paymentMethodId;
  let voucherId = req.body.voucherId || '';
  let address = req.body.address;
  let amount = 0;

  try {
    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return responseHandler(res, 400, 'iduser không hợp lệ');

    }
    if (!address) {
      return responseHandler(res, 400, 'địa chỉ được để trống');

    }
    // Validate the voucherId

    var valueVoucher = 0;
    if (voucherId !== '') {
      if (!mongoose.Types.ObjectId.isValid(voucherId)) {
        return responseHandler(res, 400, 'voucherId không hợp lệ');

      }

      const finVoucher = await mdVoucher.findById(voucherId);
      if (finVoucher) {
        if (finVoucher.status !== 'Active' || finVoucher.usageLimit <= 0) {
          return responseHandler(res, 400, 'voucher đã hết hạn hoặc số lượng đã được dùng hết');
        }
      }
      valueVoucher = finVoucher.discountValue;

    }


    // Validate the paymentMethodID
    if (!mongoose.Types.ObjectId.isValid(paymentMethodID)) {
      return responseHandler(res, 400, 'paymentMethodID không hợp lệ');
    }


    // Find the user by ID
    const finPaymentMethod = await mdPaymentMethod.findById(paymentMethodID);
    if (!finPaymentMethod) {

      return responseHandler(res, 400, 'Không tìm thấy phương thức thanh toán');

    }
    // Find voucher



    const finUser = await mdUser.findById(userID);

    // Validate the cart ID and user
    if (!cartID || !Array.isArray(cartID) || !finUser) {

      return responseHandler(res, 400, 'Dữ liệu giỏ hàng hoặc user không hợp lệ');

    }

    // Validate and calculate the amount for each cart item
    for (const itemCart of cartID) {
      if (!mongoose.Types.ObjectId.isValid(itemCart)) {
        return responseHandler(res, 400, 'idcart không hợp lệ');

      }

      const fincart = await mdCart.findById(itemCart);
      if (!fincart) {

        return responseHandler(res, 400, 'Không tìm thấy sản phẩm trong giỏ hàng');

      }
      const findProduct = await mdProduct.findById(fincart.productId);
      // if (
      //   findProduct.quantity <= 0 &&
      //   fincart.quantity > findProduct.quantity
      // ) {

      //   return responseHandler(res, 400, 'số lượng sản phẩm đã hết hoặc không đủ');

      // }

      amount +=
        fincart.quantity * findProduct.price -
        fincart.quantity * findProduct.discount;

    }
    amount -= valueVoucher;

    if (amount < 0) {
      amount = 0;
    }

    // Store the global variables
    globalCartID = cartID;
    globalAmount = amount;
    globalUserID = userID;
    globalVoucherID = voucherId;
    globalPaymentMethodID = paymentMethodID;
    globalAddress = address;

    if (finPaymentMethod.code === 'VNPAY') {

    } else if (finPaymentMethod.code === 'COD') {
      return await codReturn(req, res, next);
    } else {

      return responseHandler(res, 400, 'Phương thước thanh toán không hợp lệ');
    }
  } catch (error) {

    return responseHandler(res, 500, 'lỗi', null, error.message);

  }



  // Set the locale to 'vn' if it is not provided
  let locale = req.body.language;
  if (locale === null || locale === '' || locale === undefined) {
    locale = 'vn';
  }

  // Set the currency code to 'VND'
  var currCode = 'VND';

  // Create the VNPay parameters
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  // Sort and sign the parameters
  vnp_Params = sortObject(vnp_Params);
  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  // Construct the payment URL
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  // Return the payment URL to the client

  return responseHandler(res, 200, 'OK', vnpUrl, null, 'url');

};

/**
 * This function handles the return from the VNPay payment gateway.
 * It validates the parameters, updates the order and cart data,
 * and renders a success page or an error page.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} - The success page or an error page
 */
const vnpayReturn = async (req, res, next) => {
  // Extract the VNPay parameters from the request query
  console.log(1);
  let vnp_Params = req.query;

  // Extract the secure hash from the parameters and delete it
  let secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sort and sign the parameters
  vnp_Params = sortObject(vnp_Params);
  // let config = require('config');
  let tmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require('crypto');
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
  console.log(1);

  // Validate the secure hash
  if (secureHash === signed) {
    try {
      console.log(1);

      // Extract the global variables
      const userID = globalUserID;
      const cartID = globalCartID;
      const amount = globalAmount;
      const voucher = globalVoucherID;
      const address = globalAddress;
      console.log(1);

      // Check the quantity of each product in the cart
      for (const iterator of cartID) {
        const finCart = await mdCart.findById(iterator);
        const findProduct = await mdProduct.findById(finCart.productId);

        const quantityCart = finCart.quantity;
        const quantityProduct = findProduct.quantity;

        // if (quantityCart > quantityProduct) {
        //   res.render('order/success', {
        //     code: 'Không thể thực hiện ,do số lượng sản phẩm nào đó không đủ hoặc đã hết'
        //   });
        // } else {
        // }
      }
      console.log(1);

      if (voucher && voucher.trim() !== "") {
        await mdVoucher.updateOne({ _id: voucher }, { $inc: { usageLimit: -1 } });
      }
      // Construct the cart data
      let data_cart = [];
      for (const iterator of cartID) {
        const finCart = await mdCart
          .findById(iterator)
          .populate('userId')
          .populate('productId');

        try {
          var cartObject = {
            _id: finCart._id,
            userId: {
              _id: finCart.userId._id,
              name: finCart.userId.name,
              email: finCart.userId.email,
              phone: finCart.userId.phone
            },
            productId: {
              _id: finCart.productId._id,
              categorysId: {
                _id: finCart.productId.categorysId._id,
                name: finCart.productId.categorysId.name
              },
              description: finCart.productId.description,
              price: finCart.productId.price,
              name: finCart.productId.name,
              discount: finCart.productId.discount,
              image: finCart.productId.image,
              quantity: finCart.productId.quantity
            },
            quantity: finCart.quantity,
            __v: finCart.__v
          };
        } catch (error) {
        }

        data_cart.push(cartObject);
      }
      console.log(1);

      // Construct the order data
      const newOrderData = {
        userId: userID,
        cartId: cartID,
        cartData: data_cart,
        totalAmount: amount,
        address: address,
        voucherId: voucher && voucher.trim() !== "" ? voucher : null,
        paymentMethodId: globalPaymentMethodID
      };
      console.log(1);

      // Save the order and order detail data
      const newORDER = new mdOrder(newOrderData);
      await newORDER.save();
      console.log(1);

      // Update the product and cart data
      for (const iterator of cartID) {
        const finCart = await mdCart.findById(iterator);
        const findProduct = await mdProduct.findById(finCart.productId);

        let quantityCart = finCart.quantity;
        let quantityProduct = findProduct.quantity;

        try {
          quantityProduct -= quantityCart;
          await mdProduct.findByIdAndUpdate(
            finCart.productId,
            { quantity: quantityProduct },
            { new: true }
          );
          await mdCart.findByIdAndDelete(cartID);
        } catch (error) {
          return responseHandler(res, 500, 'lỗi', null, error.message);

        }
      }
      console.log(1);

      // Render the success page
      res.render('order/success', {
        code: vnp_Params['vnp_ResponseCode']
      });
    } catch (error) {
      return responseHandler(res, 500, 'lỗi', null, error.message);
    }
  } else {
    return res.status(400).json({ error: 'Đã xảy ra lỗi 2 ' });
  }
};

const codReturn = async (req, res, next) => {

  // Validate the secure hash
  try {
    // Extract the global variables
    const userID = globalUserID;
    const cartID = globalCartID;
    const amount = globalAmount;
    const voucher = globalVoucherID;
    const address = globalAddress;
    // Check the quantity of each product in the cart
    for (const iterator of cartID) {
      const finCart = await mdCart.findById(iterator);
      const findProduct = await mdProduct.findById(finCart.productId);

      const quantityCart = finCart.quantity;
      const quantityProduct = findProduct.quantity;

      // if (quantityCart > quantityProduct) {
      //   return responseHandler(res, 400, 'Không thể thực hiện ,do số lượng sản phẩm nào đó không đủ hoặc đã hết', null);
      // } else {
      // }
    }
    if (voucher && voucher.trim() !== "") {
      await mdVoucher.updateOne({ _id: voucher }, { $inc: { usageLimit: -1 } });
    }
    // Construct the cart data
    let data_cart = [];
    for (const iterator of cartID) {
      const finCart = await mdCart
        .findById(iterator)
        .populate('userId')
        .populate('productId');

      try {
        var cartObject = {
          _id: finCart._id,
          userId: {
            _id: finCart.userId._id,
            name: finCart.userId.name,
            email: finCart.userId.email,
            phone: finCart.userId.phone
          },
          productId: {
            _id: finCart.productId._id,
            categorysId: {
              _id: finCart.productId.categorysId._id,
              name: finCart.productId.categorysId.name
            },
            description: finCart.productId.description,
            price: finCart.productId.price,
            name: finCart.productId.name,
            discount: finCart.productId.discount,
            image: finCart.productId.image,
            quantity: finCart.productId.quantity
          },
          quantity: finCart.quantity,
          __v: finCart.__v
        };
      } catch (error) {
      }

      data_cart.push(cartObject);
    }
    console.log("🚀 ~ codReturn ~ voucher:", voucher)
    // Construct the order data
    const newOrderData = {
      userId: userID,
      cartId: cartID,
      cartData: data_cart,
      totalAmount: amount,
      address: address,
      voucherId: voucher && voucher.trim() !== "" ? voucher : null,
      paymentMethodId: globalPaymentMethodID
    };
    // Save the order and order detail data
    const newORDER = new mdOrder(newOrderData);
    await newORDER.save();

    // Update the product and cart data
    for (const iterator of cartID) {
      const finCart = await mdCart.findById(iterator);
      const findProduct = await mdProduct.findById(finCart.productId);

      let quantityCart = finCart.quantity;
      let quantityProduct = findProduct.quantity;

      quantityProduct -= quantityCart;
      await mdProduct.findByIdAndUpdate(
        finCart.productId,
        { quantity: quantityProduct },
        { new: true }
      );
      await mdCart.findByIdAndDelete(cartID);
    }
    return responseHandler(res, 200, 'đặt hàng cod thành công', newORDER);
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
}

/**
 * This function is responsible for fetching all orders associated with a user from the database
 * based on the userID in the request parameters.
 * It uses the orderModel from the mdOrder module to perform the query.
 * The query is populated with the userId field to include their respective data.
 * The function then checks if the order list has any items.
 * If it does, it sets the status to 1, the message to 'tìm thành công', and the data to the list of orders.
 * If it doesn't, it sets the status to 0, the message to 'Không tìm thấy đơn hàng',
 * and returns a JSON response with the status and message.
 * If there is an error during the process, it sets the status to 0, the message to the error message,
 * and returns a JSON response with the status and message.
 * Finally, it returns a JSON response with the status, message, and data.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @return {Object} - A JSON response with the status, message, and data
 */
const getByIdUser = async (req, res, next) => {

  try {
    const userID = req.params.id;

    // Check if the userID is valid
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return responseHandler(res, 404, 'userID không hợp lệ');

    }

    // Query the orderModel to find all orders associated with the user by userID
    const order = await mdOrder
      .find({ userId: userID })
      .populate('userId') // Populate the userId field with the respective data
      .populate('voucherId')
      .populate('paymentMethodId');

    // Check if the order list has any items
    if (order.length <= 0) {
      // Check if the order list has any items
      return responseHandler(res, 404, 'Không tìm thấy đơn hàng');

    } else {
      return responseHandler(res, 200, 'tìm thành công', order);

    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);

  }
};
const updateStatus = async (req, res, next) => {

  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 404, 'id không hợp lệ');

    }

    const order = await mdOrder.findOneAndUpdate(
      {
        _id: id,
        status: { $in: ["Pending", "Processing"] }
      },
      { $set: { status: "Cancelled" } },
      { new: true } // Tùy chọn này trả về tài liệu sau khi được cập nhật
    );

    if (!order) {
      return responseHandler(res, 404, 'Không tìm thấy đơn hàng');

    } else {
      return responseHandler(res, 200, 'cập nhật thành công', order);

    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);

  }
};


const order_list = async (req, res, next) => {
  try {
    if (req.method === 'GET') {
      await handleGetRequest(req, res);
    } else if (req.method === 'POST') {
      await handlePostRequest(req, res);
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error in order_list:', error);
    res.status(500).send('Internal Server Error');
  }
};

const handleGetRequest = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const filterConditions = buildFilterConditions(req.query);

  try {
    const [
      bills,
      totalBills,
      stats
    ] = await Promise.all([
      fetchBills(filterConditions, skip, limit),
      mdOrder.countDocuments(filterConditions),
      calculateStats(filterConditions)
    ]);
    console.log("🚀 ~ handleGetRequest ~ bills:", bills)

    const totalPages = Math.ceil(totalBills / limit);

    formatBillDates(bills);

    res.render('order/index', {
      msg: '',
      msg2: '',
      bills,
      totalPages,
      currentPage: page,
      query: req.query,
      ...stats
    });
  } catch (error) {
    console.error('Error in handleGetRequest:', error);
    res.status(500).send('Error fetching orders');
  }
};

const handlePostRequest = async (req, res) => {
  const { billId, status } = req.body;

  if (!billId || !status) {
    return res.status(400).send('Missing billId or status');
  }

  try {
    await mdOrder.findByIdAndUpdate(billId, { status });
    console.log(`Updated bill ${billId} with status ${status}`);
    res.redirect('back');
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).send('Error updating bill status');
  }
};

const buildFilterConditions = (query) => {
  let filterConditions = {};

  if (query['payments']) {
    filterConditions.payments = query['payments'];
  }

  if (query['status']) {
    filterConditions.status = query['status'];
  }

  const { 'from-date': fromDate, 'to-date': toDate } = query;
  if (fromDate && toDate && moment(fromDate, 'YYYY-MM-DD', true).isValid() && moment(toDate, 'YYYY-MM-DD', true).isValid()) {
    const startDate = moment(fromDate, 'YYYY-MM-DD').toDate();
    const endDate = moment(toDate, 'YYYY-MM-DD').add(1, 'days').toDate();
    filterConditions.createdAt = { $gte: startDate, $lt: endDate };
  }

  if (query['id_'] && mongoose.Types.ObjectId.isValid(query['id_'])) {
    filterConditions._id = query['id_'];
  }

  if (query['user-id'] && mongoose.Types.ObjectId.isValid(query['user-id'])) {
    filterConditions.userId = query['user-id'];
  }

  if (query['min-price'] && query['max-price']) {
    filterConditions.totalAmount = {
      $gte: Number(query['min-price']),
      $lte: Number(query['max-price'])
    };
  }

  return filterConditions;
};

const fetchBills = async (filterConditions, skip, limit) => {
  return mdOrder.find(filterConditions)
    .skip(skip)
    .limit(limit)
    .populate('userId')
    .populate('paymentMethodId')
    .populate({
      path: 'cartData',
      populate: {
        path: 'productId',
      }
    })
    .sort({ createdAt: -1 });
};

const calculateStats = async (filterConditions) => {
  const [
    tong_so_hoa_don,
    tong_so_hoa_don_da_thanh_toan,
    tong_tien,
    tong_tien_da_thanh_toan
  ] = await Promise.all([
    mdOrder.countDocuments(filterConditions),
    mdOrder.countDocuments({ ...filterConditions, status: "Delivered" }),
    mdOrder.aggregate([
      { $match: filterConditions },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    mdOrder.aggregate([
      { $match: { ...filterConditions, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
  ]);

  const ti_le_thanh_toan = ((tong_so_hoa_don_da_thanh_toan / tong_so_hoa_don) * 100).toFixed(2);
  const total = tong_tien.length > 0 ? tong_tien[0].total : 0;
  const totalPaid = tong_tien_da_thanh_toan.length > 0 ? tong_tien_da_thanh_toan[0].total : 0;

  return {
    tong_so_hoa_don,
    tong_tien: total,
    tong_tien_da_thanh_toan: totalPaid,
    ti_le_thanh_toan
  };
};

const formatBillDates = (bills) => {
  bills.forEach(bill => {
    const date = new Date(bill.createdAt);
    date.setHours(date.getHours() + 7);
    bill.createdAt = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' +
      date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });
};


module.exports = {
  createPaymentUrl,
  vnpayReturn,
  getByIdUser,
  updateStatus,

  //admin
  order_list,
};
