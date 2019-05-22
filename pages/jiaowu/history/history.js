const app = getApp();
var common = require('../../../utils/common.js');
var http = require('../../../utils/http.js');
const SCHOOL_PLACE_DATA_KEY = "schoolAndPlaceData";
const SCHOOL_PLACE_DATA_KEY_EXPIRE = "schoolAndPlaceData_ExpireTime";
var show_select = false;

Page({
  data: {
    height: 0,
    currentTab: 0,
    showClearicon:false,
    //校区/教学点视图 隐藏/显示 控制
    shadowSchoolPlace:[true,true],
    //身份选择标签 隐藏/显示 控制
    shadowIdent: true,
    schoolAndPlaceName: ["校区/教学点","校区/教学点"],
    //校区/教学点 数据列表
    schoolAndPlaceList: [],
    //被选中的校区的索引
    curIndex:[0,0],
    //被选中的校区ID
    schoolId:['0','0'],
    //被选中的教学点ID
    placeId:['0','0'],
    //右上角显示的日期
    timeStr: ["9月4日 周二","9月4日 周二"],
    //用于搜索的日期
    timeDay: ["2018-9-4","2018-9-4"],
    //当前页数
    currentPage:[1,1],
    //是否还有下一页数据
    load:[true,true],
    holder: ["请输入课程名称或姓名查询", "请输入课程名称或姓名查询"],
    keyword:["",""],
    keyName: ["jiaowu_sign_course_keyword","jiaowu_sign_book_keyword"],
    //页面顶部搜索框的显示(select选择的时候,由于有连个搜索框出现重复)
    search_show:[true,true],
    //身份 无 老师 学生
    indentify: '无',
    list:[],
    sendList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let date = new Date();
    let ymd = common.ymd(date);
    let str = common.dateToDate(ymd);
    this.setData({
      timeStr: [str, str],
      timeDay: [ymd, ymd],
    });
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          height: res.windowHeight
        })
      },
    })
  },
  //分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/jiaowu/history/history',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  onShow:function(options){
    // app.hasToken();
    let keyword = wx.getStorageSync(this.data.keyName[0]) || "",
      bookKeyword = wx.getStorageSync(this.data.keyName[1]) || "";
    this.setData({
      keyword: [keyword, bookKeyword] ,
    })
    wx.setStorageSync(this.data.keyName[0], "");
    wx.setStorageSync(this.data.keyName[1], "");
    if(this.data.list.length <= 0){
      this.request_course();
    }
    if (this.data.sendList.length <= 0) {
      this.request_book();
    }
    if (this.data.schoolAndPlaceList.length <=0 ){
      this.request_schoolAndPlace();
    }
  },

  swichNav: function(e){
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
    this.setData({
      shadowSchoolPlace:[true,true],
      shadowIdent:true
    })
  },
  bindSwiper: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    })
  },

  // 日期选择
  bindDateChange: function (e) {
    let condition = this.getReqSearchContidion();
    let date = common.dateToDate(e.detail.value),
      currentPage = "currentPage[" + this.data.currentTab + "]",
    timeStr = "timeStr["+this.data.currentTab+"]",
      timeDay = "timeDay[" + this.data.currentTab + "]";
    this.setData({
      [timeStr]: date,
      [timeDay]: e.detail.value.replace('/','-'),
      [currentPage]:1,
    })
    this.data.currentTab ? this.request_book(condition) : this.request_course(condition);
  },

  // 选择校区/教学点 隐藏/显示
  tapSchoolAndPlace: function (e) {
    let shadowSchoolPlace = "shadowSchoolPlace["+this.data.currentTab+"]",
      search_show = "search_show[" + this.data.currentTab+"]",
      schoolId = "schoolId[" + this.data.currentTab + "]";
    this.setData({
      [shadowSchoolPlace]:false,
      [search_show]:false,
      [schoolId]: (this.data.schoolId[this.data.currentTab] != 0) ? this.data.schoolId[this.data.currentTab] : this.data.schoolAndPlaceList[0].id
    });
  },

  //校区/教学点 全选
  tapAll: function (e) {
    let condition = this.getReqSearchContidion();
    let schoolId = "schoolId[" + this.data.currentTab +"]",
      placeId = "placeId[" + this.data.currentTab +"]",
      schoolAndPlaceName = "schoolAndPlaceName[" + this.data.currentTab +"]",
      shadowSchoolPlace = "shadowSchoolPlace[" + this.data.currentTab + "]",
      search_show = "search_show[" + this.data.currentTab +"]",
      currentPage = "currentPage[" + this.data.currentTab + "]";
    this.setData({
      [shadowSchoolPlace]: true,
      [schoolId]: '0',
      [placeId]: '0',
      [schoolAndPlaceName]: "校区/教学点",
      [search_show]: true,
      [currentPage]:1,
    })
    this.data.currentTab ? this.request_book(condition) : this.request_course(condition);
  },

  //选择学校
  tabSchool: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (that.data.schoolId[this.data.currentTab] === id) {
      return;
    } else {
      let index = e.currentTarget.dataset.index,
        schoolId = "schoolId[" + this.data.currentTab +"]",
        curIndex = "curIndex[" + this.data.currentTab +"]";
      that.setData({
        [schoolId]: id,
        [curIndex]: index,
      })
    }
  },

  //选择教学点
  tapPlace: function (e) {
    let condition = this.getReqSearchContidion();
    let placeId = "placeId[" + this.data.currentTab + "]",
      schoolId = "schoolId[" + this.data.currentTab + "]",
      shadowSchoolPlace = "shadowSchoolPlace[" + this.data.currentTab +"]",
      schoolAndPlaceName = "schoolAndPlaceName[" + this.data.currentTab +"]",
      search_show = "search_show[" + this.data.currentTab + "]",
      currentPage = "currentPage[" + this.data.currentTab + "]";
    this.setData({
      [shadowSchoolPlace]: true,
      [placeId]: e.currentTarget.dataset.id,
      [schoolAndPlaceName]: this.data.schoolAndPlaceList[this.data.curIndex[this.data.currentTab]].label + '/' + e.currentTarget.dataset.name,
      [search_show]: true,
      [currentPage]:1,
    });
    this.data.currentTab ? this.request_book(condition) : this.request_course(condition);
  },

  // 选择身份标签
  tapIdentChoice: function (e) {
    let search_show = "search_show[" + this.data.currentTab + "]";
    this.setData({
      shadowIdent: false,
      [search_show]: false,
    });
  },

  //选择身份
  tapIndentify: function (e) {
    let condition = this.getReqSearchContidion();
    let indentify = e.currentTarget.dataset.indentify,
      search_show = "search_show[" + this.data.currentTab + "]",
      currentPage = "currentPage[" + this.data.currentTab + "]";
    this.setData({
      shadowIdent: true,
      indentify: indentify,
      [search_show]: true,
      [currentPage]:1,
    });
    this.request_course(condition);
  },

  //跳转到搜索页面
  gotoSearch: function (e) {
    wx.navigateTo({
      url: '../../search/search?holder=' + this.data.holder[this.data.currentTab] + '&keyword=' + this.data.keyword[this.data.currentTab] + '&keyName=' + this.data.keyName[this.data.currentTab],
    })
  },

  //课程 记录滚动到底 拉取下一页
  tapLower: function (e) {
    if(this.data.load[this.data.currentTab]){
      let condition = this.getReqSearchContidion();
      this.data.currentTab ? this.request_book(condition) : this.request_course(condition);
    }else{
      app.toast("已到底");
    }
  },

  tapSignDetail:function(e){
    let val = e.currentTarget.dataset.name;
    let classId = e.currentTarget.dataset.class;
    let scheduleId = e.currentTarget.dataset.schedule;
    wx.navigateTo({
      url: '../signdetail/signdetail?course_name=' + val + "&classId=" + classId + "&scheduleId=" + scheduleId,
    })
  },

  //跳转到发书详情页
  tapBookDetail: function (e) {
    let bookId = e.currentTarget.dataset.bookid;
    let index = e.currentTarget.dataset.index;
    let info = this.data.sendList[index];
    wx.navigateTo({
      url: '../bookdetail/bookdetail?info=' + JSON.stringify(info),
    })
  },

  //请求上课签到数据
  request_course: function (e) {
    let that = this;
    let data = {
      "blurSearch": { "courseName": that.data.keyword[0] }, "customerId": 0, "order": {}, "page": that.data.currentPage[0], "pageNum": 10, "search": { "schoolId": that.data.schoolId[0], "teachingPlaceId": that.data.placeId[0],  "yearMonthDay": that.data.timeDay[0] }
    };
    http.postReq('/applets/acdemic/scanCardHistory', data, function (res) {
      if (res.code == 0) {
        if ((res.data == null) || (res.data == []) || (res.data.resultList == [])) {
          app.toast(res.msg)
          return
        }
        let data = res.data.resultList,
          currentPage = "currentPage[" + 0 + "]",
          load = "load[" + 0 + "]",
          condition = that.getReqSearchContidion();
        that.setData({
          [currentPage]: (e == condition) ? (that.data.currentPage[0] + 1):2,
          [load]: (res.data.currentPage >= res.data.totalPages) ? false : true,
          list: (e == condition)?that.data.list.concat(data):data,
        })
      } else {
        app.toast(res.msg)
      }
    });
  },
 
  //请求发书数据
  request_book: function (e) {
    let that = this;
    let data = {
      "blurSearch": { "courseName": that.data.keyword[1] }, "customerId": 0, "menuId": 0, "order": {}, "page": that.data.currentPage[1], "pageNum": 10, "search": { "schoolId": that.data.schoolId[1], "teachingPointId": that.data.placeId[1], "yearMonthDay": that.data.timeDay[1] }
    };
    http.postReq('/applets/acdemic/scanBookHistory', data, function (res) {
      if (res.code == 0) {
        if ((res.data == null) || (res.data == []) || (res.data.resultList == [])) {
          app.toast(res.msg)
          return
        }
        let data = res.data.resultList,
          currentPage = "currentPage["+1+"]",
          load = "load[" + 1+"]",
          condition = that.getReqSearchContidion();
        that.setData({
          [currentPage]: (e == condition) ? (that.data.currentPage[1] + 1) : 2,
          [load]: (res.data.currentPage >= res.data.totalPages) ? false : true,
          sendList: (e == condition) ? that.data.sendList.concat(data) : data,
        })
      } else {
        app.toast(res.msg)
      }
    });
  },
  //搜索条件
  getReqSearchContidion:function(e){
    let str = this.data.currentTab + "-" + this.data.timeDay[this.data.currentTab] + "-" + this.data.schoolId[this.data.currentTab] + "-" + this.data.placeId[this.data.currentTab] + "-" + this.data.keyword[this.data.currentTab] + "-" + this.data.indentify + "-";
    return str;
  },
  //接口条用判断
  reqSelect:function(e){
    this.data.currentTab ? this.setData({ sendList: [] }) : this.setData({ list: [] });
    this.data.currentTab ? this.request_book(condition) : this.request_course(condition);
  },
  //学校教学点接口
  request_schoolAndPlace:function(e){
    let that = this;
    //获取列表数据
    http.getReq('/timetable/getFieldList', function (res) {
      if (res) {
        if (res.code === 0) {
          // wx.setStorageSync(SCHOOL_PLACE_DATA_KEY, res.data[0].data)
          // wx.setStorageSync(SCHOOL_PLACE_DATA_KEY_EXPIRE, Date.parse(new Date()) / 1000 + 1800)
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
    // let expireTime = wx.getStorageSync(SCHOOL_PLACE_DATA_KEY_EXPIRE);
    // if (expireTime > (Date.parse(new Date()) / 1000)) {
    //   let list = wx.getStorageSync(SCHOOL_PLACE_DATA_KEY)
    //   that.setData({
    //     schoolAndPlaceList: list,
    //   })
    // } else {
      
    // }
  },
})