var http = require('../../../utils/http.js');
var app = getApp();
Page({
  data: {
    showBook:true,
    showSort: true,
    holder:"请输入学生姓名",
    keyword:"",
    keyName:"jiaowu_book_detail_keyword",
    list: [],
    info:{},
    height:0,
    showClearicon:true,
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this,
      info = JSON.parse(options.info);
    that.setData({
      info: info
    })
    wx.getSystemInfo({
      success: function (res) {
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
      'path': '/pages/jiaowu/bookdetail/bookdetail',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  onShow:function(){
    app.hasToken();
    let keyword = wx.getStorageSync(this.data.keyName) || "";
    this.setData({
      keyword: keyword ? keyword : "",
    })
    wx.setStorageSync(this.data.keyName, "");
    this.request_data();
  },
  bookDetail: function(e){
    this.setData({
      showBook: !this.data.showBook
    });
  },

  tapSort:function(e){
    this.setData({
      showSort: !this.data.showSort
    });
    this.request_data();
  },

  lower: function (e) {
    console.log(e)
  },

  tapSearch:function(e){
    wx.navigateTo({
      url: '../../search/search?holder=' + this.data.holder + '&keyword=' + this.data.keyword + '&keyName=' + this.data.keyName,
    })
  },
  request_data:function(){
    let that = this;
    let data = {
      "blurSearch": { "studentName": that.data.keyword }, "customerId": 0, "order": { "sort": that.data.showSort ? "asc" : "desc"}, "page": that.data.page, "pageNum": 20, "search": { "grantPlanId": that.data.info.grantPlanId}
    };
    //获取领取书本的学生记录
    http.postReq('/applets/acdemic/scanBookDetail', data, function (res) {
      console.log(res);
      if(res.code == 0){
        that.setData({
          list: that.data.list.concat(res.data.resultList),
          page :that.data.page + 1,
        })
      }else{
        app.toast(res.msg);
      }
    });
  },
})