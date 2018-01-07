const { config } = require('../config/config.js')
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
function getTodayNewArticleList({ category_id, currentPage }) {
  // let testDate=new Date(2017,12,19,0);
  const start = new Date(new Date(new Date().toLocaleDateString()).getTime());
  // let category_id = 1513696986609306;
  let objects = { category_id }
  let articleList = []
  wx.BaaS.getContentList(objects).
    then((res) => {
      for (let item of res.data.objects) {
        if (item.created_at * 1000 > start) {
          articleList = [item, ...articleList]
        }
      }
      currentPage.setData({ articles: articleList })
    }).catch(err => console.log(err))
}

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
  getTodayNewArticleList
}