// pages/test/test.js
let app = getApp();
const wxParser = require('../../wxParser/index');
const { config } = require('../../config/config.js')
// const { details_utils } = require('details_utils.js');



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
    let content;//保存文章内容
    let content_info;
    checkAuthorize().then(res => {
      ///用户已授权
      wx.showLoading({
        mask: true,
        title: '文章加载中……',
      })
      //获取文章
      let MyContentGroup = new wx.BaaS.ContentGroup(config.BAAS.CONTENT_GROUP_ID)
      return MyContentGroup.getContent(richTextID)
    }).then(res => {
      content_info = JSON.stringify({
        description: res.data.description,
        title: res.data.title,
        created_at: res.data.created_at
      })
      content = res.data.content
      thisPage.setData({ title: res.data.title })
      if (res.data.is_free) {
        //免费文章，直接渲染
        renderContent(thisPage, content)
        wx.hideLoading()
        return Promise.reject({ showModal: false })
      } else {
        //收费文章，获取会员信息
        let uid = parseInt(app.getUserID())
        let query = new wx.BaaS.Query()
        let MemberProfile = new wx.BaaS.TableObject(config.BAAS.MEMBERPROFILE_TABLE_ID);
        query.compare('created_by', '=', uid);
        return MemberProfile.setQuery(query).find()
      }
    }).then(res => {
      //比普通用户高级别用户（包月或管理员）
      if (res.data.objects[0].level > 0) {
        thisPage.setData({
          membership: res.data.objects[0],
          richTextID
        })
        renderContent(thisPage, content)
        wx.hideLoading()
        return Promise.reject({ showModal: false })
      } else { //普通会员，查询购买记录
        let ArticlePurchaseRecord = new wx.BaaS.TableObject(config.BAAS.ARTICLEPURCHASE_RECORD_TABLE_ID);
        let queryRecord = new wx.BaaS.Query();
        queryRecord.compare('content_id', '=', richTextID);
        let queryRecord1 = new wx.BaaS.Query();
        queryRecord1.compare('created_by', '=', uid);
        let queryAll = wx.BaaS.Query.and(queryRecord, queryRecord1);
        return ArticlePurchaseRecord.setQuery(queryAll).find()//查询用户是否已购买
      }
    }).then(res => {
      wx.hideLoading()
      if (result.data.objects.length == 1) {
        renderContent(thisPage, content)
        return Promise.reject({ showModal: false })
      } else {
        return new Promise((resolve, reject) => {
          wx.showModal({
            title: "提示",
            content: "观看文章需要支付28元",
            showCancel: true,
            cancelText: '放弃支付',
            confirmText: '确认支付',
            confirmColor: '#FD544A',
            success(res) {
              if (res.confirm) {
                resolve()
              } else {
                wx.reLaunch({
                  url: "../DayRecommended/DayRecommended"
                });
                reject({ showModal: false })
              }
            },
            fail() {
              wx.reLaunch({
                url: "../DayRecommended/DayRecommended"
              });
              reject({ showModal: false })
            }
          })
        })
      }
    }).then(res => {
      let params = {}
      params.totalCost = 28;//文章单价
      params.merchandiseDescription = `文章${richTextID}`
      params.merchandiseSchemaID = config.BAAS.CONTENT_TABLE_ID
      params.merchandiseRecordID = richTextID.toString()
      //调起支付
      return wx.BaaS.pay(params)
    }).then(res => {
      //根据是否返回transaction_no判断是否支付成功
      if (res.transaction_no) {
        let data = {
          richTextID: richTextID,
          transaction_no: res.transaction_no,
          content_info
        }
        let ArticlePurchaseRecord = new wx.BaaS.TableObject(config.BAAS.ARTICLEPURCHASE_RECORD_TABLE_ID);
        let articlePurchaseRecord = ArticlePurchaseRecord.create();
        return articlePurchaseRecord.set(data).save()
      } else {
        return Promise.reject({
          showModal: true,
          errMsg: '抱歉，支付失败！'
        })
      }
    }).then(res => {
      renderContent(thisPage, content)
      return Promise.reject({ showModal: false })
    }).catch(({ showModal, errMsg }) => {
      wx.hideLoading()
      console.error(new Error(errMsg))
      //错误处理
      finalHandle(showModal, errMsg)
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
          reject({
            showModal: true,
            errMsg: '很抱歉，访问需要授权！请删除小程序后重新进入'
          });
        }
      },
      fail() {
        reject({
          showModal: true,
          errMsg: '很抱歉，访问需要授权！请删除小程序后重新进入'
        });
      }
    });
  });
}
//内容渲染
function renderContent(ctx, content) {
  wxParser.parse({
    bind: 'richText',
    html: content,
    target: ctx,
    enablePreviewImage: false, // 禁用图片预览功能
  });
}
//错误处理，包括终止promise
function finalHandle(showModal, errMsg) {
  if (showModal) {
    wx.showModal({
      title: "提示",
      content: errMsg,
      showCancel: false,
      confirmText: "好的",
      confirmColor: "#FD544A",
      complete() {
        wx.reLaunch({
          url: "../DayRecommended/DayRecommended"
        });
      }
    });
  } else {
    return
  }
}