const mProduct = require('../models/product.model');
const mProductR = require('../models/productReview.model');
const mProductF = require('../models/productFavorites.model');
const mCategory = require('../models/category.model');
const mCart = require('../models/cart.model');
const mongoose = require('mongoose');
const { responseHandler } = require('../utils/responseHandler');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1) limit = 1;
    if (limit > 10) limit = 10;

    const skip = (page - 1) * limit;

    const { name, priceMin, priceMax, sort, order, category } = req.query;
    const searchQuery = {};

    if (name) {
      searchQuery.name = new RegExp(name, 'i');
    }
    if (category) {
      searchQuery.categorysId = category;
    }
    if (priceMin || priceMax) {
      searchQuery.price = {};
      if (priceMin) searchQuery.price.$gte = parseFloat(priceMin);
      if (priceMax) searchQuery.price.$lte = parseFloat(priceMax);
    }

    const sortOptions = {};
    if (sort) {
      sortOptions[sort] = order === 'desc' ? -1 : 1; // 'desc' => giảm dần, mặc định tăng dần
    }
    // sort=name or price: Trường sắp xếp
    // order=asc: Tăng dần
    // order=desc: Giảm dần

    const [data, totalRecords] = await Promise.all([
      mProduct
        .find(searchQuery)
        .populate('categorysId')
        .sort(sortOptions),
      // .skip(skip)
      // .limit(limit),
      mProduct.countDocuments()
    ]);

    const convertData = await Promise.all(
      data.map(async (item) => {
        const [favoritesValue, reviewCount, dataPR] = await Promise.all([
          mProductF.countDocuments({ productId: item._id }),
          mProductR.countDocuments({ productId: item._id }),
          mProductR.find({ productId: item._id })
        ]);

        // Tính giá trị trung bình của rating
        const totalRating = dataPR.reduce(
          (sum, review) => sum + (review.rating || 0),
          0
        );
        let reviewValue = reviewCount > 0 ? totalRating / reviewCount : 0;
        // Làm tròn reviewValue tới 1 chữ số sau dấu thập phân
        reviewValue = Math.round(reviewValue * 10) / 10;

        return {
          ...item.toObject(),
          favoritesValue,
          reviewValue,
          reviewCount
        };
      })
    );

    // const pagination = {
    //   currentPage: page,
    //   totalPages: Math.ceil(totalRecords / limit),
    //   totalRecords: totalRecords,
    //   limit: limit
    // };
    if (data.length > 0) {
      return responseHandler(res, 200, 'tìm thành công', {
        data: convertData,
        // ...pagination
      });
    } else {
      return responseHandler(res, 400, 'không tìm thấy dữ liệu');
    }
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const getById = async (req, res, next) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return responseHandler(res, 400, 'id không hợp lệ');
    }

    const product = await mProduct.findById(productId).populate('categorysId');
    if (!product) {
      return responseHandler(res, 404, 'sản phẩm không tồn tại');
    }

    const [favoritesValue, reviews] = await Promise.all([
      mProductF.countDocuments({ productId }),
      mProductR.find({ productId })
    ]);

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const reviewCount = reviews.length;
    const reviewValue =
      reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 0;

    const productWithStats = {
      ...product.toObject(),
      favoritesValue,
      reviewValue,
      reviewCount
    };

    return responseHandler(res, 200, 'tìm thành công', productWithStats);
  } catch (error) {
    return responseHandler(res, 500, 'lỗi', null, error.message);
  }
};

const list = async (req, res, next) => {
  var msg = '';
  let data = [];

  try {
    data = await mProduct.find().populate('categorysId').sort({ _id: 1 });

    if (!data || data.length == 0) {
      msg = 'Không tìm thấy dữ liệu';
      res.render('product/list', { msg: msg, data: data });
    }

    msg = `có dữ liệu sản phẩm, số lượng : ${data.length}`;

    res.render('product/list', { msg: msg, data: data });
  } catch (error) {
    res.render('product/list', { msg: error, data: data });
  }
};
const add = async (req, res, next) => {
  let msg = '';
  const findCategory = await mCategory.find();
  console.log(1);

  if (req.method !== 'POST') {
    try {
      return res.render('product/add', { msg, type: findCategory });
    } catch (error) {
      return res.render('product/add', {
        msg: error.message,
        type: findCategory
      });
    }
  }
  console.log(1);

  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => file.path); // Lấy đường dẫn ảnh từ các tệp.
  }
  const {
    categorysId,
    description,
    sizes: rawSizes,
    name,
    price,
    // quantity,
    // discount,
    startDate,
    endDate
  } = req.body;

  let sizes = [];
  try {
    if (Array.isArray(rawSizes)) {
      // Khi nhiều size
      sizes = rawSizes.map(item => ({
        size: item.size,
        quantity: parseInt(item.quantity)
      })).filter(s => s.size && !isNaN(s.quantity));
    } else if (rawSizes?.size && rawSizes?.quantity) {
      // Khi chỉ có 1 size
      sizes.push({
        size: rawSizes.size,
        quantity: parseInt(rawSizes.quantity)
      });
    }
  } catch (err) {
    msg = 'Dữ liệu kích cỡ không hợp lệ';
    return res.render('product/add', { msg, type: findCategory });
  }


  let missingFields = [];
  // Kiểm tra từng trường và thêm thông báo lỗi nếu trường nào đó trống
  if (!name) missingFields.push('tên sản phẩm');
  if (!sizes) missingFields.push('kích cỡ');
  if (!categorysId) missingFields.push('thể loại');
  if (!description) missingFields.push('mô tả');
  if (!price) missingFields.push('giá bán');
  // if (!quantity) missingFields.push('số lượng');

  if (missingFields.length > 0) {
    // Tạo thông báo lỗi chi tiết
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`); // Ghi log chi tiết
    return res.render('product/add', { msg, type: findCategory });
  }

  // Chuyển đổi chuỗi ngày thành đối tượng Date để kiểm tra
  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Kiểm tra logic ngày
  if (start < currentDate) {
    const msg = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại.';
    return res.render('product/add', { msg, type: findCategory });
  }

  if (start > end) {
    const msg = 'Ngày bắt đầu không được lớn hơn ngày kết thúc.';
    return res.render('product/add', { msg, type: findCategory });
  }

  //==
  console.log(1);
  console.log("🚀 ~ add ~ sizes:", sizes)

  try {
    const objProduct = new mProduct({
      name,
      categorysId,
      description,
      sizes,
      price,
      // discount,
      // quantity,
      image: images,
      startDate,
      endDate
    });
    console.log(1);

    await objProduct.save();
    msg = 'Đã thêm sản phẩm thành công';
    console.log(1);
  } catch (error) {
    console.log(error.message);
    msg = `Lỗi: ${error.message}`;
  }
  console.log(1);

  return res.render('product/add', { msg, type: findCategory });
};
const edit = async (req, res, next) => {
  const productid = req.params.id;
  let msg = '';

  const findCategory = await mCategory.find();

  try {
    var product = await mProduct.findById(productid);
    msg = `Đang chỉnh sửa sản phẩm : ${product.name}`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('product/edit', { msg, type: findCategory });
  }

  if (req.method !== 'POST') {
    return res.render('product/edit', {
      msg,
      product: product,
      type: findCategory
    });
  }
  // Xử lý mảng ảnh được tải lên
  let images = product.image; // Bắt đầu với ảnh hiện tại
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => file.path); // Cập nhật với ảnh mới
  }
  const {
    categorysId,
    description,
    sizes: rawSizes,
    name,
    price,
    // quantity,
    // discount,
    startDate,
    endDate
  } = req.body;

  let sizes = [];
  try {
    if (Array.isArray(rawSizes)) {
      // Khi nhiều size
      sizes = rawSizes.map(item => ({
        size: item.size,
        quantity: parseInt(item.quantity)
      })).filter(s => s.size && !isNaN(s.quantity));
    } else if (rawSizes?.size && rawSizes?.quantity) {
      // Khi chỉ có 1 size
      sizes.push({
        size: rawSizes.size,
        quantity: parseInt(rawSizes.quantity)
      });
    }
  } catch (err) {
    msg = 'Dữ liệu kích cỡ không hợp lệ';
    return res.render('product/add', { msg, type: findCategory });
  }


  let missingFields = [];
  if (!name) missingFields.push('tên sản phẩm');
  if (!sizes) missingFields.push('kích cỡ');
  if (!categorysId) missingFields.push('thể loại');
  if (!description) missingFields.push('mô tả');
  if (!price) missingFields.push('giá bán');
  // if (!quantity) missingFields.push('số lượng');

  if (missingFields.length > 0) {
    msg = `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`;
    console.log(`Missing fields: ${missingFields.join(', ')}`);
    return res.render('product/edit', { msg, type: findCategory });
  }

  // Chuyển đổi chuỗi ngày thành đối tượng Date để kiểm tra
  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Kiểm tra logic ngày
  if (start < currentDate) {
    const msg = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại.';
    return res.render('product/add', { msg, type: findCategory });
  }

  if (start > end) {
    const msg = 'Ngày bắt đầu không được lớn hơn ngày kết thúc.';
    return res.render('product/add', { msg, type: findCategory });
  }

  // console.log(discount);
  console.log(price);

  try {
    const updateProduct = await mProduct.findByIdAndUpdate(
      productid,
      {
        name,
        categorysId,
        description,
        sizes,
        price,
        // discount,
        // quantity,
        image: images,
        startDate,
        endDate
      },
      { new: true }
    );

    if (!updateProduct) {
      msg = `Không tìm thấy sản phẩm`;
      return res.render('product/edit', {
        msg,
        product: product,
        type: findCategory
      });
    }

    msg = 'Cập nhật sản phẩm thành công';
    product = updateProduct;
  } catch (error) {
    msg = `Lỗi: ${error.message}`;
  }

  res.render('product/edit', {
    msg: msg,
    product: product,
    type: findCategory
  });
};
const del = async (req, res, next) => {
  const product = req.params.id;
  let msg = '';

  try {
    var dataProduct = await mProduct.findById(product);


    if (!dataProduct) {
      msg = `Không tìm thấy sản phẩm`;
      return res.render('product/del', { msg, status: 0 });
    }
    msg = `${dataProduct.name} sản phẩm đang được chọn để xóa`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('product/del', { msg, status: 0 });
  }

  if (req.method !== 'POST') {
    return res.render('product/del', { msg, status: 0 });
  }

  try {
    const deletedProduct = await mProduct.findByIdAndDelete(product);

    if (deletedProduct) {
      await mCart.deleteMany({ productId: deletedProduct._id });
    }
    msg = 'xóa sản phẩm thành công';
  } catch (error) {
    console.error(error);
    msg = `Lỗi : ${error.message}`;
  }

  res.render('product/del', { msg, status: 1 });
};
const detail = async (req, res, next) => {
  const productId = req.params.id;
  let msg = '';

  try {
    var dataProduct = await mProduct
      .findById(productId)
      .populate('categorysId');

    if (!dataProduct) {
      msg = `Không tìm thấy sản phẩm`;
      return res.render('product/detail', { msg });
    }

    msg = `Đang xem chi tiết sản phẩm : ${dataProduct.name}`;
  } catch (error) {
    msg = `Lỗi : ${error.message}`;
    return res.render('product/detail', { msg });
  }

  res.render('product/detail', { msg: msg, product: dataProduct });
};

module.exports = {
  getAll,
  getById,
  //admin
  list,
  add,
  edit,
  del,
  detail
};
