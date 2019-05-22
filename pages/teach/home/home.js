//index.js
//获取应用实例
const app = getApp()
var http = require('../../../utils/http.js');
var common = require('../../../utils/common.js');

Page({
  data: {
    teacher: '../../../images/nipic_jw.png',
    name: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userinfo = wx.getStorageSync('userInfo')
    this.setData({
      name: userinfo.name
    })
    if (userinfo.sex == 1) {
      this.setData({
        avatar: '../../images/tea_pic.png'
      })
    }
  },

  bindTeach: common.throttle(function() {
    wx.navigateTo({
      url: '../../personal/personal',
    });
  }),
  bindTeaHistory: common.throttle(function() {
    wx.navigateTo({
      url: '../history/history',
    });
  }),
  bindCourse: common.throttle(function () {
    wx.navigateTo({
      url: '../course/course',
    });
  }),
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/teach/home/home',
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {
        console.log(res)
      }
    }
  },
  bindSaoma: common.throttle(function() {
    let self = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: function(res) {
        console.log(res);
        if (self.isJSON(res.result)) {
          let content = JSON.parse(res.result);
          let userinfo = wx.getStorageSync('userInfo');
          if (content.scheduleDetailId) {
            //课程二维码
            http.postReq('/applets/teacher/scanScheduleResult', {
              'scheduleDetailId': content.scheduleDetailId,
              'userId': userinfo.id
            }, function(data) {
              console.log(data);
              if(data.code == 0){
                self.setData({
                  is_success: true,
                  successTxt: (data.code == 0) ? data.data : data.msg,
                })
              }else{
                self.resultTips(data.code, data.msg);
              }
              self.playRingTips('data/' + data.code + '.mp3');
            });
          } else if (content.classId) {
            //班级二维码
            http.postReq('/applets/teacher/scanClassResult', {
              'classId': content.classId,
              'userId': userinfo.id
            }, function(data) {
              console.log(data);
              if (data.code == 0) {
                self.setData({
                  is_success: true,
                  successTxt: (data.code == 0) ? data.data : data.msg,
                })
              } else {
                self.resultTips(data.code, data.msg);
              }
              self.playRingTips('data/' + data.code + '.mp3');
            });
          } else {
            self.playRingTips('data/' + 102 + '.mp3');
            self.resultTips(102, '二维码错误B');
          }
        }else{
          self.playRingTips('data/' + 102 + '.mp3');
          self.resultTips(102, '二维码错误A');
        }
      },
      fail: function(err) {
        console.log(err);
      }
    })
  }),
  resultTips: function (code, msg) {
    let that = this,
      text = "确定";
    that.setData({
      is_success: false,
      layerHidden: true,
      layerIcon: 'warn',
      layerMsg: msg,
      layerBtnText: text,
      btn_event_name: 'ModalOk',
      successTxt: ""
    });
  },
  ModalOk:function(){
    this.setData({
      layerHidden: false,
      is_success: false,
    })
  },
  playRingTips(path) {
    let self = this;
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        self.audio.src = path;
        self.audio.play();
        self.audio.onEnded(() => {
          resolve(true)
        })
      }, 600)
    })
  },
  onReady() {
    this.audio = wx.createInnerAudioContext('saoma');
    console.log(this.audio);
    this.audio.onPlay(() => {
      console.log('开始播放');
    });
    this.audio.onStop(() => {
      console.log('播放结束');
    });
    this.audio.onCanplay(() => {
      console.log('可以播放了');
    });
    this.audio.onEnded(() => {
      console.log('播放结束');
    });
    this.audio.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
  },
  isJSON(str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }

      } catch (e) {
        console.log('error：' + str + '!!!' + e);
        return false;
      }
    }
    console.log('It is not a string!')
  }
})