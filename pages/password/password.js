//index.js
//获取应用实例
const app = getApp()
var common = require('../../utils/common.js')

Page({
  data: {
    avatar: '../../images/user.png',
    input:{
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
    clear_icon:{
      OldPassword: false,
      password: false,
      confirmPassword: false,
    },
    // isShowPassword: false,
    isConfirmPassword: false,
    clrPassword: false,
    okBtn: false, 
    // repassword:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // toggleShowPassword: function (e) {
  //   var isShowPassword = !this.data.isShowPassword;
  //   this.setData({
  //     isShowPassword: isShowPassword
  //   });
  // },

  //分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/password/password',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },



  //显示/隐藏确认密码
  toggleConfirmPassword: function (e) {
    var isConfirmPassword = !this.data.isConfirmPassword;
    this.setData({
      isConfirmPassword: isConfirmPassword
    });
  },

//绑定输入事件                                                                           
  onBindInput: function (e) {
    let val = e.detail.value,
      key = e.currentTarget.dataset.key,
      input = this.data.input,
      clear_icon = this.data.clear_icon;

    input[key] = val
    clear_icon[key] = true
    this.setData({
      input: input,
      clear_icon: clear_icon
    });
  },
//获取焦点  输入框有数据 显示删除图标
  obBindFocus: function (e) {
    let key = e.currentTarget.dataset.key,
      clear_icon = this.data.clear_icon;
    if (e.detail.value.length > 0) {
      clear_icon[key] = true
      this.setData({
        clear_icon: clear_icon
      })
    }
  }, 
//失去焦点 隐藏删除图标
  onBindBlur: function (e) {
    let val = e.detail.value,
      key = e.currentTarget.dataset.key,
      clear_icon = this.data.clear_icon;
    clear_icon[key] = false;
    this.setData({
      clear_icon: clear_icon,
    });
    this.checkOkInput();
  },
  //删除输入框的内容
  onDeleteInput: function (e) {
    let key = e.currentTarget.dataset.key,
      input = this.data.input,
      clear_icon = this.data.clear_icon;
    clear_icon[key] = false
    input[key] = ""
    this.setData({
      input: input,
      okBtn: false,
      clear_icon: clear_icon
    })
  },


  // //输入旧密码
  // bindOldPwd:function(e){
  //   let pwd = e.detail.value;//进行赋值
  //   this.setData({
  //     oldPassword: pwd,//用wxml的value进行赋值
  //   });
  //   this.checkOkInput();;//调用下面定义的方法
    
  // },
  // //删除密码
  // deltelOldPassword:function(){
  //   this.setData({
  //     oldPassword:'',
  //     clearOldPassword:false,
  //     okBtn: false, 
  //   })

  // },

  // //第一次输入密码
  // blurRePwd: function (e) {
  //   let pwd = e.detail.value;//进行赋值
  //   this.setData({
  //     password: pwd, //用wxml的value进行赋值
  //   });
  //   this.checkOkInput();//调用下面定义的方法
  // },

  // //第一次删除密码
  // deltelPassword: function (e) {
  //   this.setData({
  //     password: '', //如果是空
  //     clearPassword: false,//icon的值就为false 输入框的数据就清空
  //     okBtn: false, 

  //   });
  // },


  // //第二次输入密码
  // confirmPassword: function (e) {
  //   let pwd = e.detail.value;
  //   this.setData({
  //     confirmPassword: pwd,
  //   });
  //   this.checkOkInput();
  // },

  // //第二次删除密码
  // delConfirmPassword: function (e) {
  //   this.setData({
  //     confirmPassword: '',
  //     clearRePassword: false,
  //     okBtn: false,

  //   });
  // },

  //按钮
  logbtn: function (e) {
    // app.toast('修改密码，调用接口')
    if (!common.checkString(this.data.input.oldPassword, 6, 18)){
      app.toast('请输入6-18位旧密码')
      return;
    }
    if (common.checkString(this.data.input.password, 6, 18)
      && common.checkString(this.data.input.confirmPassword, 6, 18)){
      wx.request({
        url: app.globalData.config.REQUEST_URL + '/authority/userInfo/updatePassWord',
        header: app.globalData.header,
        method: "post",
        data: { 'mobile': this.data.input.confirmPassword, 'password': this.data.input.password, 'oldPassword': this.data.input.oldPassword },
        success: function (res) {
          console.log(res.data)
          if (res.data.code === 0) {
            app.toast("登录成功");
          }
        }
      })
      }else{
      app.toast('请输入6-18位新密码')
      }

  },
  
  /**
   * 定义全局变量  进行调用
   */
  closeBtn: function (){
    this.setData({
      okBtn: false
    })
  },
/**
 * 效验密码格式
 */
  checkOkInput: function(){
    // if (this.data.oldPassword == '' || this.data.oldPassword.length==0){
    //   // app.toast('旧密码不可以为空')
    //   // this.setData({ //输入框的数据为空  关闭XX
    //   //   clearOldPassword: false,
    //   // })
    //   this.closeBtn(); //判定是正确的  但是Btn按钮为false 不会显示
    //   return;  //先执行以上逻辑 在执行以下逻辑
     
    // } else 
    // if(this.data.input.oldPassword.length > 0){
    //   this.setData({//输入框有数据 显示XX
    //     confirmPassword: true,
    //   })
    // }else{
    //   this.setData({//输入框的数据为空  关闭XX
    //     confirmPassword: false,
    //   })
    // }
    /** 
     * 效验旧密码的数字是否正确
     * 不正确进行数据返回 
     * 格式不正确 请重新输入
     */



    // if(this.data.password==''||this.data.password.length==0){
    //   //   app.toast('新密码不可以为空')
    //   // this.setData({//输入框的数据为空  关闭XX
    //   //     clearPassword:false,
    //   //   })
    //   this.closeBtn();//判定是正确的  但是Btn按钮为false 不会显示
    //   return;   //先执行以上逻辑 在执行以下逻辑
    //    }else 
    // if (this.data.input.password.length > 0) {
    //    this.setData({//输入框有数据 显示XX
    //     clearPassword: true,
    //   })
     
    // } else {
    //   this.setData({//输入框的数据为空 关闭xx
    //     clearPassword: false,
    //   })
    // }




    // if (this.data.confirmPassword==''||this.data.confirmPassword.length==0){
    //   // app.toast('确认密码不可以为空')
    //   // this.setData({//输入框的数据为空  关闭xx
    //   //   clearRePassword:false,
    //   // })
    //   this.closeBtn();//Bkotn按钮设置为false 提交按钮不高亮 无法提交
    //   return;
    // } else 
    // if (this.data.input.confirmPassword.length > 0) {
    //   this.setData({//输入框有数据  显示xx按键
    //     clearRePassword: true,
    //   })
    // } else {
    //   this.setData({//输入框没有数据  关闭xx按键
    //     clearRePassword: false,
    //   })
    // }
 

    if(this.data.input.oldPassword.length > 0){
      if (!common.checkString(this.data.input.oldPassword)) {
        app.toast('密码错误！请输入正确的旧密码')
        this.closeBtn();//Btn按钮为false 不会显示
        return;
      } 
    }
  
  if (this.data.input.password.length>0){
    if (!common.checkString(this.data.input.password)) {
      app.toast('请输入新密码，由6-18数字和字母组成')
      this.closeBtn();//Bkotn按钮设置为了false  不可能提交 
      return;
    } 
  }
    //效验密码格式
    if (this.data.input.confirmPassword.length > 0){
      if (!common.checkString(this.data.input.confirmPassword)) {
        app.toast('请再次输入新密码')
        this.closeBtn();//关闭bkotn按键设置为false 提交按钮不会高亮 无法提交
        return;
      } 

    }  

    /**
     * 判定密码的长度都大于5 
     */
    if (this.data.input.oldPassword.length > 5 && this.data.input.confirmPassword.length > 5 && this.data.input.password.length > 5) {
      if (this.data.input.confirmPassword === this.data.input.password) { //判定旧密码与新密码是否相同 
        this.setData({
          okBtn: true//如果相同  BKotn按钮会显示高亮  就可以提交数据
        })
        return; //如果相同 数据进行返回
      }else{
        app.toast('两次密码输入不一致，请重新输入')
        this.closeBtn();//如果不相同 按钮无法显示
      }
    }else{
      this.closeBtn();//如果密码不同 格式不同 按钮不会显示
    }
  },
})