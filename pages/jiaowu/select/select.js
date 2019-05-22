//教务校区教学点选择页面
var app = getApp();
var http = require('../../../utils/http.js');
var common = require('../../../utils/common.js');
const SCHOOL_PLACE_DATA_KEY = "schoolAndPlaceData";
const SCHOOL_PLACE_DATA_KEY_EXPIRE = "schoolAndPlaceData_ExpireTime";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    schoolId: 0,
    curIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //iphone x 适配
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    })
  },
  //分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/jiaowu/select/select',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  onShow:function(e){
    app.hasToken();
    let that = this;
    //获取列表数据
    if(that.data.list.length <= 0){
      http.getReq('/timetable/getFieldList', function (res) {
        if (res) {
          if (res.code === 0) {
            that.setData({
              list: res.data[0].data,
              schoolId: res.data[0].data[0].id
            })
          } else {
            app.toast(res.msg);
          }
        } else {
          app.toast("网络错误")
        }
      });
    }
  },
  //选择学校
  tabSchool: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (that.data.schoolId === id) {
      return;
    } else {
      let index = e.currentTarget.dataset.index;
      that.setData({
        schoolId: id,
        curIndex: index,
      })
    }
  },
  //选择教学点
  tapPlace: common.throttle(function (e) {
    wx.navigateTo({
      url: '../schoolPoint/school?schoolId=' + this.data.schoolId + '&placeId=' + e.currentTarget.dataset.id + '&placeName=' + e.currentTarget.dataset.name,
    })
  }),
})