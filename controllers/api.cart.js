var mProduct = require('../models/product.model');
var mCategory = require('../models/category.model');
var mCart = require('../models/cart.model');
const mongoose = require('mongoose');
const { responseHandler } = require('../utils/responseHandler');

var objReturn = {
  status: 1,
  msg: 'OK'
};

const getAll = async (req, res, next) => {
  try {
    const data = await mCart.find().populate({
      path: 'productId',
      populate: {
        path: 'categorysId',
        select: ''
      },
      select: ''
    });
    if (data.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', data);
    } else {
      return responseHandler(res, 400, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const getById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const cart = await mCart.findById(id).populate({
      path: 'productId',
      populate: {
        path: 'categorysId',
        select: ''
      },
      select: ''
    });

    if (cart) {
      return responseHandler(res, 200, 'tìm thành công', cart);
    } else {
      return responseHandler(res, 400, 'không tìm giỏ hàng');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }

  res.json(objReturn);
};

const getByUserId = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const cart = await mCart.find({ userId: id }).populate({
      path: 'productId',
      populate: {
        path: 'categorysId',
        select: ''
      },
      select: '-userId'
    });

    if (cart.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', cart);
    }
    return responseHandler(res, 400, 'không tìm thấy giỏ hàng');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const addCart = async (req, res, next) => {
  try {
    const { productId, quantity, userId } = req.body;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const product = await mProduct.findById(productId);
    if (!product) {
      return responseHandler(res, 400, 'sản phẩm không tồn tại');
    }

    const cart = await mCart.findOne({
      productId: productId,
      userId: userId
    });
    if (cart) {
      return responseHandler(
        res,
        400,
        'sản phẩm đã được thêm trong giỏ hàng của bạn trước đó'
      );
    }
    if (!quantity || quantity <= 0) {
      return responseHandler(res, 400, 'hãy nhập số lượng');
    }

    if (quantity > product.quantity) {
      return responseHandler(res, 400, 'sản phẩm trong kho không đủ');
    }

    const newCart = new mCart({
      productId,
      quantity,
      userId
    });

    const savedCart = await newCart.save();
    return responseHandler(res, 200, 'đã thêm sản phẩm', savedCart);
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const updateById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const updateFields = req.body;

    delete updateFields.productId;
    delete updateFields.userId;

    if (updateFields.quantity == null) {
      return responseHandler(res, 400, 'nhập số lượng ');
    }

    const findCart = await mCart.findById(id).populate('productId');
    if (!findCart) {
      return responseHandler(res, 404, 'không tìm thấy giỏ hàng');
    }
    if (!findCart.productId || findCart.productId === null) {
      return responseHandler(res, 400, 'sản phẩm đã bị xóa');
    }
    if (findCart.productId.quantity < updateFields.quantity) {
      return responseHandler(res, 400, 'số lượng trong kho không đủ');
    }
    if (updateFields.quantity <= 0) {
      await mCart.findByIdAndDelete(id);
      return responseHandler(res, 200, 'sửa thành công');
    }

    await mCart.findByIdAndUpdate(id, updateFields, {
      new: true
    });

    return responseHandler(res, 200, 'sửa thành công');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const deleteById = async (req, res, next) => {
  objReturn.data = null;

  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const delCart = await mCart.findByIdAndDelete(id);

    if (delCart) {
      return responseHandler(res, 200, 'xóa thành công');
    }
    return responseHandler(res, 400, 'không tìm thấy');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

module.exports = {
  getAll,
  getById,
  getByUserId,
  addCart,
  updateById,
  deleteById
};
