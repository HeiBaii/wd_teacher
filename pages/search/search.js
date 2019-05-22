// pages/search/search.js
const app = getApp();
var common = require('../../utils/common.js');

Page({

  data: {
    iconClear: 'show-none',
    historyHidden: 'show-block',
    inputValue: '',
    search_list: [],
    holder: "",
    keyword: "",
    //跳转到搜索页页面中搜索的关键字变量名称
    keyName: "",
    showClearicon: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      holder: options.holder,
      keyword: options.keyword,
      keyName: options.keyName ? options.keyName : "keyword"
    })
  },
  //分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/search/search',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  onShow: function (e) {
    app.hasToken();
    let search_list = wx.getStorageSync('search_list') || [];
    this.setData({
      search_list: search_list
    })
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

  //搜索确认
  confirmSearch: common.throttle(function (e) {
    let keyword = this.data.keyword
    if (keyword != "") {
      let search_list = wx.getStorageSync('search_list') || [];
      if (search_list.indexOf(keyword) == -1) {
        search_list.push(keyword)
      }
      wx.setStorageSync("search_list", search_list)
      wx.setStorageSync(this.data.keyName, keyword);
    } else {
      wx.setStorageSync(this.data.keyName, "");
    }

    wx.navigateBack({
      delta: 1
    })
  }),

  //删除输入
  tapDelInputSearch: function () {
    this.setData({
      showClearicon: false,
      keyword: ""
    })
  },

  //点击搜索的历史记录
  onTapHistorySearch: function (e) {
    let keyword = e.currentTarget.dataset.keyword;
    wx.setStorageSync(this.data.keyName, keyword);
    wx.navigateBack({
      delta: 1
    })
  },

  delSearchList: function () {
    wx.setStorageSync("search_list", []),
      this.onShow();
  },
})