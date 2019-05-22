var app = getApp();
var CONFIG = require('config.js');

var header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'appId': CONFIG.APP_ID,
  // 'version': CONFIG.VERSION,
}

function getReq(url, cb) {
  wx.showLoading({ title: '加载中', })
  let token = wx.getStorageSync('token') || '';
  header.Authorization = 'Barner ' + token;
  if ((url.substr(0,4) != "http")){
    url = CONFIG.REQUEST_URL_BUSINESS + url;
  }
  console.log(url + "  is: ")
  ajax(url, header, {}, "GET", cb);
}


function postReq(url, data, cb){
  wx.showLoading({ title: '加载中', })
  let token = wx.getStorageSync('token') || '';
  header.Authorization = 'Barner ' + token;
  if ((url.substr(0, 4) != "http")) {
    url = CONFIG.REQUEST_URL_BUSINESS + url;
  }
  console.log(url + " data is: ", data)
  ajax(url,header,data,"POST",cb);
}

function ajax(url,header,data,method,cb){
  wx.request({
    url: url,
    header: header,
    data: data,
    method: method,
    success: function (res) {
      console.log(url + " success res is: ", res)
      wx.hideLoading();
      let ret = {};
      if (res.statusCode == 200) {
        ret = res.data;
      } else {
        ret = { "code": 9998, "msg": res.data.message ? res.data.message : "服务器重启中!" }
      }
      return typeof cb == "function" && cb(ret)
    },
    fail: function (err) {
      wx.hideLoading();
      console.log(url + " fail res is: ", err)
      return typeof cb == "function" && cb({ "code": 9999, "msg": "网络错误!" })
    }
  })
}

module.exports = {
  getReq: getReq,
  postReq: postReq,
  header: header,
}