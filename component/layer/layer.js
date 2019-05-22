// component/layer/layer.js
//弹窗组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    layerHidden:{
      type: Boolean,
      value: true
    },
    layerTips: {
      type: Boolean,
      value: true
    },
    layerTipsMsg: {
      type: String,
      value: "5s后自动返回"
    },
    layerIcon:{
      type:String,
      value: "success"
    },
    layerColor: {
      type: String,
      value: "#f76160"
    },
    layerMsg: {
      type: String,
      value: "modal msg"
    },
    layerBtnText: {
      type: String,
      value: "重新扫码"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindLayerBtn:function(){
      let myEventDetail = {} // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('layerbtn', myEventDetail, myEventOption)
    }
  }
})
