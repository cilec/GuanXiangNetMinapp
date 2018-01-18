// pages/DayRecommended/DayRecommended.js
const { utils } = require('../../utils/index.js')
const { formatTime, formatTimeToLocalDate } = require('../../utils/util.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    isLogin: false,
    isFirstCommit: true,
    date: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.showNavigationBarLoading()

    let date = new Date();
    date = formatTimeToLocalDate(date);
    this.setData({ date })
    this.getUserInfo()
    const category_id = 1513696986609306;
    utils.getTodayNewArticleList({ category_id, currentPage: this })
    let articles = this.data.articles.map(item => {
      item.created_at = formatTimeToLocalDate(item.created_at)
      return item
    })
    this.setData({
      articles
    })
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
  }
})