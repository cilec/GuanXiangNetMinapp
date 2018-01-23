// pages/test/test.js

const AV = require("../../utils/av-weapp-min");
const { config } = require("../../config/config.js")
const wxParser = require('../../wxParser/index');
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let richTextID = parseInt(options.id)
    let thisPage = this;
    checkAuthorize().then(res => {
      if (res) {
        wx.showLoading({
          mask: true,
          title: '文章加载中……',
        })
        let MyContentGroup = new wx.BaaS.ContentGroup(config.BAAS.CONTENT_GROUP_ID)
        return MyContentGroup.getContent(richTextID)
      } else {
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
    }).then(res => {
      if (res.data.is_free) {
        //渲染文章
        wxParser.parse({
          bind: 'richText',
          html: res.data.content,
          target: thisPage,
          enablePreviewImage: false, // 禁用图片预览功能
        });
        wx.hideLoading()
      }
    })
  }
});
//检测用户是否授权
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
