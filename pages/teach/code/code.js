//获取应用实例
const app = getApp();
var common = require('../../../utils/common.js');
var http = require('../../../utils/http.js');

Page({
  data: {
    name: '',
    codeImg: '../../../images/erweima.png',
    showPopup: 'code-show', //code页面
    showLose: 'code-hide',
    showFalse: 'code-hide',
    showSuccess: 'code-hide',
    tis: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //二维码5分钟失效
    //轮询
    let that = this;
    let params = {
      'scheduleDetailId': options.scheduleDetailId,
      "time": options.time,
      "userId": options.userId
    }
    http.postReq(app.globalData.config.REQUEST_URL_BUSINESS + '/applets/teacher/scanedResult', params, function (res) {
      if (res.code == 0) { //扫二维码成功
        that.setData({
          showFalse: 'code-hide',
          showSuccess: 'code-show',
          layerHidden: true,
          layerIcon: 'success',
          layerMsg: '扫码已成功',
          layerTipsMsg: '5s后自动返回',
          layerBtnText: '返回首页'
        });
        setTimeout(function () {
          wx.navigateTo({
            url: '../home/home',
          });
        }, 5000)

      } else if (res.code == 102) { //二维码过期
        wx.navigateTo({
          url: '../codeinvalid/codeinvalid?userId=' + options.userId + '&time=' + options.time + '&scheduleDetailId=' + options.scheduleDetailId,
        });
      } else if (res.code == 100) { //二维码待扫

      } else if (res.code == 109) { //课程生成的二维码已签到
        that.setData({
          showFalse: 'code-show',
          showLose: 'code-hide',
          layerHidden: true,
          layerIcon: 'warn',
          layerMsg: res.msg,
          layerBtnText: '重新选择'
        });
      } else {
        that.setData({
          showFalse: 'code-show',
          showLose: 'code-hide',
          layerHidden: true,
          layerIcon: 'warn',
          layerMsg: '选择错误，请重新选择',
          layerBtnText: '重新选择'
        });
      }
    })
    
    var tis = setInterval(function() {

      http.postReq(app.globalData.config.REQUEST_URL_BUSINESS + '/applets/teacher/scanedResult', params, function (res) {
        if (res.code == 0) { //扫二维码成功
          clearTimeout(tis);
          that.setData({
            showFalse: 'code-hide',
            showSuccess: 'code-show',
            layerHidden: true,
            layerIcon: 'success',
            layerMsg: '扫码已成功',
            layerTipsMsg: '5s后自动返回',
            layerBtnText: '返回首页'
          });
          setTimeout(function () {
            wx.navigateTo({
              url: '../home/home',
            });
          }, 5000)

        } else if (res.code == 102) { //二维码过期
          clearTimeout(tis);
          wx.navigateTo({
            url: '../codeinvalid/codeinvalid?userId=' + options.userId + '&time=' + options.time + '&scheduleDetailId=' + options.scheduleDetailId,
          });
        } else if (res.code == 100) { //二维码待扫

        } else if (res.code == 109) { //课程生成的二维码已签到
          clearTimeout(tis);
          that.setData({
            showFalse: 'code-show',
            showLose: 'code-hide',
            layerHidden: true,
            layerIcon: 'warn',
            layerMsg: res.msg,
            layerBtnText: '重新选择'
          });
        } else {
          clearTimeout(tis);
          that.setData({
            showFalse: 'code-show',
            showLose: 'code-hide',
            layerHidden: true,
            layerIcon: 'warn',
            layerMsg: '选择错误，请重新选择',
            layerBtnText: '重新选择'
          });
        }
      })
    }, 3000);

    this.setData({
      'codeImg': options.imgdata,
      'name': options.name + '的二维码',
      'tis': tis,
    });

  },
  //退出页面清除定时器
  onUnload: function() {
    clearTimeout(this.data.tis);
  },
  bindLayerSuc: common.throttle(function() {
    wx.navigateTo({
      url: '../home/home',
    });
  }),
  bindLayer: common.throttle(function() {
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
      'path': '/pages/teach/code/code',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
})