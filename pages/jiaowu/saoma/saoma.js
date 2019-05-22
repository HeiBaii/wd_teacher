// pages/jiaowu/saoma/saoma.js
var http = require('../../../utils/http.js');
var common = require('../../../utils/common.js');
const app = getApp();

Page({

  data: {
    where: '扫码',
    //弹窗按钮的事件名称
    btn_event_name: '',
    //考勤成功文字提示标志
    is_success: false,
    schoolId: 0,
    placeId: 0,
    courseId: 0,
    data:{},
    //1=>签到 2=>发书  3=>签到+发书
    status:0,
    successTxt:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      schoolId: options.schoolId,
      placeId: options.placeId,
      data: JSON.parse(options.data),
      status:options.status,
    });
    
    this.audio = wx.createInnerAudioContext();
    this.audio.onPlay(() => {
      console.log('开始播放');
    });
    this.audio.onStop(() => {
      console.log('播放结束');
    });
    this.audio.onCanplay(() => {
      console.log('可以播放了');
    });
    this.audio.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    })
  },
  
  //分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/jiaowu/saoma/saoma',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },

  onShow: function(e) {
    app.hasToken();
  },

  onReady: function(e) {
    let that = this;
    setTimeout(function(){
      that.scan();
    },500);
  },

  //主要用来清楚定时器
  onHide:function(e){
    // let that = this
    // clearTimeout(that.timeout.success);
    // clearTimeout(that.timeout.interfaceFail);
    // clearTimeout(that.timeout.nativeFail);
  },
  //扫码签到
  scan: function () {
    let that = this;
    let res_data = '';
    that.scanCode().then(function (data) {
      return that.scanRequstHttp(JSON.parse(data))
    }).then(function (data) {
      //语音提示
      res_data = data;
      if (data.code == 1) {
        app.toast('网络错误');
        that.setData({
          is_success: true
        })
        return true
      }else{
        let path = String("data/" + data.code + ".mp3");
        return that.playRingTips(path)
      }
    }).then(function (data) {
      //文字提示
      if ((res_data.code == 0) || (res_data.code == 101) || (res_data.code == 110)) {
        //考勤成功提示音
        that.setData({
          is_success: true,
          successTxt: (res_data.code == 0) ? res_data.data : res_data.msg,
        })

      } else {
        //错误文字提示
        that.resultTips(res_data.code, res_data.msg);
      }
      if (that.data.is_success) {
        return that.scan()
      }
    }).catch(function (error) {
      if (error == "cancle_scan") {
        console.log("cancle scan")
      } else {
        that.resultTips(102, "二维码错误");
        let path = String("data/102.mp3");
        that.playRingTips(path)
      }
    })
  },

  scanCode: function(e) {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.scanCode({
        onlyFromCamera: true,
        success: function(res) {
          resolve(res.result)
        },
        fail: function() {
          reject("cancle_scan");
        }
      });
    })
  },

  scanRequstHttp: function(data) {
    let that = this;
    return new Promise((resolve, reject) => {
      //教师
      if (data.type == 1) {
        let info = that.data.data;
        if (info.scheduleDetailId != data.scheduleDetailId){
          resolve({"code":104,"msg":"选课错误,请重新选择"});
          return
        }
        let req_data = {
          teacherId: info.teacherId,
          courseId: info.courseId,
          courseName: info.courseName,
          time: data.currentTime,
          schoolId: info.schoolId,
          schoolName: info.schoolName,
          teachingPointId: info.teachingPointId,
          teachingPointName: info.teachingPointName,
          yearMonthDay: info.yearMonthDay,
          startTime: info.startTime,
          endTime: info.endTime,
          scheduleDetailId: info.scheduleDetailId,
        }
        http.postReq('/applets/acdemic/scanTeacherQrcode', req_data, function(res) {
          resolve(res)
        });
      } else if (data.type == 0) {
        //学生(发书/签到)
        if ((that.data.status == 1) || (that.data.status == '1')){
          //签到
          let info = that.data.data;
          let req_data = {
            customerId: data.customerId,
            teacherId: info.teacherId,
            courseId: info.courseId,
            courseName: info.courseName,
            time: data.currentTime,
            schoolId: info.schoolId,
            schoolName: info.schoolName,
            teachingPointId: info.teachingPointId,
            teachingPointName: info.teachingPointName,
            yearMonthDay: info.yearMonthDay,
            startTime: info.startTime,
            endTime: info.endTime,
            scheduleDetailId: info.scheduleDetailId,
          }
          http.postReq('/applets/acdemic/scanClassStudentQrcode', req_data, function (res) {
            resolve(res)
          });
        } else if ((that.data.status == 2) || (that.data.status == '2')){
          //发书
          let info = that.data.data;
          let req_data = {
            customerId: data.customerId,
            grantPlanId: info.grantPlanId,
            time:data.currentTime,
          };
          http.postReq('/applets/acdemic/scanBookStudentQrcode', req_data, function (res) {
            resolve(res)
          });
        } else if ((that.data.status == 3) || (that.data.status == '3') ){
          //发书+签到
          let info = that.data.data;
          let req_data = {
            customerId: data.customerId,
            teacherId: info.teacherId,
            courseId: info.courseId,
            courseName: info.courseName,
            time: data.currentTime,
            schoolId: info.schoolId,
            schoolName: info.schoolName,
            teachingPointId: info.teachingPointId,
            teachingPointName: info.teachingPointName,
            yearMonthDay: info.yearMonthDay,
            startTime: info.startTime,
            endTime: info.endTime,
            scheduleDetailId: info.scheduleDetailId,
            grantPlanId: info.grantPlanId,
          }
          http.postReq('/applets/acdemic/classAndSendBook', req_data, function (res) {
            resolve(res)
          });
        }else{
          reject("unknow status")
        }
      } else {
        reject(false)
      }
    })
  },
  resultTips:function(code,msg){
    let that = this,
      text = "确定",
      event = "bindReScan";
    if(code == 104){
      text = '确定';
      event = "bindBackToCourse";
    }
    that.setData({
      is_success: false,
      layerHidden: true,
      layerIcon: 'warn',
      layerMsg: msg,
      layerBtnText: text,
      btn_event_name: event,
      successTxt: ""
    });
  },
  
  //提示音播放
  playRingTips: function (path){
    let that = this;
    return new Promise((resolve, reject)=>{
      setTimeout(function(){
        that.audio.src = path;
        that.audio.play();
        that.audio.onEnded(() => {
          resolve(true)
        })
      },600)
    })
  },

  //重新扫码事件
  bindReScan: function(e) {
    this.setData({
      layerHidden: false,
      is_success: false,
    })
    this.scan();
  },

  //返回选课页面事件
  bindBackToCourse: function(e) {
    this.setData({
      layerHidden: false,
      is_success: false,
    })
    wx.navigateBack({
      delta: 1,
    })
  },
})