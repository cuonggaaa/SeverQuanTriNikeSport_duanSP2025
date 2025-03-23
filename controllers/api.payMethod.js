var mPaymentMethod = require('../models/paymentMethod.model');
const { responseHandler } = require('../utils/responseHandler');

const getAll = async (req, res, next) => {
  try {
    const list = await mPaymentMethod.find();

    if (list.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', list);
    } else {
      return responseHandler(res, 400, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

module.exports = {
  getAll
};
