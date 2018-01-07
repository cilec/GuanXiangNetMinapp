let app = getApp();
const wxParser = require('../../wxParser/index');
const { config } = require('../../config/config.js')
const { details_utils } = require('details_utils.js');
Page({
  data: {},
  onLoad: function (objects) {
    // console.log(objects)
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
              wx.reLaunch({
                url: "../DayRecommended/DayRecommended",
              })
            }
          })
        }
      }
    })
    let richTextID = objects.id;
    let self = this
    //获取用户类别判断是否包时长用户
    let uid = parseInt(app.getUserID())
    let query = new wx.BaaS.Query()
    let MemberProfile = new wx.BaaS.TableObject(config.BAAS.MEMBERPROFILE_TABLE_ID);
    query.compare('created_by', '=', uid);
    MemberProfile.setQuery(query).find().then(res => {
      if (res.data.objects[0].level == 0) {    //判断是否包月用户
        let ArticlePurchaseRecord = new wx.BaaS.TableObject(config.BAAS.ARTICLEPURCHASE_RECORD_TABLE_ID);
        let queryRecord = new wx.BaaS.Query();
        queryRecord.compare('content_id', '=', richTextID);
        let queryRecord1 = new wx.BaaS.Query();
        queryRecord1.compare('created_by', '=', uid);
        let queryAll = wx.BaaS.Query.and(queryRecord, queryRecord1);
        ArticlePurchaseRecord.setQuery(queryAll).find().then(result => {    //查询是否已购买
          if (result.data.objects.length == 0) {
            wx.showModal({
              title: "提示",
              content: "观看文章需要支付28元",
              showCancel: true,
              cancelText: '放弃支付',
              confirmText: '确认支付',
              confirmColor: '#FD544A',
              success(res) {
                if (res.confirm) {
                  let params = {}
                  params.totalCost = 0.01
                  params.merchandiseDescription = `文章${richTextID}`
                  params.merchandiseSchemaID = config.BAAS.CONTENT_TABLE_ID
                  params.merchandiseRecordID = objects.id
                  wx.BaaS.pay(params).then(res => {
                    console.log(res)
                    if (res.errMsg == "requestPayment:ok") {
                      let transaction_no = res.transaction_no;
                      wx.BaaS.getContent({ richTextID: richTextID }).then(res => {
                        let data = {
                          richTextID: richTextID,
                          transaction_no: transaction_no,
                          content_info: JSON.stringify({
                            description: res.data.description,
                            title: res.data.title,
                            created_at: res.data.created_at
                          })
                        }
                        details_utils.addPurchaseRecord(data)
                      })
                      return
                    }
                  }).catch(err => {
                    console.log(err)
                    wx.reLaunch({
                      url: "../DayRecommended/DayRecommended",
                    })
                  })
                } else {
                  wx.reLaunch({
                    url: "../DayRecommended/DayRecommended",
                  })
                }
              }
            })
          } else {
            details_utils.render(self, richTextID)
          }
        })
      } else {
        details_utils.render(self, richTextID)
      }
    }).catch(err => console.log(err))
  }
})
