// pages/user/user.js
const { utils } = require('../../utils/index.js')
const util = require('../../utils/util.js')
const { config } = require('../../config/config.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profile: {},
    price: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            complete({ errMsg }) {
              console.log(errMsg)
              if (errMsg == "authorize:fail auth deny") {
                wx.showModal({
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
                })
              } else {
                getMembership(self)
                getPriceList(self)
              }
            }
          })
        } else {
          getMembership(self)
          getPriceList(self)
        }
      }
    })

  },
  payOrder(e) {

    let totalCost = e.currentTarget.dataset.price
    let merchandiseDescription = e.currentTarget.dataset.name
    let merchandiseSchemaID = 20265
    let merchandiseRecordID = e.currentTarget.dataset.id;
    let vipStartTime;
    if (this.data.memberLevel != 0) {
      vipStartTime = this.data.memberExpireDate;
    } else {
      vipStartTime = new Date();
    }
    let durationType = e.currentTarget.dataset.durationtype;
    let addDays;
    switch (durationType) {
      case 0:
        addDays = 29;
        break;
      case 1:
        addDays = 89;
        break;
      case 2:
        addDays = 183;
        break;
      case 3:
        addDays = 364;
        break;
      default:
        break;
    }
    let newExpireDate = ((new Date(Date.parse(vipStartTime) + addDays * 24 * 60 * 60 * 1000)).toISOString()).toString()
    let params = {
      totalCost,
      merchandiseDescription,
      merchandiseSchemaID,
      merchandiseRecordID
    }
    wx.BaaS.pay(params)
      .then(res => {
        console.log(res)
        utils.updateUser({
          memberID: this.data.memberID,
          level: 1,
          expireDate: newExpireDate
        }, this)
      }).then(() => {
        getMembership(this)
      }).catch(err => console.log(err))
  }
})
function getMembership(ctx) {
  let uid = parseInt(app.getUserID())
  let query = new wx.BaaS.Query()
  let MemberProfile = new wx.BaaS.TableObject(config.BAAS.MEMBERPROFILE_TABLE_ID);
  query.compare('created_by', '=', uid);
  MemberProfile.setQuery(query).find().then(res => {
    return res.data.objects[0]
  }).then((membership) => {
    console.log(membership)
    let memberDesc;
    switch (membership.level) {
      case 0:
        memberDesc = '普通用户非包月用户';
        break;
      case 1:
        memberDesc = '您的vip有效期至' + util.formatTime(new Date(membership.expireDate))
        break;
      default:
        memberDesc = '管理员';
        break;
    }
    ctx.setData({
      profile: wx.BaaS.storage.get('userinfo'),
      memberID: membership.id,
      memberDesc: memberDesc,
      memberExpireDate: membership.expireDate,
      memberLevel: membership.level
    })
  }).catch(err => console.log(err))
}
function getPriceList(ctx) {
  let query = new wx.BaaS.Query();
  query.exists('durationType')
  let Price = new wx.BaaS.TableObject(20265);
  Price.setQuery(query).find().then(res => {
    // console.log(res)
    return res.data.objects.map(item => {
      return {
        id: item.id,
        price: item.price,
        durationType: item.durationType,
        name: item.name
      }
    })
  }).then(res => {
    ctx.setData({ price: res })
  }).catch(err => { console.log(err) })
}