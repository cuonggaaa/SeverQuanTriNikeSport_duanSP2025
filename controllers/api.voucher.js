const mVoucher = require('../models/voucher.model');
const { responseHandler } = require('../utils/responseHandler');
const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
  const currentTime = Date.now();
  try {
    await Promise.all([
      mVoucher.updateMany(
        { status: 'Active', endDate: { $lt: currentTime } },
        { status: 'Expired' }
      ),
      mVoucher.updateMany(
        {
          status: 'Inactive',
          startDate: { $lt: currentTime },
          endDate: { $gt: currentTime }
        },
        { status: 'Active' }
      ),
      mVoucher.deleteMany({
        usageLimit: { $lte: 0 }
      })
    ]);

    console.log('Updated expired vouchers.');
  } catch (error) {
    console.error('Error updating vouchers:', error.message);
  }
});

// const getAll = async (req, res, next) => {
//   try {
//     const currentDate = Date.now();
//     const filter = { status: 'Active' };

//     let list = await mVoucher.find(filter);

//     const expiredUpdates = list
//       .filter((element) => element.endDate < currentDate)
//       .map((element) =>
//         mVoucher.updateOne({ _id: element._id }, { status: 'Expired' })
//       );

//     if (expiredUpdates.length > 0) {
//       await Promise.all(expiredUpdates);

//       list = await mVoucher.find(filter);
//     }

//     if (list.length > 0) {
//       return responseHandler(res, 200, 'Tìm thành công', list);
//     } else {
//       return responseHandler(res, 400, 'không có dữ liệu phù hợp');
//     }
//   } catch (error) {
//     return responseHandler(res, 500, 'Lỗi', null, error.message);
//   }
// };

const getAll = async (req, res, next) => {
  try {
    const list = await mVoucher.find({}).sort({ status: 1 });

    if (list.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', list);
    }

    return responseHandler(res, 400, 'không có dữ liệu phù hợp');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};



/// admin

const list = async (req, res, next) => {
  var msg = '';
  let data = [];

  try {
    data = await mVoucher.find().sort({ _id: 1 });

    if (!data || data.length == 0) {
      msg = 'Không tìm thấy dữ liệu';
      res.render('voucher/list', { msg: msg, data: data });
    }

    msg = `có dữ liệu , số lượng : ${data.length}`;

    res.render('voucher/list', { msg: msg, data: data });
  } catch (error) {
    res.render('voucher/list', { msg: error, data: data });
  }
};
const add = async (req, res, next) => {
  let msg = '';
  if (req.method !== 'POST') {
    return res.render('voucher/add', { msg });
  }
  const { code, description, endDate, startDate, discountValue, usageLimit } = req.body;
  let missingFields = [];

  let image = '';
  if (req.file) {
    image = req.file.path;
  }

  if (!code) missingFields.push('code');
  if (!description) missingFields.push('mô tả');
  if (!endDate) missingFields.push('ngày kết thúc');
  if (!startDate) missingFields.push('ngày bắt đầu');
  if (!discountValue) missingFields.push('giá trị');
  if (!usageLimit) missingFields.push('số lượng');
  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`); // Ghi log chi tiết
    return res.render('voucher/add', { msg });
  }
  try {
    const objVoucher = new mVoucher({
      code, description, endDate, startDate, discountValue, usageLimit,
      image
    });

    await objVoucher.save();
    msg = 'Đã thêm thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi: ${error.message}`;
  }

  res.render('voucher/add', { msg });
};
const edit = async (req, res, next) => {
  const id = req.params.id;
  let msg = '';

  try {
    var findVoucher = await mVoucher.findById(id);
    msg = `Đang chỉnh sửa voucher code : ${findVoucher.code}`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('voucher/edit', { msg, voucher: findVoucher });
  }

  if (req.method !== 'POST') {
    return res.render('voucher/edit', { msg, voucher: findVoucher });
  }
  let image = findVoucher.image;
  let endDate = findVoucher.endDate;
  let startDate = findVoucher.startDate;
  if (req.file) {
    image = req.file.path;
  }
  if (req.body.endDate) {
    endDate = req.body.endDate;
  }
  if (req.body.startDate) {
    startDate = req.body.startDate;
  }
  const { code, description, discountValue, usageLimit } = req.body;


  let missingFields = [];
  if (!code) missingFields.push('code');
  if (!description) missingFields.push('mô tả');
  if (!discountValue) missingFields.push('giá trị');
  if (!usageLimit) missingFields.push('số lượng');
  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`);
    return res.render('voucher/edit', { msg, voucher: findVoucher });
  }
  try {
    const updateVoucher = await mVoucher.findByIdAndUpdate(
      id,
      {
        code, description, endDate, startDate, discountValue, usageLimit,
        image,
      },
      { new: true },
    );

    if (!updateVoucher) {
      msg = `Không tìm thấy`;
      return res.render('voucher/edit', { msg, voucher: findVoucher });
    }

    msg = 'Cập nhật thành công';
    findVoucher = updateVoucher;
  } catch (error) {
    console.error(error);
    msg = `Lỗi: ${error.message}`;
  }

  res.render('voucher/edit', { msg: msg, voucher: findVoucher });
};
const del = async (req, res, next) => {
  const id = req.params.id;
  let msg = '';

  try {
    var dataVoucher = await mVoucher.findById(id);

    if (!dataVoucher) {
      msg = `Không tìm thấy`;
      return res.render('voucher/del', { msg, status: 0 });
    }
    msg = `code voucher :${dataVoucher.code} đang được chọn để xóa`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('voucher/del', { msg, status: 0 });
  }

  if (req.method !== 'POST') {
    return res.render('voucher/del', { msg, status: 0 });
  }

  try {
    await mVoucher.findByIdAndDelete(id);
    msg = 'xóa thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi : ${error.message}`;
  }

  res.render('voucher/del', { msg, status: 1 });
};


module.exports = {
  getAll,
  //admin
  list,
  add,
  edit,
  del,
};
