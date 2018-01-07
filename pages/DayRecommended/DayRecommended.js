// pages/DayRecommended/DayRecommended.js
const { utils } = require('../../utils/index.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    isLogin: false,
    isFirstCommit: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.showNavigationBarLoading()


    this.getUserInfo()
    const category_id = 1513696986609306;
    utils.getTodayNewArticleList({ category_id, currentPage: this })
  },
  getUserInfo() {
    setTimeout(() => {
      let userInfo = app.getUserInfo()

      if (wx.BaaS.storage.get('uid')) {
        userInfo = Object.assign(userInfo, {
          isLogin: true,
        })
        this.setData({ userInfo })
      }

      // 从 BaaS 获取用户进一步信息
      utils.getUserProfile(this, (res) => {
        let _userInfo = res.data.objects[0]
        Object.assign(userInfo, _userInfo)
        this.setData({
          userInfo
        })
      })
    }, 300)
    // setTimeout(() => {
    //   let { isFirstCommit, recordID } = this.data
    //   utils.getUserProfile(this, (res) => {
    //     if (res.data.meta.total_count != 0) {
    //       this.setData({
    //         isLogin: true,
    //         isFirstCommit: false,
    //         recordID: res.data.objects[0].id
    //       })
    //     } else {
    //       let data = {
    //         is_member: false,
    //         isProfileComplete: true,
    //         isFirstCommit: false,
    //       }
    //       utils.addUser(data, this)
    //         .then(res => {
    //           this.setData({
    //             isLogin: true,
    //             isFirstCommit: false,
    //           })
    //           // wx.hideNavigationBarLoading()
    //           console.log(res)
    //         }).catch(err => console.log(err))
    //     }
    //   })
    // }, 300)

  }


})