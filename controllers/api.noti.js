const Noti = require('../models/noti.model');
const { responseHandler } = require('../utils/responseHandler');

const findByIdUser = async (req, res, next) => {
  const userID = req.params.id;
  try {

    const data = await Noti.find({ userId: userID }).sort({ createdAt: -1 });

    if (data.length > 0) {
      return responseHandler(res, 200, 'Tìm thành công',
        data
      );
    } else {
      return responseHandler(res, 404, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'Lỗi', null, error.message);
  }
};

const findById = async (req, res, next) => {
  const id = req.params.id;
  try {

    const data = await Noti.findById(id);
    await Noti.findByIdAndUpdate(
      id,
      { status: 2 },
      { new: true }
    );

    if (data) {
      return responseHandler(res, 200, 'Tìm thành công',
        data
      );
    } else {
      return responseHandler(res, 404, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'Lỗi', null, error.message);
  }
};

async function createNoti(userId, content) {
  await Noti.create({
    userId: userId,
    content: content
  });
}

module.exports = {
  findByIdUser,
  findById,
  createNoti
};
