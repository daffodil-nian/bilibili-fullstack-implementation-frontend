// 这是一个负责封装很多url的接口的文件

export default {
  // 和用户相关的接口
  userLogin: `/api/auth/login`,
  userRegister: `/api/auth/register`,
  userLogout: `/api/auth/logout`,
  changeUserSignature:`/api/user/update/signature`,
  // changeUserAvatar:`/api/user/update/avatar`,
  uploadUserAvatar:`/api/user/update/avatar`,
  changeUserNickname:`/api/user/update/nickname`,
  changeUserBirthday:`/api/user/update/birthday`,
  changeUserSex:`/api/user/update/sex`,
  /** 关注/取消关注（toggle） */
  userFollow: `/api/user/follow`,
  /** 个人空间主页 */
  userSpace: (uid: number | string) => `/api/user/${uid}/space`,
  /** 查自己隐私设置 */
  userPrivacyGet: `/api/user/search/privacy`,
  /** 更新隐私设置 */
  userPrivacyUpdate: `/api/user/update/privacy`,
  /** 关注列表 */
  userFollows: (uid: number | string) => `/api/user/${uid}/follows`,
  /** 粉丝列表 */
  userFans: (uid: number | string) => `/api/user/${uid}/fans`,
  /** 搜索（用户 Tab 等） */
  searchAll: `/api/search/all`,

  //可以获取到粉丝信息和关注信息数量的接口是，/{targetUid}/space，


  /**
   * 
   * 单聊功能
   */
  chatContacts: `/api/chat/contacts`,
  chatMessages: `/api/chat/messages`,
  chatRead: `/api/chat/read`,
  chatSendText:`/api/chat/send/text`

}