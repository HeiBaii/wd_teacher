//index.js
//获取应用实例
const app = getApp()
var common = require('../../utils/common.js');

Page({
  data: {
    avatar: '../../images/nipic_jw.png',
    CellPhoneNumber: '',
    identity: '',
    name: '',
    canSelectRole:false,
    isShowShade:true,
  },

  //分享
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/personal/personal',
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {
        console.log(res)
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user = wx.getStorageSync('userInfo') || {}; //用户信息的存储信息
    if (JSON.stringify(user) == '{}') { // 将object 对象转换为 JSON 字符串，并返回该字符串
      wx.navigateTo({
        url: '../../login/login',
      })
    } else {
      if (user.sex == 1) {
        this.setData({
          avatar: '../../images/tea_pic.png'
        })
      }
      this.setData({
        identity: (wx.getStorageSync("userSelectedRole") == 'teacher')?'教师':'教务', //调用存储的职位信息
        CellPhoneNumber: user.phone, //调用存储的手机号信息
        name: user.name, //调用存储的名字信息,
        canSelectRole: wx.getStorageSync("roleS"),
      })
    }
  },
  onShow: function() {
    app.hasToken();
  },
  bindChangePassword: common.throttle(function() {
    wx.navigateTo({
      url: '../password/password',
    });
  }),
  quit: common.throttle(function() {
    wx.clearStorageSync();
    wx.navigateTo({
      url: '../login/login',
    });
  }),
  tabSelect: common.throttle(function () {
    this.setData({
      isShowShade:false,
    })
  }),
  //弹窗角色选择跳转
  goJS: common.throttle(function () {
    wx.setStorageSync('userSelectedRole', 'teacher')
    wx.reLaunch({
      url: '/pages/teach/home/home'
    });
  }),
  goJW: common.throttle(function () {
    wx.setStorageSync('userSelectedRole', 'teachservice')
    wx.reLaunch({
      url: '/pages/jiaowu/home/home'
    });
  }),
})