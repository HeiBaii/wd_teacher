//获取应用实例
var common = require('../../../utils/common.js');
var http = require('../../../utils/http.js');
const app = getApp()
var date = new Date();
var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

Page({
  data: {
    // 选中课程后，loginBtn: 'btn-show',
    dataInfo: true,
    loginBtn: 'btn',
    showHidden: true,
    date: date.getMonth() + 1 + '月' + date.getDate() + '日',
    weeks: weekday[date.getDay()],
    yearMonthDay: '',
    selected:0,
    list: []
  },

  fetchOrderList: function() {
    //获取登录的教师id
    let userinfo = wx.getStorageSync('userInfo')
    let userId = userinfo.id
    let that = this;
    let yearMonthDay = this.data.yearMonthDay;
    let params = {
      userId: userId,
      yearMonthDay: yearMonthDay
    }
 
    http.postReq(app.globalData.config.REQUEST_URL_BUSINESS + '/applets/teacher/classList', params, function (res) {
      let sendList = [];
      let list = res.data;
      if (res.code == 0) {
        for (let i in list) {
          let slist = [],
            slistobj = {},
            sslist = {};
          slistobj['timeTitle'] = '上课时间：';
          slistobj['timeName'] = list[i].timeDetail;
          slistobj['addrTitle'] = '上课地点：';
          slistobj['addrName'] = list[i].otherAddr;
          slist[0] = slistobj;

          sslist['select'] = 'circle';
          sslist['courseName'] = list[i].showName;
          sslist['item'] = slist;
          sslist['courseId'] = list[i].courseId;
          sslist['schoolId'] = list[i].schoolId;
          sslist['teachingPointId'] = list[i].teachingPointId;
          sslist['scheduleDetailId'] = list[i].scheduleDetailId;
          sslist['isUnion'] = list[i].isUnion;

          sslist['startTime'] = list[i].startTime;
          sslist['endTime'] = list[i].endTime;

          sendList.push(sslist);
        }
        that.setData({
          'list': sendList
        });
      } else {
        that.setData({
          'dataInfo': false
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    let curDateStr = date.getFullYear() + '-' + month + '-' + day;
    this.setData({
      yearMonthDay: curDateStr
    });

    this.fetchOrderList();

    //iphone x 适配
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    })
  },
  //点击选中课程
  choose: function(e) {
    let seindx = e.currentTarget.dataset.parentindex,
      deindx = 0,
      list = this.data.list,
      llen = list.length;
      
    for (let i = 0; i < llen; i++) {
      if (list[i].select == "success") {
        deindx = i;
        break;
      }
    }
    let sel = "list[" + seindx + "].select",
      del = "list[" + deindx + "].select";

    this.setData({
      [del]: "circle",
      [sel]: "success",
      loginBtn: 'btn-show',
      selected: seindx
    });
  },

  //点击最外层列表展开收起
  listTap(e) {
    let Index = e.currentTarget.dataset.parentindex, //获取点击的下标值
      list = this.data.list;
    list[Index].show = !list[Index].show || false; //变换其打开、关闭的状态
    if (list[Index].show) { //如果点击后是展开状态，则让其他已经展开的列表变为收起状态
      this.packUp(list, Index);
    }
    this.setData({
      list
    });
  },
  //让所有的展开项，都变为收起
  packUp(data, index) {
    for (let i = 0, len = data.length; i < len; i++) { //其他最外层列表变为关闭状态
      if (index != i) {
        data[i].show = false;
        for (let j = 0; j < data[i].item.length; j++) { //其他所有内层也为关闭状态
          data[i].item[j].show = false;
        }
      }
    }
  },
  showBtn: common.throttle(function () {
    let seindex = this.data.selected;
    let scheduleDetailId = this.data.list[seindex].scheduleDetailId;
    let userinfo = wx.getStorageSync('userInfo')
    let userId = userinfo.id

    if (this.data.loginBtn == 'btn') {
      wx.showToast({
        title: '请选择课程',
        icon: 'none',
        duration: 1200
      });
    } else {
      var header = app.globalData.header;
      let token = wx.getStorageSync("token");
      header.Authorization = 'Barner ' + token;
      wx.request({
        url: app.globalData.config.REQUEST_URL_BUSINESS + '/applets/teacher/QRcodeGeneration',
        header: header,
        method: 'POST',
        data: {
          'scheduleDetailId': scheduleDetailId,
          'userId': userId,
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 0) {
            //选择课程正确，生成二维码成功         
            wx.navigateTo({
              url: '../code/code?imgdata=' + res.data.data.qrcode + '&userId=' + userId + '&time=' + res.data.data.time + '&name=' + res.data.data.name + '&scheduleDetailId=' + scheduleDetailId,
            });

          } else {
            //失败
            wx.navigateTo({
              url: '../codefail/codefail',
            });
          }
        }
      })
    }

  }),

  // 日期选择
  bindDateChange: function(e) {
    var dateStr = e.detail.value;
    var arr = e.detail.value.split('-');
    var choose_date = new Date(e.detail.value.replace('/', '-'));
    this.setData({

      date: arr[1] + '月' + arr[2] + '日',
      weeks: weekday[choose_date.getDay()],
      yearMonthDay: dateStr
    })
    this.fetchOrderList();
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/teach/course/course',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
})