const User = require('../models/user.model');
const mProduct = require('../models/product.model');
const mUser = require('../models/user.model');
const mCart = require('../models/cart.model');
const mOrder = require('../models/order.model');
const mongoose = require('mongoose');
var moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const { renderLoginError } = require('../utils/responseHandler');

const bashboard = async (req, res, next) => {
  let dieu_kien_loc = {};

  // var bills = await mOrder.find(dieu_kien_loc)
  //     .populate('userId')
  //     .populate('user_data')
  //     .populate({
  //         path: 'cart_data',
  //         populate: {
  //             path: 'product_id',
  //             populate: [
  //                 { path: 'product_data' },
  //                 { path: 'size_id' },
  //                 { path: 'color_id' }
  //             ]
  //         }
  //     })
  //     .sort({ createdAt: -1 });

  //====
  // Doanh Thu Hôm Nay

  try {
    // Lấy ngày hiện tại
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Lấy ngày kết thúc của ngày hiện tại
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    // hôm nay
    const startOfTodayVietnam = moment().startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
    const endOfTodayVietnam = moment(endOfToday).add(7, 'hours').tz('Asia/Ho_Chi_Minh').toDate();
    // hôm qua
    const startOfYesterdayVietnam = moment().subtract(1, 'days').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
    const endOfYesterdayVietnam = moment().subtract(1, 'days').endOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();

    // status bill được cho là thành công
    var mBillSatus = ['Delivered'];

    // 111111111111
    // Tìm tổng tiền của mOrder trong khoảng thời gian từ đầu ngày đến cuối ngày hiện tại
    const totalAmountAggregate_day = await mOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfTodayVietnam,
            $lt: endOfTodayVietnam
          },
          status: {
            $in: mBillSatus
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    // Lấy tổng tiền từ kết quả aggregate (nếu có)
    // Tìm tổng tiền của mOrder trong khoảng thời gian từ đầu ngày đến cuối ngày hôm qua
    const totalAmountAggregate_yesterday = await mOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYesterdayVietnam,
            $lt: endOfYesterdayVietnam
          },
          status: {
            $in: mBillSatus
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalAmount_day = totalAmountAggregate_day.length > 0 ? totalAmountAggregate_day[0].total : 0;
    const totalAmount_yesterday = totalAmountAggregate_yesterday.length > 0 ? totalAmountAggregate_yesterday[0].total : 0;



    // 222222222222222222222
    // tính tổng người mua hàng hôm nay 
    // Tìm tổng số người mua hàng trong khoảng thời gian từ đầu ngày đến cuối ngày hôm nay
    const totalBuyersAggregate_day = await mOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfTodayVietnam,
            $lt: endOfTodayVietnam
          }
        }
      },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalBuyers: { $sum: 1 }
        }
      }
    ]);
    const totalBuyersAggregate_yesterday = await mOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYesterdayVietnam,
            $lt: endOfYesterdayVietnam
          }
        }
      },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalBuyers: { $sum: 1 }
        }
      }
    ]);

    // Lấy tổng số người mua hàng từ kết quả aggregate của hôm nay (nếu có)
    const totalBuyers_day = totalBuyersAggregate_day.length > 0 ? totalBuyersAggregate_day[0].totalBuyers : 0;
    const totalBuyers_yesterday = totalBuyersAggregate_yesterday.length > 0 ? totalBuyersAggregate_yesterday[0].totalBuyers : 0;



    // 33333333333333
    const totalUsersAggregate = await mUser.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 }
        }
      }
    ]);
    // Lấy tổng số người dùng có role "User" từ kết quả aggregate
    const totalUsersWithRoleUser = totalUsersAggregate.length > 0 ? totalUsersAggregate[0].totalUsers : 0;
    //====
    const totalCartsAggregate = await mCart.aggregate([
      {
        $match: {

        }
      },
      {
        $group: {
          _id: null,
          totalCarts: { $sum: 1 }
        }
      }
    ]);
    const totalCart = totalCartsAggregate.length > 0 ? totalCartsAggregate[0].totalCarts : 0;
    //====


    // 4444444444444444444444
    // Tính tổng tiền all hóa đơn
    const totalAmountAggregate = await mOrder.aggregate([
      {
        $match: {
          status: {
            $in: mBillSatus
          }
        }

      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalAmount = totalAmountAggregate.length > 0 ? totalAmountAggregate[0].total : 0;
    //====
    const totalQuantityAggregate = await mProduct.aggregate([
      {
        $group: {
          _id: null,
          totalQ: { $sum: "$quantity" }
        }
      }
    ]);
    const totalQuantity = totalQuantityAggregate.length > 0 ? totalQuantityAggregate[0].totalQ : 0;



    // chart chart ================= 1111111
    const m7daysAgoVietnam = moment().subtract(7, 'days').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
    const m9daysAgoVietnam = moment().subtract(9, 'days').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
    const m1YearAgoVietnam = moment().subtract(1, 'year').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
    // người dùng được tạo trong 7 ngày gần nhất 

    // Tìm số lượng người dùng được tạo trong mỗi ngày cho 7 ngày gần nhất
    //================
    const userCreationCountAggregate = await mUser.aggregate([
      {
        $match: {
          createdAt: {
            $gte: m7daysAgoVietnam,
            $lt: endOfTodayVietnam
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Ho_Chi_Minh"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);
    // Tạo mảng dữ liệu cho 7 ngày gần nhất
    const TotalUserDataGeneratedFor7Days = [];
    const currentDate = moment(startOfTodayVietnam);
    for (let i = 0; i < 7; i++) {
      const formattedDate = currentDate.format("YYYY-MM-DD");
      const foundItem = userCreationCountAggregate.find(item => item._id === formattedDate);
      const count = foundItem ? foundItem.count : 0;
      TotalUserDataGeneratedFor7Days.push(count);
      currentDate.subtract(1, 'days');
    }
    //==== lấy ng dùng được tạo gần nhất
    const latestUser = await mUser
      .findOne({})
      .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo createdAt
      .select('name createdAt'); // Chọn trường username và createdAt


    // chart chart ================= 22222222222
    const totalAmountAggregate10day = await mOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: m9daysAgoVietnam,
            $lt: endOfTodayVietnam
          },
          status: {
            $in: mBillSatus
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    // Tạo mảng dữ liệu cho 10 ngày gần nhất
    const data10dayAmountBill = [];
    const currentDate10 = moment(startOfTodayVietnam);
    for (let i = 0; i < 10; i++) {
      const formattedDate = currentDate10.format("YYYY-MM-DD");
      const foundItem = totalAmountAggregate10day.find(item => item._id === formattedDate);
      const count = foundItem ? foundItem.totalAmount : 0;
      data10dayAmountBill.push(count);
      currentDate10.subtract(1, 'days');
    }




    // chart chart ================= 33333333333
    // thông tin doanh thu của 12 tháng gần nhất
    const totalAmountAggregate12Month = await mOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: m1YearAgoVietnam,
            $lt: endOfTodayVietnam
          },
          status: {
            $in: mBillSatus
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt"
            }
          },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    // Tạo mảng dữ liệu cho 12 tháng gần nhất
    const data12monthAmountBill = [];
    const currentDate12 = moment().startOf('month').tz('Asia/Ho_Chi_Minh').add(7, 'hours');

    for (let i = 0; i < 12; i++) {
      const formattedMonth = currentDate12.format("YYYY-MM");
      const foundItem = totalAmountAggregate12Month.find(item => item._id === formattedMonth);
      const count = foundItem ? foundItem.totalAmount : 0;
      data12monthAmountBill.push(count);
      currentDate12.subtract(1, 'months');
    }



    // ==============Tổng quan về đơn hàng======

    // lấy thông tin giỏ hàng mới nhất
    const latestCart = await mCart
      .findOne({})
      .sort({ createdAt: -1 })
      .select('createdAt userId productId')
      .populate([
        {
          path: 'userId',
          select: 'name' // Chọn chỉ trường 'username'
        },
        {
          path: 'productId',
          select: 'name'
        }
      ]);

    const mUserNameCart = latestCart?.userId?.name;
    const mCreatedAtCart = latestCart?.createdAt;

    const mProductNameCart = latestCart?.productId?.name;
    // lấy thông tin đơn hàng mới nhất
    const latestBill = await mOrder
      .findOne({})
      .sort({ createdAt: -1 })
      .select('createdAt')
      .populate([
        {
          path: 'userId',
          select: 'name'
        }
      ]);



    //=====


    // //=========
    console.log("========================");

    console.log("Tổng số người mua hàng trong ngày hôm nay:", totalBuyers_day);
    console.log("Tổng số người mua hàng trong ngày hôm qua:", totalBuyers_yesterday);
    console.log("Tổng tiền trong ngày hôm nay:", totalAmount_day);
    console.log("ngày bắt đầu việt nam", startOfTodayVietnam);
    console.log("ngày kết thúc việt nam", endOfTodayVietnam);
    console.log("========================");
    console.log("Tổng tiền trong ngày hôm qua:", totalAmount_yesterday);
    console.log("ngày bắt đầu việt nam hôm qua", startOfYesterdayVietnam);
    console.log("ngày kết thúc việt nam hôm qua", endOfYesterdayVietnam);
    console.log("========================");
    console.log("hơn người dùng ngày hôm qua", totalBuyers_yesterday - totalBuyers_day);
    console.log("hơn doanh thu ngày hôm qua", totalAmount_day - totalAmount_yesterday);
    console.log("========================");
    console.log("Số người dùng có role là User", totalUsersWithRoleUser);
    console.log("Tổng số cart", totalCart);
    console.log("Tổng số quantity có trong kho", totalQuantity);
    // chart  
    console.log("7 ngày trước ", m7daysAgoVietnam);
    console.log("9 ngày trước ", m9daysAgoVietnam);
    console.log("1 năm trước ", m1YearAgoVietnam);
    console.log("Số lượng người dùng được tạo trong 7 ngày gần nhất:", userCreationCountAggregate);
    console.log("Số lượng người dùng được tạo trong 7 ngày gần nhất:", TotalUserDataGeneratedFor7Days);
    console.log("Số lượng doanh thu của 10 ngày gần nhất:", totalAmountAggregate10day);
    console.log("Số lượng doanh thu của 10 ngày gần nhất:", data10dayAmountBill);
    console.log("Số lượng doanh thu của 12 tháng gần nhất:", totalAmountAggregate12Month);
    console.log("Số lượng doanh thu của 12 tháng gần nhất:", data12monthAmountBill);

    // tong quan
    console.log("Thông tin của người dùng được tạo gần nhất:", latestUser);
    console.log("Thông tin của đơn hàng được tạo gần nhất:", latestBill);
    console.log("Thông tin của giỏ hàng được tạo gần nhất name user:", mProductNameCart);
    console.log("Thông tin của giỏ hàng được tạo gần nhất name product:", mUserNameCart);
    console.log("Thông tin của giỏ hàng được tạo gần nhất createdAt cart:", mCreatedAtCart);




    //====

    res.render('home/index2', {
      totalAmount_day: totalAmount_day,
      totalBuyers_day: totalBuyers_day,
      than_yesterdaytotalAmount: totalAmount_day - totalAmount_yesterday,
      than_yesterdaytotalBuyers: totalBuyers_day - totalBuyers_yesterday,
      totalCart: totalCart,
      totalUsersWithRoleUser: totalUsersWithRoleUser,
      totalQuantity: totalQuantity,
      TotalUserDataGeneratedFor7Days: TotalUserDataGeneratedFor7Days,//ARRAY
      TotaData10DayAmountBill: data10dayAmountBill,//ARRAY
      data12monthAmountBill: data12monthAmountBill,//ARRAY
      latestUser: latestUser,
      latestBill: latestBill,
      mProductNameCart: mProductNameCart,
      mUserNameCart: mUserNameCart,
      mCreatedAtCart: mCreatedAtCart,
      moment: moment,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error("Lỗi :", error);
    next(error);
  }
}


// const bashboard = async (req, res, next) => {
//   res.render('home/index', {});
// };

const login = async (req, res, next) => {
  if (req.method !== 'POST') {
    return res.render('login/login', { msg: '' });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return renderLoginError(res, 'Tài khoản hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return renderLoginError(res, 'Tài khoản hoặc mật khẩu không chính xác 2');
    }

    if (!user.is_admin) {
      return renderLoginError(res, 'Tài khoản không được quyền đăng nhập');
    }

    req.session.userLogin = user;
    res.locals.user = user;
    return res.redirect('/');
  } catch (error) {
    return renderLoginError(res, error.message);
  }
};

const logout = (req, res, next) => {
  try {
    if (req.session.userLogin) {
      delete req.session.userLogin;
    }

    if (res.locals.user) {
      delete res.locals.user;
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Lỗi khi hủy session:', err);
      }

      res.redirect('/r/login');
    });
  } catch (error) {
    console.error('Lỗi trong quá trình đăng xuất:', error);
    res.status(500).send('Đã xảy ra lỗi trong quá trình đăng xuất');
  }
};

module.exports = {
  login,
  logout,
  bashboard
};
