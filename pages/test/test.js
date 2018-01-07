// pages/test/test.js
let shareOptions = { "from": "menu" }
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  share() {
    let that = this;
    var Config = new wx.BaaS.TableObject(21425);
    Config.find().then(res => {
      console.log(res.data.objects[0])
      getAccessToken(res.data.objects[0].appid, res.data.objects[0].appsecret)
    }).catch(err => console.log(err))
    function getAccessToken(APPID, APPSECRET) {
      wx.BaaS.request({
        url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
      }).then(res => {
        console.log(res)
        return wx.BaaS.request({
          // url: `https://api.weixin.qq.com/wxa/getwxacode?access_token=${res.data.access_token}`,
          url: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${res.data.access_token}`,
          method: 'POST',
          data: {
            "scene": "test",
            "auto_color": true
          }
        })
      }).then(res => {
        console.log(res)
       that.setData({imgData:wx.arrayBufferToBase64(res.data)})
      }).catch(err => console.log(err))
    }
  }
})