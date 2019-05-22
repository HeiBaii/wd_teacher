//获取应用实例
const app = getApp()
var common = require('../../../utils/common.js');
var http = require('../../../utils/http.js');

Page({
  data: {
    showPopup: 'code-hide',
    showSuccess:'code-hide',
    showFalse: 'code-hide',
    showLose: 'code-show',
    options:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options:options,
    });
  },
 
  betterCode: common.throttle(function () {
    let options = this.data.options;
    let params = {
      'scheduleDetailId': options.scheduleDetailId,
      "time": options.time,
      "userId": options.userId
    }
    http.postReq(app.globalData.config.REQUEST_URL_BUSINESS + '/applets/teacher/QRcodeGeneration', params, function (res) {
      if (res.code == 0) {
        //刷新生成二维码成功
        wx.navigateTo({
          url: '../code/code?imgdata=' + res.data.qrcode + '&userId=' + options.userId + '&time=' + res.data.time + '&name=' + res.data.name + '&scheduleDetailId=' + options.scheduleDetailId,
        });
      } else {
        //失败
        wx.navigateTo({
          url: '../codefail/codefail',
        });
      }
    })
  }),
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/teach/codeinvalid/codeinvalid',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  
})
