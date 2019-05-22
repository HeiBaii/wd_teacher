// component/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    holder: {
      type: String,
      value: "请输入"
    },
    keyword: {
      type: String,
      value: ""
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showClearicon:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    confirmSearch: function () {
      let myEventDetail = {"keyword":this.data.keyword} // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('Search', myEventDetail, myEventOption)
    },
    bindInputSearch:function(e){
      if(e.detail.value.length > 0){
        this.setData({
          showClearicon:true,
          keyword: e.detail.value
        })
      }else{
        this.setData({
          showClearicon: false,
          keyword:""
        })
      }
    },
    tapDelInputSearch:function(){
      this.setData({
        showClearicon: false,
        keyword:'',
      })
    },
    tapSearch:function(){
      let myEventDetail = { "keyword": this.data.keyword } // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('SearchPage', myEventDetail, myEventOption)
    }
  }
})
