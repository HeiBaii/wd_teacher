//app.js
const CONFIG = require('./utils/config.js')

App({
  onLaunch: function() {
    //本地存储config
    this.globalData.config = CONFIG
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    //获取设备型号
    let that = this;
    wx.getSystemInfo({
      success: res => {
        // console.log('手机信息res'+res.model)
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          that.globalData.isIphoneX = true
        }

      }
    })
  },
  globalData: {
    isIphoneX: false,
    userInfo: null,
    config: {},
    header: {
      'Accept': 'application/json',
      'appId': CONFIG.APP_ID
    },
  },
  toast: function(text) {
    wx.showToast({
      title: text,
      duration: 2000,
      icon: "none"
    })
  },
  goBack: function() {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      let prePage = pages[pages.length - 2];
      //关键在这里,这里面是触发上个界面
      prePage.onLoad(); // 执行前一个页面的onLoad方法
    }
    wx.navigateBack({});
  },
  hasToken:function(){
    let user = wx.getStorageSync('userInfo') || {};
    if (JSON.stringify(user) == '{}') {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
    return user
  },
});