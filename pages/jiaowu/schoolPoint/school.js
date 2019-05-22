const app = getApp();
var common = require('../../../utils/common.js');
var http = require('../../../utils/http.js');
var util = require('../../../utils/util.js');


const COURSE_DATA_KEY = "courseData";
const BOOK_DATA_KEY = "bookData";

Page({

  /**
   * 页面的初始数据
   */
  data: {

    currentTab: 0,
    schoolId: 0,
    placeId: 0,
    height: 0,

    //右上角显示的日期
    timeStr: ["9月4日 周二", "9月4日 周二"],
    //用于搜索的日期
    timeDay: ["2018-9-4", "2018-9-4"],
    //当前页数
    currentPage: [1, 1],
    //是否还有下一页数据
    load: [true, true],
    //被选中的列表ID
    id: [0, 0],
    //被选中的列表索引
    curIndex: [-1, -1],
    sign: [false, false],
    courseSign: 0,
    bookSign: false,
    list: [],
    bookList: [],
    topHeight:0,
    topTab:0,
    courTop:0,
    n20:0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    let placeName = options.placeName;
    wx.setNavigationBarTitle({
      title: placeName + '教学点'
    })
    let date = new Date();
    let ymd = common.ymd(date);
    let str = common.dateToDate(ymd);
    this.setData({
      timeStr: [str, str],
      timeDay: [ymd, ymd],
      schoolId: options.schoolId,
      placeId: options.placeId
    })
    // let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          height: res.windowHeight
        })
      },
    })

    var obj = wx.createSelectorQuery();
    obj.selectAll('.top-tab').boundingClientRect();
    obj.exec(function (rect) {
      that.setData({
        topHeight: that.data.height - rect[0][0].height
      })
    })
    var obj1 = wx.createSelectorQuery();
    obj1.selectAll('.cour-top').boundingClientRect();
    obj1.exec(function (rect) {
      that.setData({
        topHeight: that.data.topHeight - rect[0][0].height
      })
    })
    var obj2 = wx.createSelectorQuery();
    obj2.selectAll('.n20').boundingClientRect();
    obj2.exec(function (rect) {
      that.setData({
        topHeight: that.data.topHeight - rect[0][0].height
      })
    })
    var obj3 = wx.createSelectorQuery();
    obj3.selectAll('.course-btm').boundingClientRect();
    obj3.exec(function (rect) {
      that.setData({
        topHeight: that.data.topHeight - rect[0][0].height
      })
    })
    //iphone x 适配
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    })
  },
  onShow: function() {
    app.hasToken();
    if(this.data.list.length <= 0){
      this.course_request();
    }
    // let course_key = COURSE_DATA_KEY + "_" + this.data.placeId + "_" + this.data.timeDay[this.data.currentTab];
    // let expireTime_course = wx.getStorageSync(course_key + "_expireTime");
    // let list_course = wx.getStorageSync(course_key);
    // if ((expireTime_course > (Date.parse(new Date()) / 1000)) && (list_course.length > 0)) {
    //   this.setData({
    //     list: list_course,
    //     ["currentPage[0]"]:2,
    //   })
    // } else {
    //   this.course_request();
    // }
  },
  //分享
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/jiaowu/schoolPoint/school',
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {
        console.log(res)
      }
    }
  },

  // 日期选择
  bindDateChange: function(e) {
    let date = common.dateToDate(e.detail.value),
      day = e.detail.value.replace('/', '-'),
      currentPage = "currentPage[" + this.data.currentTab + "]",
      timeStr = "timeStr[" + this.data.currentTab + "]",
      timeDay = "timeDay[" + this.data.currentTab + "]",

      id = "id[" + this.data.currentTab + "]",
      curIndex = "curIndex[" + this.data.currentTab + "]";
    this.setData({
      [timeStr]: date,
      [timeDay]: day,
      [currentPage]: 1,
      [id]: 0,
      [curIndex]: -1,
    })
    this.data.currentTab ? this.setData({ bookSign: false}) : this.setData({courseSign: 0})
    this.data.currentTab ? this.setData({
      bookList: []
    }) : this.setData({
      list: []
    })
    this.data.currentTab ? this.book_request(day) : this.course_request(day);
  },

  //点击选中课程
  tapSelectCourse: function(e) {
    let current_selected = e.currentTarget.dataset.index,
      pre_selected = 0,
      list = this.data.list,
      llen = list.length;
    for (var i = 0; i < llen; i++) {
      if (list[i].select == "success") {
        pre_selected = i;
        break;
      }
    }
    let pre_courseId = this.data.id[this.data.currentTab],
      curr_courseId = this.data.list[current_selected].courseId,
      current = "list[" + current_selected + "].select",
      pre = "list[" + pre_selected + "].select",
      id = "id[" + this.data.currentTab + "]",
      curIndex = "curIndex[" + this.data.currentTab + "]";

    let sign = 0;
    if (this.data.curIndex[0] == current_selected) {
      this.setData({
        courseSign: sign,
        [id]: 0,
        [curIndex]: -1,
        [pre]: "circle",
        [current]: "circle",
      });
    } else {
      if (this.data.list[current_selected].grantPlanId > 0) {
        sign = 3;
      } else {
        sign = 1;
      }
      this.setData({
        courseSign: sign,
        [id]: curr_courseId,
        [curIndex]: current_selected,
        [pre]: "circle",
        [current]: "success",
      });
    }
  },

  //课程 点击最外层列表展开收起
  tapSpreadCourse: function(e) {
    let Index = e.currentTarget.dataset.index, //获取点击的下标值
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
        // for (let j = 0; j < data[i].item.length; j++) {//其他所有内层也为关闭状态
        //   data[i].item[j].show = false;
        // }
      }
    }
  },
  // 点击选中发书
  tapSelectBook: function(e) {
    let current_selected = e.currentTarget.dataset.index,
      pre_selected = 0,
      list = this.data.bookList,
      llen = list.length;
    for (var i = 0; i < llen; i++) {
      if (list[i].select == "success") {
        pre_selected = i;
        break;
      }
    }

    let pre_bookId = this.data.id[this.data.currentTab],
      curr_bookId = this.data.bookList[current_selected].grantPlanId,
      current = "bookList[" + current_selected + "].select",
      pre = "bookList[" + pre_selected + "].select",

      id = "id[" + this.data.currentTab + "]",
      curIndex = "curIndex[" + this.data.currentTab + "]";
    if (this.data.curIndex[this.data.currentTab] == current_selected) {
      this.setData({
        bookSign: false,
        [id]: 0,
        [curIndex]: -1,
        [pre]: "circle",
        [current]: "circle",
      });
    } else {
      this.setData({
        bookSign: true,
        [id]: curr_bookId,
        [curIndex]: current_selected,
        [pre]: "circle",
        [current]: "success",
      });
    }
  },

  //发书 点击最外层列表展开收起
  tapSpreadBook: function(e) {
    let Index = e.currentTarget.dataset.index, //获取点击的下标值
      list = this.data.bookList;

    list[Index].show = !list[Index].show || false; //变换其打开、关闭的状态
    if (list[Index].show) { //如果点击后是展开状态，则让其他已经展开的列表变为收起状态
      this.packUp(list, Index);
    }
    this.setData({
      bookList: list
    });
  },

  bindSwiper: function(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    })
    if ((that.data.currentTab == 0) && (that.data.list.length == 0)) {
      let course_key = COURSE_DATA_KEY + "_" + this.data.placeId + "_" + this.data.timeDay[this.data.currentTab];
      let expireTime_course = wx.getStorageSync(course_key + "_expireTime");
      let list_course = wx.getStorageSync(course_key);
      if ((expireTime_course > (Date.parse(new Date()) / 1000)) && (list_course.length > 0)) {
        this.setData({
          list: list_course
        })
      } else {
        this.course_request();
      }
    }
    if ((that.data.currentTab == 1) && (that.data.bookList.length == 0)) {
      let book_key = BOOK_DATA_KEY + "_" + this.data.placeId + "_" + this.data.timeDay[this.data.currentTab];
      let expireTime_book = wx.getStorageSync(book_key + "_expireTime");
      let list_book = wx.getStorageSync(book_key);
      if ((expireTime_book > (Date.parse(new Date()) / 1000)) && (list_book.length > 0)) {
        this.setData({
          bookList: list_book
        })
      } else {
        this.book_request();
      }
    }
  },
  swichNav: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //开始签到
  tapSign: common.throttle(function(e) {
    if ((this.data.courseSign == 1) || (this.data.courseSign == 3)) {
      let course = JSON.stringify(this.data.list[this.data.curIndex[0]])
      this.gotoScanPage({ course: course,status:1});
      return
    }
    app.toast("请选择课程")
    return;
  }),

  //开始发书
  tapSendBook: common.throttle(function(e) {
    if ((this.data.courseSign == 2) || (this.data.courseSign == 3)) {
      let course = JSON.stringify(this.data.list[this.data.curIndex[0]])
      this.gotoScanPage({ course: course, status: 2 });
      return
    }
    app.toast("请选择发书计划")
    return;
  }),

  //开始签到发书
  tapSignAndSendBook: common.throttle(function(e) {
    if (this.data.courseSign == 3) {
      let course = JSON.stringify(this.data.list[this.data.curIndex[0]])
      this.gotoScanPage({ course: course, status: 3 });
      return
    }
    app.toast("请选择课程与发书计划")
    return;
  }),
  //集中发书的发书
  tapSigleSendBook:common.throttle(function(e){
    if (this.data.bookSign == false) {
      app.toast("请选择发书计划")
      return;
    }
    let book = JSON.stringify(this.data.bookList[this.data.curIndex[1]])
    this.gotoScanPage({ course: book, status: 2 });
    return
  }),

  gotoScanPage: function(e) {
    console.log("gotoScanPage",e)
    wx.navigateTo({
      url: '../saoma/saoma?schoolId=' + this.data.schoolId + '&placeId=' + this.data.placeId + "&data=" + e.course + '&status=' + e.status,
    })
  },

  tapLower: function(e) {
    if (this.data.load[this.data.currentTab]) {
      this.data.currentTab ? this.book_request() : this.course_request();
    } else {
      app.toast("已到底");
    }
  },

  //获取课程数据
  course_request: function(e) {
    let that = this,
      // course_key = COURSE_DATA_KEY + "_" + this.data.placeId + "_" + this.data.timeDay[[this.data.currentTab]],
      data = {
        "blurSearch": {},
        "customerId": 0,
        "order": {},
        "page": this.data.currentPage[0],
        "pageNum": 15,
        "search": {
          "yearMonthDay": this.data.timeDay[0],
          "schoolId": this.data.schoolId,
          "teachingPointId": this.data.placeId
        }
      };

    http.postReq('/applets/acdemic/classList', data, function(res) {
      if (res.code === 0) {
        if ((res.data == null) || (res.data.resultList.length <= 0)) {
          app.toast("暂无课程安排")
          return
        }
        
        let data = res.data.resultList,
          currentPage = "currentPage[" + 0 + "]",
          load = "load[" + 0 + "]";
        //第一页数据缓存,其他不缓存
        // if (that.data.currentPage[0] == 1) {
        //   wx.setStorageSync(course_key, data)
        //   wx.setStorageSync(course_key + "_expireTime", Date.parse(new Date()) / 1000 + 1800)
        // }
        for (var i = 0; i < data.length; i++) {
          if (data[i]['isUnion'] == 1){
            data[i]['showName'] = data[i]['showName'].join(' + ');
          }
        }
        that.setData({
          list: that.data.list.concat(data),
          [currentPage]: that.data.currentPage[0] + 1,
          [load]: (res.data.currentPage >= res.data.totalPages) ? false : true,
        })
      } else {
        app.toast(res.msg)
      }
    });
  },
  //获取发书数据
  book_request(e) {
    let that = this,
      // book_key = BOOK_DATA_KEY + "_" + this.data.placeId + "_" + this.data.timeDay[this.data.currentTab],
      search_data = {
        "blurSearch": {},
        "customerId": 0,
        "menuId": 0,
        "order": {},
        "page": this.data.currentPage[1],
        "pageNum": 10,
        "search": {
          "yearMonthDay": this.data.timeDay[1],
          "schoolId": this.data.schoolId,
          "teachingPointId": this.data.placeId
        }
      };
    http.postReq('/applets/acdemic/sendBookList', search_data, function(res) {
      if (res.code === 0) {
        if ((res.data == null) || (res.data.resultList.length <= 0)) {
          app.toast("暂无发书计划")
          return
        }
        let data = res.data.resultList,
          currentPage = "currentPage[" + 1 + "]",
          load = "load[" + 1 + "]";
        //当天第一页数据缓存,其他不缓存
        // if (that.data.currentPage[1] == 1) {
        //   wx.setStorageSync(book_key, data)
        //   wx.setStorageSync(book_key + "_expireTime", Date.parse(new Date()) / 1000 + 1800)
        // }
        that.setData({
          bookList: that.data.bookList.concat(data),
          [currentPage]: that.data.currentPage[1] + 1,
          [load]: (res.data.currentPage >= res.data.totalPages) ? false : true,
        })
      } else {
        app.toast(res.msg)
      }
    });
  },
})