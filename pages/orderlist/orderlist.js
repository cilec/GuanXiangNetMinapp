// pages/orderlist/orderlist.js
const { config } = require('../../config/config');
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */

  data: {
    record: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    wx.authorize({
      scope: 'scope.userInfo',
      success({ errMsg }) {
        if (errMsg == "authorize:fail auth deny") {
          wx.showModal({
            title: '提示',
            content: '很抱歉，访问需要授权！如何重新授权：删除小程序后重新进入',
            showCancel: false,
            confirmText: '好的',
            confirmColor: '#FD544A',
            success() {
              wx.navigateBack()
            }
          })
        } else {
          let uid = parseInt(app.getUserID());
          getRecord(self, uid);

        }
      }
    })
  },
  onShow: function () {
    let uid = parseInt(app.getUserID());
    getRecord(self, uid);
  }

})
function getRecord(ctx, uid) {
  let query = new wx.BaaS.Query()
  query.compare('created_by', '=', uid)
  let PurchaseRecord = new wx.BaaS.TableObject(config.BAAS.ARTICLEPURCHASE_RECORD_TABLE_ID)
  return PurchaseRecord.setQuery(query).find().then(res => {
    return res.data.objects.map(item => {
      // let created_at = util.formatTime(new Date(item.created_at * 1000));
      let content_info = JSON.parse(item.content_info)
      let created_at = util.formatTime(new Date(content_info.created_at * 1000))
      return {
        content_id: item.content_id,
        created_at,
        title: content_info.title
      }
    })
  }).then(res => {
    console.log(res)
    ctx.setData({ record: res })
  })
}