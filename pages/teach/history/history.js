const app = getApp();
var http = require('../../../utils/http.js');
var common = require('../../../utils/common.js');
var date = new Date();
var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
Page({
  data: {
    iconClear: 'icon-del',
    toView: 'red',
    scrollTop: 0,
    load: 0,
    teachSchoolIndex: 10,
    date: date.getMonth() + 1 + '月' + date.getDate() + '日',
    weeks: weekday[date.getDay()],
    campusId: 1,
    campusAndSchool: '校区/教学点',
    shadowHidden: 'show-none',
    showHidden: true,

    yearMonthDay: '', //2018-08-16
    schoolId: '0',
    teachingPlaceId: '0',
    blurSearch: {},
    requestPageNum: 1,
    callbackcount: 5,
    screenHeight: 0,
    requestLoading: false, //"上拉加载"的变量，默认false，隐藏  
    requestLoadingComplete: false, //“没有数据”的变量，默认false，隐藏  

    holder: "请输入课程名称查询",
    keyword: "",
    keyName: "jiaoshi_keyword",
    list: [],
    simulation1: [],
    simulation2_1: [],
    curIndex: 0,
    schoolAndPlaceList: [],
  },

  changeTab: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (that.data.curIndex == index) {
      return;
    } else {
      that.setData({
        schoolId: e.currentTarget.dataset.id,
        curIndex: index,
      })
    }
  },

  onShow: function() {
    let keyword = wx.getStorageSync(this.data.keyName) || false;
    if (keyword) {
      this.setData({
        keyword: keyword,
        holder: '',
        blurSearch: {
          "courseName": keyword,
          "teacher_name": keyword
        }
      });
    }

    // 获取系统高度，判断正在加载中是否显示, 每个卡片的高度是300rpx; 
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          screenHeight: res.windowHeight
        })
      },
    })

    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let curDateStr = date.getFullYear() + '-' + month + '-' + date.getDate();
    this.setData({
      yearMonthDay: curDateStr
    });

    this.fetchTeachPlace();
    this.fetchOrderList();

  },
  onLoad: function(e) {
    wx.setStorageSync(this.data.keyName, '')
  },
  //获取学校和教学点
  fetchTeachPlace: function() {
    let that = this;
    //获取列表数据
    http.getReq('/timetable/getFieldList', function(res) {
      if (res) {
        if (res.code === 0) {

          // let school = res.data[0].data;
          // let sendSchool = [],
          //   sendPlace = [],
          //   slen = school.length;
          // for (let i = 0; i < slen; i++) {
          //   let schoolObj = {};
          //   schoolObj['id'] = school[i].id;
          //   schoolObj['name'] = school[i].label;
          //   sendSchool.push(schoolObj);

          //   if (school[i].children) {
          //     let plen = school[i].children.length;
          //     let placePoint = [];
          //     for (let j = 0; j < plen; j++) {
          //       let placePointObj = {};
          //       placePointObj['id'] = school[i].children[j].id;
          //       placePointObj['name'] = school[i].children[j].label;
          //       placePoint.push(placePointObj);
          //     }
          //     let place = {
          //       teachSchool: placePoint
          //     }
          //     sendPlace.push(place);
          //   }
          // }


          // that.setData({
          //   simulation1: sendSchool,
          //   simulation2_1: sendPlace
          // })
          that.setData({
            schoolAndPlaceList: res.data[0].data,
          })
        } else {
          app.toast(res.msg);
        }
      } else {
        app.toast("网络错误")
      }
    });

  },
  /**
   * 请求历史记录数据封装
   */
  fetchOrderList: function() {
    let that = this;
    let requestPageNum = this.data.requestPageNum, // 第几次加载数据(第几页) 
      callbackcount = this.data.callbackcount, //返回数据的个数(一次性取数据的个数)
      blurSearch = this.data.blurSearch,
      schoolId = this.data.schoolId,
      teachingPlaceId = this.data.teachingPlaceId,
      yearMonthDay = this.data.yearMonthDay;

    let userinfo = wx.getStorageSync('userInfo')
    let userId = userinfo.id
  

    let params = {
      "blurSearch": blurSearch,
      "customerId": 0,
      "order": {},
      "page": requestPageNum,
      "pageNum": callbackcount,
      "search": {
        "userId": userId,
        "yearMonthDay": yearMonthDay,
        "schoolId": schoolId,
        "teachingPlaceId": teachingPlaceId
      }
    }
    http.postReq(app.globalData.config.REQUEST_URL_BUSINESS + '/applets/teacher/cardHistory', params, function (res) {
      if (res.code === 0) {
        var result = res.data.resultList;
        var len = result.length;
        var sendList = that.data.list;
        for (var i = 0; i < len; i++) {
          var listObj = {};
          listObj['commonCourseTitle'] = result[i].showName;
          listObj['commonCourseXq'] = '上课时间：' + result[i].startTime + " \n " + '签到时间：' + result[i].cardTime + " \n " + '学生签到人数：' + result[i].studentNum + '人';
          sendList.push(listObj);
        }

        let pageTotalRows = sendList.length;
        let pageNum = res.data.totalPages; //rap数据总页码 
        let totalRows = res.data.totalRows
        let screenHeight = that.data.screenHeight;
        let screenOrderNum = parseInt(screenHeight / 100);
        // if (pageNum >= that.data.requestPageNum && (pageTotalRows > screenOrderNum)) {
        //   that.setData({
        //     requestLoading: true,
        //     list: sendList
        //   });
        // } else if (pageNum >= that.data.requestPageNum && (pageTotalRows == screenOrderNum)) {

        //   that.setData({
        //     requestLoadingComplete: false,
        //     requestLoading: true,
        //     list: sendList
        //   })
        // } else {
        //   that.setData({
        //     requestLoadingComplete: true,
        //     requestLoading: false,
        //     list: sendList
        //   })
        // }
        if (that.data.requestPageNum <= res.data.totalPages){
          that.setData({
            list: sendList,
            requestLoadingComplete:false,
            requestPageNum: that.data.requestPageNum + 1,
            requestLoading:true
          })
        }else{
          that.setData({
            requestLoadingComplete: true,
            requestLoading:false,
          })
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();

      }
    })
  
  },

  /** * 页面上拉触底事件的处理函数 */
  onReachBottom: function() {
    let that = this;
    if (that.data.requestLoading && !that.data.requestLoadingComplete) {
      // that.setData({
      //   requestPageNum: that.data.requestPageNum + 1, //每次触发上拉事件，把requestPageNum+1 
      // })
      that.fetchOrderList();
    }
  },

  /** * 页面相关事件处理函数--监听用户下拉动作 */
  onPullDownRefresh: function() {

    this.setData({
      requestPageNum: 1,
      list: [],
      requestLoading: false,
      requestLoadingComplete: false
    });
    this.fetchOrderList();
  },

  list: function(e) {
    http.postReq(app.globalData.config.REQUEST_URL_BUSINESS + '/mock/67/schools', {}, function (res) {
      that.setData({
        userData: res.data
      });
      if (res.data.code === 0) {

      }
    })
  },

  upper: function(e) {},

  lower: function(e) {
    this.setData({
      load: 1
    })
    let that = this;
    setTimeout(function() {
      let list = that.data.list;
      page++;
      let pre_list = that.data.list;

      for (var i = 0; i <= 7; i++) {
        list.push(pre_list[i]);
      }
      that.setData({
        list: list
      })
    }, 3000);
  },
  scroll: function(e) {},
  tap: function(e) {
    wx.showModal({
      title: '提示',
      content: '这是一个模态弹窗',
      showCancel: false,
      success: function(res) {
        if (res.confirm) {} else if (res.cancel) {}
      }
    })
    for (var i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1]
        })
        break
      }
    }
  },
  tapMove: function(e) {
    this.setData({
      scrollTop: this.data.scrollTop
    })
  },
  camputChoice: function(e) {
    this.setData({
      shadowHidden: 'show-block',
    });
  },
  selectTap: function(e) {
    this.setData({
      campusAndSchool: this.data.schoolAndPlaceList[this.data.curIndex].label + '/' + e.currentTarget.dataset.name,
      shadowHidden: 'show-none',
      //schoolId: this.data.simulation1[this.data.curIndex].id,
      teachingPlaceId: e.currentTarget.dataset.id,
      requestPageNum:1,
      requestLoadingComplete:false,
      requestLoading:false,
      list:[]
    });
    this.fetchOrderList();
  },
  tapSelectAll: function(e) {
    this.setData({
      campusAndSchool: '校区/教学点',
      shadowHidden: 'show-none',
      schoolId: '0',
      teachingPlaceId: '0',
      curIndex: 0,
      requestPageNum: 1,
      requestLoadingComplete: false,
      requestLoading: false,
      list: []
    });
    this.fetchOrderList();
  },
  tapSelectPlaceAll: function(e) {
    this.setData({
      campusAndSchool: this.data.schoolAndPlaceList[this.data.curIndex].label,
      shadowHidden: 'show-none',
      //schoolId: this.data.simulation1[this.data.curIndex].id,
      teachingPlaceId: '0',
      requestPageNum: 1,
      requestLoadingComplete: false,
      requestLoading: false,
      list: []
    });
    this.fetchOrderList();
  },
  // 日期选择
  bindDateChange: function(e) {
    var dateStr = e.detail.value;
    var arr = e.detail.value.split('-');
    var choose_date = new Date(e.detail.value.replace('/', '-'));
    this.setData({

      date: arr[1] + '月' + arr[2] + '日',
      weeks: weekday[choose_date.getDay()],
      yearMonthDay: dateStr,
      requestPageNum: 1,
      requestLoadingComplete: false,
      requestLoading: false,
      list: []
    })
    this.fetchOrderList();

  },
  //搜索按钮
  gotoSearch: common.throttle(function() {
    wx.navigateTo({
      url: '../../search/search?holder=' + this.data.holder + '&keyword=' + this.data.keyword + '&keyName=' + this.data.keyName,
    })
  }),
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/teach/history/history',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },

})