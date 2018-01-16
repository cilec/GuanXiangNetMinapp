// pages/test/test.js

const AV = require('../../utils/av-weapp-min');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    codeUrl: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  share() {
    let paramsJson = { details: 1 };
    let that = this;
    AV.Cloud.run('getScanCode', paramsJson).then(res => {
      console.log(res);
      that.setData({ codeUrl: res.url })
      let ctx = wx.createCanvasContext('myCanvas')
      ctx.drawImage(res.url, 0, 0, 150, 150)
      ctx.draw()
    }).catch(err => console.log(err))

  }
})