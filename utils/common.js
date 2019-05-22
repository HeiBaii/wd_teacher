//电话号码检测
function checkPhone(phone) {
  //手机号正则
  var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
  //电话
  if (!phoneReg.test(phone)) {
    //alert('请输入有效的手机号码！');
    return false;
  }
  return true;
}

//字符串检测 0-9a-zA-Z ?$!@#*~%&=-+
function checkString(str){
  //var reg = /^[\w\?\$!@#*~%&=\-\+_]{6,18}$/;
  //已字母开头,长度在6-18之间,只能包含字符,数字
  var reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,18}$/;
 
  if(reg.test(str)){
    return true
  }
  return false
}

//数组对象排序
function compare(prop) {
  return function (obj1, obj2) {
    var val1 = obj1[prop];
    var val2 = obj2[prop];
    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1);
      val2 = Number(val2);
    }
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  }
}

//时间转换 2018-09-05 转换成 9月5日 周三
function dateToDate(ymd){
  let weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  let arr = ymd.split('-');
  let choose_date = new Date(ymd.replace('/', '-'));
  let date_and_weekend = Number(arr[1]) + '月' + Number(arr[2]) + '日' + ' ' + weekday[choose_date.getDay()];
  return date_and_weekend;
}

const ymd = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getPageStack() {
  let page = getCurrentPages();
  let stack = [];
  for (var i = 1; i < page.length; i++) {
    stack.push(page[i].data.where);
  }
  console.log(stack);
}

//防止按钮被多次点击
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)   //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}

module.exports={
  checkPhone: checkPhone,
  checkString: checkString,
  compare: compare,
  dateToDate: dateToDate,
  getPageStack: getPageStack,
  ymd: ymd,
  throttle: throttle,
}