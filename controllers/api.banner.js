const Banner = require('../models/banner.model');
const { responseHandler } = require('../utils/responseHandler');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1) limit = 1;
    if (limit > 10) limit = 10;

    const skip = (page - 1) * limit;

    const [list, totalRecords] = await Promise.all([
      Banner.find().skip(skip).limit(limit),
      Banner.countDocuments()
    ]);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords: totalRecords,
      limit: limit
    };

    if (list.length > 0) {
      return responseHandler(res, 200, 'Tìm thành công', {
        data: list,
        ...pagination
      });
    } else {
      return responseHandler(res, 404, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'Lỗi', null, error.message);
  }
};

module.exports = {
  getAll
};
