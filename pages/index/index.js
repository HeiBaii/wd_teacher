//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    avatar: '../../images/user.png',
    isShowPassword: false,
    clearPhone: 'clear-icon',
    clearPassword: 'clear-icon',
    changeDisplay: 'none',
    telphone: '',
    password: '',
    loginBtn: 'btn'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  toggleShowPassword: function (e) {
    var isShowPassword = !this.data.isShowPassword;
    this.setData({
      isShowPassword: isShowPassword
    });
  },

  input: function (e) {
    let telLength = e.detail.value.length;

    console.log(telLength);
    if (telLength > 0) {
      this.setData({
        clearPhone: 'clear-icon-show',
      });
    }
  },
  deltelPhone: function (e) {
    this.setData({
      telphone: '',
      clearPhone: 'clear-icon'
    });
  },

  bindPassword: function (e) {
    let passwordLength = e.detail.value.length;
    if (passwordLength > 0) {
      this.setData({
        clearPassword: 'clear-icon-show',
        loginBtn: 'btn-login'
      });
    }
  },
  deltelPassword: function (e) {
    this.setData({
      password: '',
      clearPassword: 'clear-icon',
      loginBtn: 'btn'
    });
  },
  logbtn: function () {
    wx.navigateTo({
      url: '../personal/personal',
    });
  },

})
