const AV = require('./utils/av-weapp-min');

AV.init({
  appId: 'rEBIu4a9dIGMRAyPAgGt475n-gzGzoHsz',
  appKey: 'GssmPQgqgAJwq8QAqzwERn2H',
});
//app.js
const { config } = require('config/config.js');
const { utils } = require('utils/index.js');
App({
  onLaunch: function () {
    let that = this
    // 引入 BaaS SDK
    require('./utils/sdk-v1.1.1')
    const clientID = config.BAAS.CLIENT_ID
    wx.BaaS.init(clientID)
    let uid = this.getUserID()
    if (!uid) {
      wx.BaaS.login().then(res => {
        console.log(res)
        //判断下是否已有用户，没有就新建用户
        let tableId = config.BAAS.MEMBERPROFILE_TABLE_ID,
          Users = new wx.BaaS.TableObject(tableId),
          uid = Number(res.id);
        let query = new wx.BaaS.Query()
        query.compare('created_by', '=', uid);
        return Users.setQuery(query).find()
      }).then(res => {
        if (res.data.objects.length == 0) {
          let data = {
            level: 0,
          }
          utils.addUser(data)
        }
      }).catch(err => console.log(err))
    } else {
      utils.isExpireOut(uid)
    }
  },
  getUserID() {

    if (this.uid) {
      return this.uid
    }

    let uid = wx.BaaS.storage.get('uid')
    this.uid = uid

    return uid
  },

  getUserInfo() {
    if (this.userInfo) {
      return this.userInfo
    }


    let userInfo = wx.BaaS.storage.get('userinfo')
    this.userInfo = userInfo

    return userInfo
  },
  getPageStack() {
    const currentPages = getCurrentPages()
  }
})