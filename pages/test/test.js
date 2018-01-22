// pages/test/test.js

const AV = require('../../utils/av-weapp-min');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanCodeBase64: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.userInfo',
        success({ errMsg }) {
          if (errMsg == "authorize:fail auth deny") {
            reject()
          } else {
            resolve()
          }
        },
        fail() {
          reject()
        }
      })
    }).then((res) => {
      console.log('success')
    }, wx.showModal({
      title: '提示',
      content: '很抱歉，访问需要授权！如何重新授权：删除小程序后重新进入',
      showCancel: false,
      confirmText: '好的',
      confirmColor: '#FD544A',
      complete() {
        wx.reLaunch({
          url: "../DayRecommended/DayRecommended",
        })
      }
    }))
  }
})

