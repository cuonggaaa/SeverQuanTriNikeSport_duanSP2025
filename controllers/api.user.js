const User = require('../models/user.model');
const { responseHandler } = require('../utils/responseHandler');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const getAll = async (req, res, next) => {
  try {
    const data = await User.find();
    if (data.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', data, null, 'user');
    } else {
      return responseHandler(res, 400, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const getById = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return responseHandler(res, 404, 'userId không hợp lệ');
    }
    const user = await User.findById(userId);

    if (user) {
      return responseHandler(res, 200, 'tìm thành công', user, null, 'user');
    } else {
      return responseHandler(res, 404, 'không tìm thấy người dùng');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const addUser = async (req, res, next) => {
  try {
    const { name, address, phone, email, password: userPassword } = req.body;

    if (!email || !userPassword || !name || !address || !phone) {
      return responseHandler(res, 400, 'vui lòng nhập đầy đủ thông tin');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler(res, 400, 'email đã tồn tại');
    }
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = new User({
      password: hashedPassword,
      name,
      address,
      phone,
      email
    });

    const savedUser = await newUser.save();

    const { password: pwd, ...userWithoutPassword } = savedUser.toObject();

    // const info = await transporter.sendMail({
    //   from: 't6ngl4m@gmail.com', // email gửi đi
    //   to: savedUser.email, // email nhận
    //   subject: 'Trường Đại Học Của Vũ Minh', // chủ đề email
    //   text: `Đã đăng kí tài khoản thành công ${savedUser.email}` // nội dung email
    // });
    // console.log('Email sent: ' + info.response);
    return responseHandler(res, 200, 'đăng kí tài khoản thành công');
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const updateById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const updateFields = req.body;

    delete updateFields.password;
    delete updateFields.is_admin;
    delete updateFields.createdAt;
    delete updateFields.updatedAt;

    // Kiểm tra nếu có file ảnh được tải lên
    if (req.file) {
      // Lưu đường dẫn ảnh (tùy thuộc vào nơi bạn lưu ảnh)
      updateFields.image = req.file.path; // Giả sử bạn lưu đường dẫn của ảnh
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return responseHandler(res, 400, 'id người dùng không hợp lệ');
    }
    const user = await User.findOne({ email: updateFields.email });
    if (user && new mongoose.Types.ObjectId(user._id).toString() !== userId) {
      return responseHandler(res, 400, 'email đã tồn tại');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true
    });
    if (!updatedUser) {
      return responseHandler(res, 400, 'không tìm thấy người dùng');
    }
    return responseHandler(res, 200, 'cập nhật thành công', updatedUser, null);
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 400, 'mật khẩu cũ không chính xác');
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return responseHandler(res, 400, 'mật khẩu cũ không chính xác');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    return responseHandler(
      res,
      200,
      'mật khẩu đã được thay đổi thành công',
      user,
      null
    );
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      email
    }).lean();

    if (!user) {
      return responseHandler(
        res,
        400,
        'email người dùng hoặc mật khẩu không chính xác'
      );
    }
    const isPasswordmatch = await bcrypt.compare(password, user.password);
    if (!isPasswordmatch) {
      return responseHandler(
        res,
        400,
        'email người dùng hoặc mật khẩu không chính xác'
      );
    }
    // Xóa mật khẩu khỏi kết quả trả về
    delete user.password;

    return responseHandler(
      res,
      200,
      'đăng nhập thành công',
      user,
      null,
      'user'
    );
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const list = async (req, res, next) => {
  var msg = '';
  let data = [];

  try {
    data = await User.find().sort({ _id: 1 });

    if (data.length <= 0) {
      msg = 'không tìm thấy dữ liệu';
      return res.render('user/list', {
        msg: msg,
        data: data
      });
    }
    if (data.length > 0 && req.method !== 'POST') {
      msg = `có dữ liệu người dùng, số lượng : ${data.length}`;
      return res.render('user/list', {
        msg: msg,
        data: data
      });
    }
  } catch (error) {
    return res.render('user/list', {
      msg: error,
      data: data
    });
  }

  const { name } = req.body;
  console.log("🚀 ~ list ~ name:", name)
  try {
    var user = [];
    user = await User.find({
      name: { $regex: name, $options: 'i' },
      is_admin: false
    });

    if (user.length > 0) {
      msg = `có dữ liệu người dùng, số lượng : ${user.length}`;
      return res.render('user/list', {
        msg,
        data: user
      });
    }
    return res.render('user/list', {
      msg: 'không tìm thấy dữ liệu',
      data: user
    });
  } catch (error) {
    return res.render('user/list', {
      msg: error.message,
      data: user
    });
  }
};
const add = async (req, res, next) => {
  let msg = '';
  if (req.method !== 'POST') {
    return res.render('user/add', { msg });
  }
  const { name, address, phone, email, password: userPassword, passwordcf } = req.body;

  let missingFields = [];

  let image = '';
  if (req.file) {
    image = req.file.path;
  }

  if (!name) missingFields.push('tên');
  if (!address) missingFields.push('địa chỉ');
  if (!phone) missingFields.push('số điện thoại');
  if (!phone || !/^\d+$/.test(phone)) {
    missingFields.push('số điện thoại phải là số');
  }
  if (!email) missingFields.push('email');
  if (!userPassword) missingFields.push('mật khẩu người dùng');
  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`); // Ghi log chi tiết
    return res.render('user/add', { msg });
  }
  try {
    if (passwordcf !== userPassword) {
      msg = 'mật khẩu không trùng khớp';
      res.render('user/add', { msg });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      msg = 'email đã tồn tại';
      res.render('user/add', { msg });
      return;
    } else {
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      const newUser = new User({
        password: hashedPassword,
        name,
        address,
        phone,
        email
      });

      const savedUser = await newUser.save();
      const { password: pwd, ...userWithoutPassword } = savedUser.toObject();

      msg = 'Tạo tài khoản thành công';
    }


  } catch (error) {
    console.error(error);
    msg = `Lỗi: ${error.message}`;
  }

  res.render('user/add', { msg });
};
const edit = async (req, res, next) => {
  const productid = req.params.id;
  let msg = '';

  const findCategory = await Course.find();

  try {
    var mclass = await Class.findById(productid);
    msg = `Đang chỉnh sửa môn học : ${mclass.class_code}`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('class/edit', {
      msg,
      type: findCategory
    });
  }

  if (req.method !== 'POST') {
    return res.render('class/edit', {
      msg,
      class: mclass,
      type: findCategory
    });
  }

  const { instructor, day, time, status, class_code, course_id } = req.body;
  let missingFields = [];
  if (!instructor) missingFields.push('tên giảng viên');
  if (!day) missingFields.push('ngày học');
  if (!time) missingFields.push('thời gian học');
  if (!status) missingFields.push('trạng thái');
  if (!class_code) missingFields.push('mã môn');
  if (!course_id) missingFields.push('khóa học');

  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`);
    return res.render('class/edit', {
      msg,
      class: mclass,
      type: findCategory
    });
  }

  try {
    const findClass = await Class.findOne({
      class_code: class_code
    });
    if (findClass) {
      if (findClass.class_code !== mclass.class_code) {
        msg = `Mã khóa học đã tồn tại`;
        return res.render('class/edit', {
          msg,
          mclass,
          type: findCategory
        });
      }
    }

    const updateProduct = await Class.findByIdAndUpdate(
      productid,
      {
        instructor,
        day,
        time,
        status,
        class_code,
        course_id
      },
      { new: true }
    );

    if (!updateProduct) {
      msg = `không tìm thấy môn học`;
      return res.render('class/edit', {
        msg,
        class: mclass || {},
        type: findCategory
      });
    }

    msg = 'Cập nhật môn học thành công';
    mclass = updateProduct;
  } catch (error) {
    console.error(error);
    msg = `Lỗi: ${error.message}`;
  }

  res.render('class/edit', {
    msg: msg,
    class: mclass,
    type: findCategory
  });
};
const del = async (req, res, next) => {
  const UId = req.params.id;
  let msg = '';

  try {
    var findUser = await User.findById(UId);

    if (!findUser) {
      msg = `không tìm thấy người dùng`;
      return res.render('user/del', {
        msg,
        status: 0
      });
    }
    msg = `người dùng ${findUser.name} đang được chọn để xóa`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('user/del', {
      msg,
      status: 0
    });
  }

  if (req.method !== 'POST') {
    return res.render('user/del', {
      msg,
      status: 0
    });
  }

  try {
    await User.findByIdAndDelete(UId);
    msg = 'xóa người dùng thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi : ${error.message}`;
  }

  res.render('user/del', { msg, status: 1 });
};
module.exports = {
  getAll,
  getById,
  addUser,
  updateById,
  changePassword,
  userLogin,

  //ADMIN
  list,
  add,
  edit,
  del,
};
