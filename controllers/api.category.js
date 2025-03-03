var Category = require('../models/category.model');
const { responseHandler } = require('../utils/responseHandler');
const mongoose = require('mongoose');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1) limit = 1;
    if (limit > 10) limit = 10;

    const skip = (page - 1) * limit;

    const { name } = req.query;
    const searchQuery = {};

    if (name) {
      searchQuery.name = new RegExp(name, 'i');
    }

    const list = await Category.find(searchQuery).skip(skip).limit(limit);

    const totalRecords = await Category.countDocuments();

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords: totalRecords,
      limit: limit
    };

    if (list.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', {
        data: list,
        ...pagination
      });
    } else {
      return responseHandler(res, 404, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};
const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const data = await Category.findById(id);
    if (data) {
      return responseHandler(res, 200, 'tìm thành công', data);
    } else {
      return responseHandler(res, 404, 'không có dữ liệu phù hợp');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

/// admin

const list = async (req, res, next) => {
  var msg = '';
  let data = [];

  try {
    data = await Category.find().sort({ _id: 1 });

    if (!data || data.length == 0) {
      msg = 'Không tìm thấy dữ liệu';
      res.render('category/list', { msg: msg, data: data });
    }

    msg = `có dữ liệu thể loại, số lượng : ${data.length}`;

    res.render('category/list', { msg: msg, data: data });
  } catch (error) {
    res.render('category/list', { msg: error, data: data });
  }
};
const add = async (req, res, next) => {
  let msg = '';
  if (req.method !== 'POST') {
    return res.render('category/add', { msg });
  }
  const { name } = req.body;
  let missingFields = [];

  let image = '';
  if (req.file) {
    image = req.file.path;
  }

  if (!name) missingFields.push('tên thể loại');
  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`); // Ghi log chi tiết
    return res.render('category/add', { msg });
  }
  try {
    const objCategory = new Category({
      name,
      image
    });

    await objCategory.save();
    msg = 'Đã thêm thể loại thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi: ${error.message}`;
  }

  res.render('category/add', { msg });
};
const edit = async (req, res, next) => {
  const categoryId = req.params.id;
  let msg = '';

  try {
    var category = await Category.findById(categoryId);
    msg = `Đang chỉnh sửa thể loại : ${category.name}`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('category/edit', { msg });
  }

  if (req.method !== 'POST') {
    return res.render('category/edit', { msg, category: category });
  }
  let image = category.image;
  if (req.file) {
    image = req.file.path;
  }
  const { name } = req.body;


  let missingFields = [];
  if (!name) missingFields.push('tên thể loại');
  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`);
    return res.render('category/edit', { msg });
  }
  try {
    const updateCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        image,
      },
      { new: true },
    );

    if (!updateCategory) {
      msg = `Không tìm thấy thể loại`;
      return res.render('category/edit', { msg });
    }

    msg = 'Cập nhật thể loại thành công';
    category = updateCategory;
  } catch (error) {
    console.error(error);
    msg = `Lỗi: ${error.message}`;
  }

  res.render('category/edit', { msg: msg, category: category });
};
const del = async (req, res, next) => {
  const categoryId = req.params.id;
  let msg = '';

  try {
    var dataProduct = await Category.findById(categoryId);

    if (!dataProduct) {
      msg = `Không tìm thấy thể loại`;
      return res.render('category/del', { msg, status: 0 });
    }
    msg = `${dataProduct.name} thể loại đang được chọn để xóa`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('category/del', { msg, status: 0 });
  }

  if (req.method !== 'POST') {
    return res.render('category/del', { msg, status: 0 });
  }

  try {
    await Category.findByIdAndDelete(categoryId);
    msg = 'xóa thể loại thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi : ${error.message}`;
  }

  res.render('category/del', { msg, status: 1 });
};


module.exports = {
  getAll,
  getById,
  //admin
  list,
  add,
  edit,
  del,
};
