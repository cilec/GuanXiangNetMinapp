const { config } = require('../../config/config.js')
const wxParser = require('../../wxParser/index');
const app=getApp()
module.exports.details_utils = {
  render, addPurchaseRecord
}
function render(ctx, richTextId) {
  let richTextID = parseInt(richTextId);
  let objects = { richTextID }
  wx.BaaS.getContent(objects).then(res => {
    wxParser.parse({
      bind: 'richText',
      html: res.data.content,
      target: ctx,
      enablePreviewImage: false, // 禁用图片预览功能
      tapLink: (url) => { // 点击超链接时的回调函数
        // url 就是 HTML 富文本中 a 标签的 href 属性值
        // 这里可以自定义点击事件逻辑，比如页面跳转
        // wx.navigateTo({
        //   url
        // });
      }
    });
    wx.hideLoading()
  }).catch(err => console.log(err))
}

function addPurchaseRecord({transaction_no, richTextID,content_info}) {
  let ArticlePurchaseRecord = new wx.BaaS.TableObject(config.BAAS.ARTICLEPURCHASE_RECORD_TABLE_ID);
  let articlePurchaseRecord = ArticlePurchaseRecord.create();
  let data = {
    content_id: richTextID,
    transaction_no: transaction_no,
    content_info
  }
  articlePurchaseRecord.set(data).save().then(res => {
    wx.redirectTo({
      url: `/pages/details/details?id=${richTextID}`,
    })
    // details_utils.render(getCurrentPages().pop(), richTextID)
  })
}