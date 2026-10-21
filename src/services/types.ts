

// ==================== 请求参数类型 ====================

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应：data 即为用户信息 */
export type LoginResult = UserBaseInfo

/** 注册请求参数 */
export interface RegisterParams {
  username: string
  password: string
  checkPassword: string
}



// 用户登录注册相关的类
export type UserBaseInfo = {
  /** 用户 UID（后端字段为 uid） */
  uid: number
  nickname: string
  sex: number
  /** 后端字段为 birthDay */
  birthDay?: string
  birthday?: string
  activeStatus: number
  avatar: string | null
  ipInfo: Record<string, unknown> | null
  signature: string
  createTime: string
  userFollowInfo:UserFollowInfo
  userLvInfo:UserLvInfo
  userWalletResp:UserWalletInfo
}

type UserFollowInfo={
  followCount:number,
  fansCount:number
}
type UserLvInfo={
  level:number,
  needAddExp:number,
  totalExp:number,
  levelName:string 
}
type UserWalletInfo={
  coin:number,
  bcoin:number
}


// 修改用户信息
// 1. 修改签名请求体
export type UpdateSignatureReq = {
  signature: string
}

// 2. 修改头像请求体
export type UpdateAvatarReq = {
  avatar: string
}

// 3. 修改昵称请求体
export type UpdateNicknameReq = {
  nickname: string
}



/**关注分组 */

export type FollowGroupType = {
  
}


/** 个人空间 VO（对齐后端 UserSpaceVO） */
export interface UserSpaceVO {
  uid: number
  nickname?: string
  avatar?: string
  birthday?: string | null
  level?: number
  signature?: string
  followCount?: number
  fansCount?: number
  likeCount?: number
  playCount?: number
  showFollowList?: boolean
  showFansList?: boolean
  followed?: boolean
}

/** 关注/粉丝列表行（对齐后端 UserSimpleVO） */
export interface UserSimpleVO {
  uid: number
  nickname?: string
  avatar?: string
  signature?: string
  level?: number
  followed?: boolean
  isMutualFollow?: boolean
}

/** 隐私开关（对齐后端 UserPrivacyReq，Boolean） */
export interface UserPrivacyVO {
  showCollect?: boolean
  showBirthdayAndTag?: boolean
  showComic?: boolean
  showBangumi?: boolean
  showSchoolInfo?: boolean
  showFansDecorate?: boolean
  showCoinVideo?: boolean
  showGame?: boolean
  showLiveReplay?: boolean
  showLikeVideo?: boolean
  showFansMedal?: boolean
  showClassVideo?: boolean
  showFollowList?: boolean
  showFansList?: boolean
  showChargeVideo?: boolean
}


export const SearchType = {
  VIDEO: 1,
  USER: 2,
  POST: 3,
  ANIME: 4,
  LIVE: 5,
  ARTICLE: 6,
} as const

/** 搜索请求参数（对齐后端 SearchEsReq） */
export interface SearchAllParams {
  keyword: string
  searchType: number
  sortCode?: number
  currentNum?: number
  pageSize?: number
}

/** 搜索返回中的用户项（对齐后端 UserVO / 控制台实际字段） */
export interface SearchUserItem {
  uid?: number
  UID?: number
  nickname?: string
  avatar?: string | null
  signature?: string | null
  sex?: number | null
  birthDay?: string | null
  activeStatus?: number | null
  ipInfo?: Record<string, unknown> | null
  videoCount?: number | null
  userFollowInfo?: {
    fansCount?: number | null
    followCount?: number | null
  } | null
  userLvInfo?: {
    level?: number | null
    levelName?: string | null
    needAddExp?: number | null
    totalExp?: number | null
  } | null
}

/** 搜索返回中的专栏/文章项（对齐后端 ArticleSearchVO） */
export interface SearchArticleItem {
  articleId?: number
  category?: number
  title?: string
  cover?: string
  summary?: string
  tag?: string
  userId?: number
  authorNickname?: string
  likeCount?: number
  commentCount?: number
  clickCount?: number
  publishTime?: string
}

/** 预留：视频等后续后端补齐字段 */
export interface SearchVideoItem {
  videoId?: number
  title?: string
  cover?: string
  playCount?: number
  danmakuCount?: number
  authorNickname?: string
  publishTime?: string
}

export interface SearchAllResult {
  userList?: SearchUserItem[]
  articleList?: SearchArticleItem[]
  videoList?: SearchVideoItem[]
  currentNum?: number
  pageSize?: number
}

export interface UserFollowReq{
  followId?:number
}









// 聊天功能相关的类型定义

export interface ContactItemVO{
    roomId?: number
  roomType?: number   // 1群 2单聊
  name?: string
  avatar?: string | null
  peerUid?: number | null
  lastMsgId?: number
  lastContent?: string
  unreadCount?: number
  activeTime?: string
}

export interface ChatMessageVO{
  msgId?:number
  roomId?:number
  fromUid?:number
  content?:string
  type?:number
  createTime?:string
  fromNickname?:string
  fromAvatar?:string
  
}

/** 群资料（对应后端 domain/vo/response/GroupInfoVO） */
export interface GroupInfoVO {
  roomId: number
  groupName: string
  groupAvatar?: string | null
  /** 群主 uid */
  userId?: number | null
  /** 群公告 */
  notice?: string | null
  memberCount?: number
  createTime?: string
  updateTime?: string
}
/** 群成员（对应后端 domain/vo/chat/GroupMemberVO） */
export interface GroupMemberVO {
  uid: number
  name: string
  avatar?: string | null
  /** 1 群主 2 管理员 3 普通成员 */
  role: number
  /** 1 在群 3 已移出 */
  status: number
}
//  表情包管理模块
