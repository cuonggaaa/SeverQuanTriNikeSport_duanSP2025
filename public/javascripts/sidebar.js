let sidebar = document.querySelector('.sidebar');
let closeBtn = document.querySelector('#btn');
let searchBtn = document.querySelector('.bx-search');
let checkLogin = false;

closeBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  menuBtnChange(); //calling the function(optional)
});

// searchBtn.addEventListener("click", () => { // Sidebar open when you click on the search iocn
//   sidebar.classList.toggle("open");
//   menuBtnChange(); //calling the function(optional)
// });

// following are the code to change sidebar button(optional)
function menuBtnChange() {
  if (sidebar.classList.contains('open')) {
    closeBtn.classList.replace('bx-menu', 'bx-menu-alt-right'); //replacing the iocns class
  } else {
    closeBtn.classList.replace('bx-menu-alt-right', 'bx-menu'); //replacing the iocns class
  }
}

function login() {
  const username = document.getElementById('loginUserName').value;
  const password = document.getElementById('loginPassWord').value;
  if (username === 'admin' && password === '12345') {
    alert('Login successful!');
    checkLogin = true;
  } else {
    checkLogin = false;
  }
}

function personal() {
  const btnDangNhap = document.getElementById('btnDangNhap');
  const btnDangKi = document.getElementById('btnDangKi');
  const personal = document.getElementById('personal');

  if (checkLogin) {
    btnDangNhap.style.display = 'none';
    btnDangKi.style.display = 'none';
    personal.style.display = 'block';
  } else {
    btnDangNhap.style.display = 'block';
    btnDangKi.style.display = 'block';
    personal.style.display = 'none';
  }
}

function backPage() {
  history.back();
}

// Hàm chuyển định dạng ngày giờ
function formatDateTime(dateTimeString, timeZone = 'Asia/Ho_Chi_Minh') {
  return moment(dateTimeString).tz(timeZone).format('HH:mm - DD/MM/YYYY');
}

// Sử dụng biến formattedCreatedAt và formattedUpdatedAt trong template của bạn
