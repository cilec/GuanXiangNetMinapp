let app = getApp();
const wxParser = require('../../wxParser/index');
const { config } = require('../../config/config.js')
const { details_utils } = require('details_utils.js');
Page({
  data: {
    membership: {},
    hasFavorite: false
  },
  onLoad: function (objects) {
    // console.log('details', objects)
    let richTextID = objects.id;
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
            complete() {
              wx.reLaunch({
                url: "../DayRecommended/DayRecommended",
              })
            }
          })
        }
        else {
          wx.showLoading({
            title: '文章加载中',
          })
          self.checkFavorite(richTextID)
          let MyContentGroup = new wx.BaaS.ContentGroup(1513696717083142)
          MyContentGroup.getContent(richTextID).then(res => {
            if (res.data.is_free) {
              wxParser.parse({
                bind: 'richText',
                html: res.data.content,
                target: self,
                enablePreviewImage: false,
              })
              wx.hideLoading()
            } else {
              //获取用户类别判断是否包时长用户
              let uid = parseInt(app.getUserID())
              let query = new wx.BaaS.Query()
              let MemberProfile = new wx.BaaS.TableObject(config.BAAS.MEMBERPROFILE_TABLE_ID);
              query.compare('created_by', '=', uid);
              MemberProfile.setQuery(query).find().then(res => {
                self.setData({
                  membership: res.data.objects[0],
                  richTextID
                })
                if (res.data.objects[0].level == 0) {    //判断是否包月用户
                  let ArticlePurchaseRecord = new wx.BaaS.TableObject(config.BAAS.ARTICLEPURCHASE_RECORD_TABLE_ID);
                  let queryRecord = new wx.BaaS.Query();
                  queryRecord.compare('content_id', '=', richTextID);
                  let queryRecord1 = new wx.BaaS.Query();
                  queryRecord1.compare('created_by', '=', uid);
                  let queryAll = wx.BaaS.Query.and(queryRecord, queryRecord1);
                  ArticlePurchaseRecord.setQuery(queryAll).find().then(result => {    //查询是否已购买
                    wx.hideLoading()
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
                            params.totalCost = 0.01;//文章单价，正式上线记得改回来
                            params.merchandiseDescription = `文章${richTextID}`
                            params.merchandiseSchemaID = config.BAAS.CONTENT_TABLE_ID
                            params.merchandiseRecordID = objects.id
                            wx.BaaS.pay(params).then(res => {
                              console.log(res)
                              if (res.errMsg == "requestPayment:ok") {
                                let transaction_no = res.transaction_no;
                                wx.BaaS.getContent({ richTextID: richTextID }).then(res => {
                                  self.setData({ title: res.data.title })
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

        }
      }, fail() {
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
      }
    })


  },
  shareImage() {
    let self = this;
    let title = '';
    let articleList = wx.getStorageSync('articles');
    for (let item of articleList) {
      if (item.id == this.data.richTextID) {
        title = item.title
      }
    }
    wx.navigateTo({
      url: '../shareImage/shareImage?richTextID=' + self.data.richTextID + '&title=' + title,
    })
  },
  favorite() {
    let self = this;
    let { hasFavorite, richTextID } = this.data;
    richTextID = parseInt(richTextID)
    let query = new wx.BaaS.Query()
    let Favorite = new wx.BaaS.TableObject(config.BAAS.FAVORITE_TABLE_ID)
    query.compare('created_by', '=', parseInt(app.getUserID()))

    if (hasFavorite) {
      let favorite = Favorite.getWithoutData(self.data.favoritesID)
      favorite.remove('favorite_articles', richTextID).update().then(res => {
        handleResult(self, res)
      })
    } else {
      Favorite.setQuery(query).find().then((res) => {
        //用户还未收藏过任何文章
        if (res.data.objects.length == 0) {
          let record = { favorite_articles: [richTextID] }
          let newFavorite = new wx.BaaS.TableObject(config.BAAS.FAVORITE_TABLE_ID).create()
          newFavorite.set(record).save().then(res => {
            handleResult(self, res)
          })
        } else {  //用户已添加过文章
          let favorite = new wx.BaaS.TableObject(config.BAAS.FAVORITE_TABLE_ID).getWithoutData(res.data.objects[0].id)
          // let record = [richTextID, ...res.data.objects[0].favorite_articles]
          favorite.append('favorite_articles', richTextID).update().then(res => {
            handleResult(self, res)
          })
        }
      })
    }


  },
  checkFavorite(richTextID) {
    let self = this;
    let { hasFavorite } = this.data;
    richTextID = parseInt(richTextID)
    let query = new wx.BaaS.Query()
    let Favorite = new wx.BaaS.TableObject(config.BAAS.FAVORITE_TABLE_ID)
    query.compare('created_by', '=', parseInt(app.getUserID()))
    query.in('favorite_articles', [richTextID])
    Favorite.setQuery(query).find().then(res => {
      if (res.data.objects.length != 0) {
        wx.setStorageSync('favorites', res.data.objects[0].favorite_articles)
        console.log('favorites', res)
        self.setData({
          hasFavorite: true,
          favoritesID: res.data.objects[0].id
        })
      }
    }).catch(err => console.log(err))
  }
})
function handleResult(currentpage, res) {
  currentpage.setData({
    hasFavorite: !currentpage.data.hasFavorite,
    favoritesID: res.data.id
  })
  wx.setStorageSync('favorites', res.data.favorite_articles)
  console.log(res)
}