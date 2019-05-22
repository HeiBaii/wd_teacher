//获取应用实例
const app = getApp()
var common = require('../../../utils/common.js');

Page({
  data: {
      codeImg: '../../../images/erweima.png',
      showPopup: 'code-show',
      showFalse: 'code-show',      
      showLose: 'code-hide',
      layerHidden: true,
      layerIcon:'warn',
      layerMsg:'选择错误，请重新选择',
      layerBtnText:'重新选择'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  bindLayerSuc: common.throttle(function () {
      wx.navigateTo({
        url: '../course/course',
      });
    }),
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/teach/codefail/codefail',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },

})
