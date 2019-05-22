var http = require('../../../utils/http.js');
var app = getApp();
var classId = 0;
var scheduleId = 0;

Page({
  data: {
    holder: "请输入姓名",
    keyword: "",
    keyName: 'jiaowu_sign_detail_search_keyword',
    course_name: "课程名称",
    hidden_inde: true,
    hidden_sign: true,
    inde: '',
    sign: '',
    currentPage:1,
    lists:[],
    isMoreLoad:true,
    totalRows:0,
    icon_img:"icon_01.png",
    showClearicon:false,
  },

  onLoad: function(e) {
    console.log(e);
    this.setData({
      course_name: e.course_name
    })
    classId = e.classId;
    scheduleId = e.scheduleId;
  },
  onShow: function () {
    // let keyword = wx.getStorageSync(this.data.keyName) || "";
    // this.setData({
    //   keyword: keyword ? keyword : "",
    // })
    // wx.setStorageSync(this.data.keyName, "");
    this.setData({
      currentPage:1,
    })
    if(this.data.lists.length <= 0){
      this.http_request();
    }
  },
  tapSearch: function(e) {
    wx.navigateTo({
      url: '../../search/search?holder=' + this.data.holder + '&keyword=' + this.data.keyword + '&keyName=' + this.data.keyName,
    })
  },
  tapInde: function(e) {
    let that = this;
    this.setData({
      hidden_inde: !that.data.hidden_inde,
      hidden_sign:true,
    })
  },
  tapSign: function(e) {
    let that = this;
    this.setData({
      hidden_sign: !that.data.hidden_sign,
      hidden_inde:true
    })
  },
  tapIndeSlected: function(e) {
    let val = e.currentTarget.dataset.inde;
    this.setData({
      inde: val,
      hidden_inde: true,
      currentPage:1,
      lists:[]
    })
    this.http_request();
  },
  tapSignSlected: function(e) {
    let val = e.currentTarget.dataset.sign;
    this.setData({
      sign: val,
      hidden_sign: true,
      currentPage:1,
      lists: []
    })
    this.http_request();
  },
  //输入搜索
  bindInputSearch: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({
        showClearicon: true,
        keyword: e.detail.value
      })
    } else {
      this.setData({
        showClearicon: false,
        keyword: ""
      })
    }
  },
  confirmSearch:function(e){
    let keyword = e.detail.value;
    this.setData({
      currentPage:1,
      lists:[],
    })
    this.http_request();
  },
  tapDelInputSearch:function(e){
    this.setData({
      keyword:"",
      showClearicon: false
    })
  },
  onPullDownRefresh:function(){
    this.setData({
      currentPage:1,
    })
  },
  onReachBottom:function(e){
    if (this.data.isMoreLoad){
      this.http_request();
    }
  },
  http_request(){
    let that = this;
    let data = {
      "blurSearch": { "name": that.data.keyword }, "customerId": 0, "menuId": 0, "order": {}, "page": that.data.currentPage, "pageNum": 10, "search": { "attType": that.data.sign, "type": that.data.inde, "scheduleId": scheduleId, "classId": classId }
    };
    http.postReq('/applets/acdemic/scanCardHistoryDetail',data,function(res){
      if(res.code == 0){
        that.setData({
          currentPage:that.data.currentPage + 1,
          lists: that.data.lists.concat(res.data.resultList),
          isMoreLoad: (that.data.currentPage < res.data.totalPages)?true:false,
          totalRows: res.data.totalRows
        })
      }
    })
  },
})