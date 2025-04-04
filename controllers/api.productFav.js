const mProductFav = require('../models/productFavorites.model');
const mProduct = require('../models/product.model');
const mUser = require('../models/user.model');
const { responseHandler } = require('../utils/responseHandler');
const mongoose = require('mongoose');

const getByField = async (req, res, next, field) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const data = await mProductFav
      .find({ [field]: id })
      .populate('productId')
      // .populate({
      //   path: 'productId',
      //   select: '_id name image'
      // })
      .select('-__v -userId -createdAt -updatedAt ');

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
    const { userId, productId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const [user, product, findPR] = await Promise.all([
      mUser.findById(userId),
      mProduct.findById(productId),
      mProductFav.findOne({ userId, productId })
    ]);

    if (!user) {
      return responseHandler(res, 404, 'user không tồn tại');
    }
    if (!product) {
      return responseHandler(res, 404, 'sản phẩm không tồn tại');
    }
    if (findPR) {
      return responseHandler(res, 400, 'người dùng đã thích sản phẩm này');
    }

    const newProductFav = new mProductFav({
      userId,
      productId
    });

    const savedFav = await newProductFav.save();

    return responseHandler(res, 201, 'tạo mới thành công', savedFav);
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const deleteByIduserAndProduct = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const data = await mProductFav.findOneAndDelete({ userId, productId });
    if (data) {
      return responseHandler(res, 200, 'đã xóa yêu thích');
    }
    return responseHandler(res, 400, 'không tìm thấy yêu thích');
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

    const data = await mProductFav.findByIdAndDelete(id);
    if (data) {
      return responseHandler(res, 200, 'đã xóa yêu thích');
    }
    return responseHandler(res, 400, 'không tìm thấy yêu thích');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

module.exports = {
  getByField,
  create,
  deleteByIduserAndProduct,
  deleteById
};
