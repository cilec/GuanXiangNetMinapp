// pages/test/test.js

const AV = require('../../utils/av-weapp-min');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanCodeBase64:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  share() {
    let paramsJson = {};
    let that = this;
    AV.Cloud.run('getScanCode', paramsJson).then(res => {
      console.log(res);
      that.setData({ scanCodeBase64: res })
    }).catch(err => console.log(err))

  }
})