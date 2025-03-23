const mProductReview = require('../models/productReview.model');
const mProduct = require('../models/product.model');
const mUser = require('../models/user.model');
const { responseHandler } = require('../utils/responseHandler');
const mongoose = require('mongoose');
const APIError = require('../helpers/APIError');

const getByField = async (req, res, next, field) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    // Tìm kiếm theo field (productId hoặc userId)
    const data = await mProductReview
      .find({ [field]: id })
      .populate('userId')
      .populate('productId')
      // .populate({
      //   path: 'userId',
      //   select: 'name'
      // })
      // .populate({
      //   path: 'productId',
      //   select: 'name image'
      // })
      .select('reviewText rating -_id ');

    if (data.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', data);
    } else {
      return responseHandler(res, 400, 'không tìm thấy dữ liệu');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const create = async (req, res, next) => {
  try {
    const { userId, productId, rating, reviewText } = req.body;

    if (!rating || !reviewText) {
      return responseHandler(res, 400, 'thiếu thông tin đầu vào');
    }
    if (rating < 1 || rating > 5) {
      return responseHandler(res, 400, 'rating phải trong khoảng 1-5');
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const [user, product, findPR] = await Promise.all([
      mUser.findById(userId),
      mProduct.findById(productId),
      mProductReview.findOne({ userId, productId })
    ]);

    if (!user) {
      return responseHandler(res, 404, 'user không tồn tại');
    }
    if (!product) {
      return responseHandler(res, 404, 'sản phẩm không tồn tại');
    }
    if (findPR) {
      return responseHandler(res, 400, 'người dùng đã đánh giá sản phẩm này');
    }

    const newProductReview = new mProductReview({
      userId,
      productId,
      rating,
      reviewText
    });

    const savedReview = await newProductReview.save();

    return responseHandler(res, 201, 'tạo mới thành công', savedReview);
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const deleteById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const data = await mProductReview.findByIdAndDelete(id);
    if (data) {
      return responseHandler(res, 200, 'đã xóa thành công');
    }
    return responseHandler(res, 400, 'xóa thất bại');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const load = async (req, res, next, id) => {
  const data = await mProductReview.get(id);
  if (!data) {
    next(new APIError('Item not found', 404, true));
  }
  req.productReviewData = data;
  next();
};
const list = async (req, res, next) => {
  var msg = '';
  let data = [];

  try {
    data = await mProductReview.find().populate('userId').populate('productId').sort({ _id: 1 });

    if (!data || data.length == 0) {
      msg = 'Không tìm thấy dữ liệu';
      res.render('review/list', { msg: msg, data: data });
    }
    console.log("data", data);
    msg = `có dữ liệu , số lượng : ${data.length}`;

    res.render('review/list', { msg: msg, data: data });
  } catch (error) {
    res.render('review/list', { msg: error, data: data });
  }
};
const del = async (req, res, next) => {
  const id = req.params.id;
  let msg = '';

  try {
    var datafind = await mProductReview.findById(id);

    if (!datafind) {
      msg = `Không tìm thấy`;
      return res.render('review/del', { msg, status: 0 });
    }
    msg = `đánh giá :${datafind._id} đang được chọn để xóa`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('review/del', { msg, status: 0 });
  }

  if (req.method !== 'POST') {
    return res.render('review/del', { msg, status: 0 });
  }

  try {
    await mProductReview.findByIdAndDelete(id);
    msg = 'xóa thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi : ${error.message}`;
  }

  res.render('review/del', { msg, status: 1 });
};
module.exports = {
  getByField,
  create,
  deleteById,
  load,
  //admin
  list,
  del
};
