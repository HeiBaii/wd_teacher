//index.js
//获取应用实例
const app = getApp()
var common = require('../../../utils/common.js');

Page({
  data: {
    avatar: '../../../images/nipic_jw.png',
    name: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user = app.hasToken();
    if (user.sex == 1) {
      this.setData({
        avatar: '/images/tea_pic.png',
      })
    }
    this.setData({
      name: user.name
    })
  },
  onShareAppMessage: function (res) {
    return {
      'title': '文都伴学',
      'path': '/pages/jiaowu/home/home',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  onShow:function(){
    app.hasToken()
  },
  tapHome: common.throttle(function () {
    wx.navigateTo({
      url: '/pages/personal/personal',
    });
  }),
  tapScan: common.throttle(function () {
    wx.navigateTo({
      url: '/pages/jiaowu/select/select',
    });
  }),

  tapTeaHistory: common.throttle(function () {
    wx.navigateTo({
      url: '/pages/jiaowu/history/history',
    });
  }),

})
