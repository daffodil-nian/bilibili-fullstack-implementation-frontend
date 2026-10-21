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
  chatSendText: `/api/chat/send/text`,
  chatCreateGroup: `/api/chat/group/create`,
  chatSendGroupText: `/api/chat/send/group/text`,

  /**
   * 群聊接口
   */

  
  // ==================== 群聊管理 ====================
  /** 群资料 */
  chatGroupInfo: (roomId: number | string) => `/api/chat/group/${roomId}`,
  /** 群成员列表 */
  chatGroupMembers: (roomId: number | string) => `/api/chat/group/${roomId}/members`,
  /** 改群名 */
  chatGroupName: (roomId: number | string) => `/api/chat/group/${roomId}/name`,
  /** 改群公告 */
  chatGroupNotice: (roomId: number | string) => `/api/chat/group/${roomId}/notice`,
  /** 上传群头像 */
  chatGroupAvatar: (roomId: number | string) => `/api/chat/group/${roomId}/avatar`,
  /** 邀请成员（POST 同一个 members 路径） */
  chatGroupInvite: (roomId: number | string) => `/api/chat/group/${roomId}/members`,
  /** 移出成员 */
  chatGroupKick: (roomId: number | string, targetUid: number | string) =>
    `/api/chat/group/${roomId}/members/${targetUid}/remove`,
  /** 退群 */
  chatGroupQuit: (roomId: number | string) => `/api/chat/group/${roomId}/quit`,
  /** 解散群 */
  chatGroupDissolve: (roomId: number | string) => `/api/chat/group/${roomId}/dissolve`,
  /** 设置管理员 */
  chatGroupRole: (roomId: number | string, targetUid: number | string) =>
    `/api/chat/group/${roomId}/members/${targetUid}/role`,

}