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

  },
  share() {
    let paramsJson = {};
    let that = this;
    AV.Cloud.run('getScanCode', paramsJson).then(res => {
      console.log(res);
      let QRcodeUrl = res.url;
      drawShareImage('12.1足球竞猜数据', '28元', QRcodeUrl)
    }).catch(err => console.log(err))

  }
})
function drawShareImage(title, price, qrCodeUrl) {
  const ctx = wx.createCanvasContext('myCanvas');
  let { windowWidth } = wx.getSystemInfoSync();
  let radio = windowWidth / 750;
  let { avatarUrl } = wx.BaaS.storage.get('userinfo')
  //画头像
  ctx.drawImage(avatarUrl, windowWidth / 2 - 40, 10, 80, 80);
  //把头像画成圆形
  ctx.setLineWidth(20);
  ctx.setStrokeStyle('white')
  //线条宽度为20，那么半径就等于线条宽度一半加图片宽度一半
  ctx.arc(windowWidth / 2, 50, 50, 0, 2 * Math.PI)
  ctx.stroke()
  //画标题
  ctx.setFillStyle('red')
  ctx.fillRect(windowWidth / 2 - windowWidth * 0.7 / 2, 110, windowWidth * 0.7, 14 / radio)
  ctx.setFontSize(10 / radio)
  ctx.setTextBaseline('middle')
  ctx.setTextAlign('center')
  ctx.setFillStyle('white')
  ctx.fillText(title, windowWidth / 2, 110 + 7 / radio)
  //画价格
  ctx.setFillStyle('red');
  ctx.setFontSize(18 / radio);
  ctx.fillText(price, windowWidth / 2 - windowWidth * 0.7 / 4, 250)
  //画二维码
  ctx.drawImage(qrCodeUrl, windowWidth / 2, 250 - 75, 150, 150)
  ctx.draw()
}