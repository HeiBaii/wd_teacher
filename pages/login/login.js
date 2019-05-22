//index.js
//获取应用实例
const app = getApp()
var common = require('../../utils/common.js')
var http = require('../../utils/http.js');

Page({
  data: {
    avatar: '../../images/jw_logo.png',
    isShowPassword: false,
    isShowShade: true,
    loginBtn: false,
    input: {
      telphone: "",
      password: ""
    },
    clear_icon: {
      telphone: false,
      password: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userInfo = wx.getStorageSync('userInfo') || false,
      loginInfo = wx.getStorageSync('login') || false;
    if (userInfo && loginInfo) {
      this.setData({
        input: {
          "telphone": loginInfo.userName,
          "password": loginInfo.userPassword
        },
        loginBtn: true,
      })
      this.jumpPage(userInfo.userRoles)
    }
  },

  //分享
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      'title': '文都伴学',
      'path': '/pages/login/login',
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {
        console.log(res)
      }
    }
  },

  //显示/隐藏密码
  toggleShowPassword: function(e) {
    var isShowPassword = !this.data.isShowPassword;
    this.setData({
      isShowPassword: isShowPassword,
    });
  },

  //显示/隐藏确认密码
  toggleConfirmPassword: function(e) {
    var isConfirmPassword = !this.data.isConfirmPassword;
    this.setData({
      isConfirmPassword: isConfirmPassword
    });
  },


  //获取焦点 显示删除图标
  bindFocus: function(e) {
    let key = e.currentTarget.dataset.key,
      clear_icon = this.data.clear_icon;
    if (e.detail.value.length > 0) {
      clear_icon[key] = true
      this.setData({
        clear_icon: clear_icon
      })
    }
  },

  //绑定输入事件
  bindInput: function(e) {
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

  //失去焦点事件,隐藏删除图标
  bindBlur: function(e) {
    let val = e.detail.value,
      key = e.currentTarget.dataset.key,
      clear_icon = this.data.clear_icon;
    clear_icon[key] = false;
    this.setData({
      clear_icon: clear_icon,
    });
    this.checkOkInput();
  },

  //删除输入
  onDeleteInput: function(e) {
    let key = e.currentTarget.dataset.key,
      input = this.data.input,
      clear_icon = this.data.clear_icon;
    clear_icon[key] = false;
    input[key] = "";
    this.setData({
      input: input,
      okBtn: false,
      clear_icon: clear_icon
    })
  },

  //登录
  logbtn: common.throttle(function() {
    let that = this;
    if (!common.checkPhone(this.data.input.telphone)) {
      app.toast("电话号码错误")
    } else if (!common.checkString(this.data.input.password)) {
      app.toast("密码错误")
    } else {
      let login = {
        "loginType": 1,
        "userName": that.data.input.telphone,
        "userPassword": that.data.input.password
      };
      //登录
      that.login_request(login)
    }
  }),

  login_request(loginInfo) {
    let that = this;
    http.postReq(app.globalData.config.REQUEST_URL + '/user/jw/login', loginInfo, function(res) {
      if (res.code === 0) {
        wx.setStorageSync('login', loginInfo);
        let token = res.data;
        wx.setStorageSync('token', token);
        http.getReq(app.globalData.config.REQUEST_URL_BUSINESS + '/sys/user/queryUserByPhone', function(res) {
          if (res.code == 0) {
            if ((res.data.state == 9) || (res.data.type == 9)){
              app.toast("账号已禁用");
              return;
            }
            wx.setStorageSync('userInfo', res.data);
            let userRoles = res.data.userRoles;
            that.jumpPage(userRoles);
          } else {
            app.toast(res.msg);
            return
          }
        });
      } else {
        app.toast(res.msg)
        return
      }
    });
  },

  //忘记密码
  bindForget: common.throttle(function() {
    wx.navigateTo({
      url: '../forget/forget',
    });
  }),
  creatPassword: common.throttle(function() {
    wx.navigateTo({
      url: '../creat/creat',
    });
  }),
  //数据校验
  checkOkInput: function() {
    if (common.checkPhone(this.data.input.telphone) && common.checkString(this.data.input.password)) {
      this.setData({
        loginBtn: true
      });
      return
    } else if (!common.checkPhone(this.data.input.telphone) && (this.data.input.telphone.length > 0)) {
      app.toast('电话号码格式错误')
      this.setData({
        loginBtn: false
      });
      return
    } else if (!common.checkString(this.data.input.password) && (this.data.input.password.length > 0)) {
      app.toast('请输入6-18位数字和字母');
      this.setData({
        loginBtn: false
      })
      return
    }
    this.setData({
      loginBtn: false
    })
    return
  },
  jumpPage: function(userRoles) {
    teachservice
    let teachservice = false,
      teacher = false;
    let userSelectedRole = wx.getStorageSync("userSelectedRole");

    if (userSelectedRole == '') {
      for (var i = 0; i < userRoles.length; i++) {
        if ((userRoles[i].roleCode == 'teachservice') || (userRoles[i].roleCode == 'director') || userRoles[i].roleCode == 'teachmanager') {
          teachservice = true;
        } else if ((userRoles[i].roleCode == 'ototeacher') || (userRoles[i].roleCode == 'teacher')) {
          teacher = true;
        }
      }
      if (teachservice && teacher) {
        wx.setStorageSync('roleS', true)
        //弹窗选择角色
        this.setData({
          isShowShade: false
        })
        return
      } else if (teachservice) {
        wx.setStorageSync('userSelectedRole', 'teachservice')
        wx.setStorageSync('roleS', false)
        wx.reLaunch({
          url: '/pages/jiaowu/home/home'
        });
        return
      } else if (teacher) {
        wx.setStorageSync('roleS', false)
        wx.setStorageSync('userSelectedRole', 'teacher')
        wx.reLaunch({
          url: '/pages/teach/home/home'
        })
      } else {
        app.toast("角色错误")
        return
      }
    } else if (userSelectedRole == 'teachservice') {
      teachservice = true;
      wx.reLaunch({
        url: '/pages/jiaowu/home/home'
      });
      return
    } else if (userSelectedRole == 'teacher') {
      teacher = true;
      wx.reLaunch({
        url: '/pages/teach/home/home'
      })
      return
    }
  },
  
  //弹窗角色选择跳转
  goJS: common.throttle(function() {
    wx.setStorageSync('userSelectedRole', 'teacher')
    wx.reLaunch({
      url: '/pages/teach/home/home'
    });
  }),
  goJW: common.throttle(function() {
    wx.setStorageSync('userSelectedRole', 'teachservice')
    wx.reLaunch({
      url: '/pages/jiaowu/home/home'
    });
  }),
})