// pages/test/test.js

const AV = require("../../utils/av-weapp-min");
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    checkAuthorize().then(res=>{
      if(!res){

      }
    })
    wx.showModal({
      title: "提示",
      content: "很抱歉，访问需要授权！请删除小程序后重新进入",
      showCancel: false,
      confirmText: "好的",
      confirmColor: "#FD544A",
      complete() {
        wx.reLaunch({
          url: "../DayRecommended/DayRecommended"
        });
      }
    });
  }
});
function checkAuthorize() {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: "scope.userInfo",
      success({ errMsg }) {
        if (errMsg == "authorize:ok") {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail() {
        resolve(false);
      }
    });
  });
}
