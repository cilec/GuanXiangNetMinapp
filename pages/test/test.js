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
    var Config = new wx.BaaS.TableObject(21425);
    Config.find().then(res => {
      console.log(res)
      getAccessToken()
    }).catch(err => console.log(err))
    function getAccessToken(APPID, APPSECRET) {
      wx.BaaS.request({
        url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
      }).then(res => {
        console.log(res)
        return wx.BaaS.request({
          url: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${res.access_token}`,
          data: {
            scene: 'test',
            url: 'pages/index/index'
          }
        })
      }).then(res => {
        console.log(res)
      }).catch(err => console.log(err))
    }
  }
})