module.exports.config = {

  BAAS: {
    CLIENT_ID: '4c6b5ff798c8648a9884', // 通过知晓云管理后台获取 ClientID
    MEMBERPROFILE_TABLE_ID: 4167,
    ARTICLEPURCHASE_RECORD_TABLE_ID: 20159,
    CONTENT_TABLE_ID: 12002,
    FAVORITE_TABLE_ID: 22801,
    CONTENT_GROUP_ID: 1513696717083142
  },

  ROUTE: {

    IMG: {
      LOGO: '/resource/image/logo.png',
      UNLOGIN: '/resource/image/defaultavatar.png',
      ORDER_CHECKED: '/resource/image/checkbox_active.png',
      ORDER_UNCHECKED: '/resource/image/checkbox.png',
      DOT: '/resource/image/pager.png',
      DOT_ACTIVE: '/resource/image/pager-active.png',
    },

    PAGE: {
      INDEX: '/pages/index/index',
      ORDER: '/pages/order/order',
      PROFILE: '/pages/profile/profile'
    }
  },

}