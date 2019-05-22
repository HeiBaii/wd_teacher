//index.js
//获取应用实例
const app = getApp()
var common = require('../../utils/common.js')
var http = require('../../utils/http.js')

Page({
  data: {
    avatar: '../../images/user.png',
    isShowPassword: false,
    btn_code: true,
    time: 0,
    okBtn: false,
    hashNum: '',
    input: {
      telphone: '',
      code: '',
      password: '',
      repassword: '',
    },
    clear_icon: {
      telphone: false,
      code: false,
      password: false,
      repassword: false,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/creat/creat',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  //显示/隐藏密码
  toggleShowPassword: function (e) {
    var isShowPassword = !this.data.isShowPassword;
    this.setData({
      isShowPassword: isShowPassword
    });
  },

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

  //获取验证码
  tapCode: common.throttle(function (e) {
    let is_phone = common.checkPhone(this.data.input.telphone);
    if (is_phone === true) {
      var myDate = new Date();
      let current_phone_ymd = this.data.input.telphone + '_' + myDate.toLocaleDateString();
      let phone_ymd_frequency = wx.getStorageSync(current_phone_ymd + '_frequency') || 0;
      if (phone_ymd_frequency >= 10){
        app.toast("验证码发送已达上限");
        return;
      }
      
      let that = this;
      http.postReq(app.globalData.config.REQUEST_URL+'/user/mobile/verify', { "mobile": that.data.input.telphone, "type": 3},function(res){
        if (res.code !== 0) {
          app.toast(res.msg);
          return
        }else{
          app.toast("验证码已发送");
          wx.setStorageSync(current_phone_ymd + '_frequency', phone_ymd_frequency + 1);
          var currentTime = 61,
            interval = setInterval(function () {
              currentTime--;
              that.setData({
                btn_code: false,
                time: currentTime
              })
              if (currentTime <= 0) {
                clearInterval(interval)
                that.setData({
                  btn_code: true
                })
              }
            }, 1000);
        }
      });
    } else {
      app.toast('电话号码错误')
    }
  }),

  //确定事件
  setPwdBtn: common.throttle(function () {
    let that = this;
    //手机验证码校验
    http.postReq(app.globalData.config.REQUEST_URL+'/user/validate/verify', { "mobile": that.data.input.telphone, "type": 3, "verifyCode": that.data.input.code },function(res){
      if (res.code === 0) {
        //设置密码
        let data = { "mobile": that.data.input.telphone, "passWord": that.data.input.password, "appId": app.globalData.config.APP_ID };
        http.postReq(app.globalData.config.REQUEST_URL_CREAT_PWD + '/authority/userInfo/setPassWord',data,function(res){
          if (res.code === 0) {
            app.toast("设置密码成功!")
            setTimeout(function () {
              app.goBack();
            }, 1000)
          } else {
            app.toast(res.msg)
          }
        });
      } else {
        app.toast("验证码错误")
      }
    });
  }),

  //数据校验
  checkOkInput: function () {
    if (common.checkPhone(this.data.input.telphone) && (this.data.input.code.length === 6) && (common.checkString(this.data.input.password)) && common.checkString(this.data.input.repassword) && (this.data.input.password === this.data.input.repassword)) {
      this.setData({
        okBtn: true
      });
      return
    }

    this.setData({
      okBtn: false
    });
    if (this.data.input.telphone.length > 0) {
      if (!common.checkPhone(this.data.input.telphone)) {
        app.toast('电话号码格式错误')
        return
      }
    }

    if (this.data.input.code.length > 0) {
      if (this.data.input.code.length != 6) {
        app.toast('验证码错误')
        return
      }
    }
    let pwd = false,
      repwd = false;
    if (this.data.input.password.length > 0) {
      if (!common.checkString(this.data.input.password)) {
        app.toast('请输入6-18位数字和字母!');
        return
      }
      pwd = true
    }

    if (this.data.input.repassword.length > 0) {
      if (!common.checkString(this.data.input.repassword)) {
        app.toast('请输入6-18位数字和字母!!');
        return
      }
      repwd = true
    }

    if (pwd && repwd) {
      if (this.data.input.password != this.data.input.repassword) {
        app.toast('两次密码不一致')
        return
      }
    }
    return
  }
})