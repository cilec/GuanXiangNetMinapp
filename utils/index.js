const { config } = require('../config/config.js')
const { formatTimeToLocalDate } = require('./util.js')
let getUserProfile = (ctx, cb) => {
  let tableId = config.BAAS.MEMBERPROFILE_TABLE_ID,
    Users = new wx.BaaS.TableObject(tableId),
    uid = Number(wx.BaaS.storage.get('uid'))

  let query = new wx.BaaS.Query()
  query.compare('created_by', '=', uid)

  Users.setQuery(query)
    .find()
    .then(res => cb(res))
    .catch(err => console.dir(err))
}

let addUser = (data, ctx) => {
  let tableId = config.BAAS.MEMBERPROFILE_TABLE_ID,
    Users = new wx.BaaS.TableObject(tableId),
    User = Users.create()

  return User.set(data).save()
}

let updateUser = (params) => {
  let tableId = config.BAAS.MEMBERPROFILE_TABLE_ID,
    { level, expireDate, memberID } = params

  // let is_member = params.is_member ? params.is_member : false

  let Users = new wx.BaaS.TableObject(tableId),
    User = Users.getWithoutData(memberID)

  let data = {
    expireDate, level
  }

  User.set(data)

  return User.update()

}
//获取推荐文章
function getRecommands({ currentPage, pageIndex }) {
  let articleList = currentPage.data.articles ? currentPage.data.articles : [];
  pageIndex = !pageIndex ? 0 : pageIndex;
  let footballContentGroupID = 1513696717083142
  let FootballContentGroup = new wx.BaaS.ContentGroup(footballContentGroupID)
  let query = new wx.BaaS.Query()
  query.arrayContains('categories', [1513696986609306])
  FootballContentGroup.setQuery(query).orderBy('-created_at').limit(5).offset(pageIndex * 5)
    .find().then(res => {
      console.log(res)
      for (let item of res.data.objects) {
        item.created_at = formatTimeToLocalDate(new Date(item.created_at * 1000))
        articleList = [...articleList, item]
      }
      currentPage.setData({
        articles: articleList,
        pageIndex: pageIndex+1
      })
      //把文章存到本地
      wx.setStorage({
        key: 'articles',
        data: articleList,
      })
    }).catch(err => console.log(err))
}
// function getTodayNewArticleList({ category_id, currentPage }) {
//   //今天的日期
//   const start = new Date(new Date(new Date().toLocaleDateString()).getTime());
//   let objects = { category_id }
//   let articleList = []
//   //  let contentList = new wx.BaaS.TableObject(tableID)
//   wx.BaaS.getContentList(objects).orderBy('-created_at').
//     then((res) => {
//       for (let item of res.data.objects) {
//         if (item.created_at * 1000 > start) {
//           item.created_at = formatTimeToLocalDate(item.created_at)
//           articleList = [item, ...articleList]
//         }
//       }
//       currentPage.setData({ articles: articleList })
//       wx.setStorage({
//         key: 'articles',
//         data: articleList,
//       })
//     })
// }

function isExpireOut(uid) {
  let query = new wx.BaaS.Query()
  let MemberProfile = new wx.BaaS.TableObject(config.BAAS.MEMBERPROFILE_TABLE_ID);
  query.compare('created_by', '=', parseInt(uid));
  MemberProfile.setQuery(query).find().then(res => {
    return res.data.objects[0]
  }).then(res => {
    if ((Date.now()) > (Date.parse(res.expireDate))) {
      updateUser({
        level: 0,
        memberID: res.id
      })
    }
  }).catch(err => console.log(err))
}
module.exports.utils = {
  isExpireOut,
  getUserProfile,
  addUser,
  updateUser,
  getRecommands
}