const responseHandler = (
  res, // response object
  statusCode, // trạng thái status code
  message = null, // lời nhắn
  data = null, // dữ liệu
  error = null, // lỗi nếu có
  dataKey = 'data' // tên key chứa dữ liệu
) => {
  const success = statusCode >= 200 && statusCode < 300 ? true : false;
  const responseData = {
    success,
    message,
    error
  };

  if (data) {
    responseData[dataKey] = data;
  }

  res.status(200).json(responseData);
};
const renderLoginError = (res, message) => {
  return res.render('login/login', { msg: message });
};
module.exports = {
  responseHandler,
  renderLoginError
};
