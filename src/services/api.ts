// 这是一个负责给前端提供API的文件
import { get, post, put, postForm } from './request'
import urls from './urls'
import type { UserBaseInfo, UpdateSignatureReq } from './types'

/**
 * 后端 SearchTypeEnum
 * VIDEO(1) USER(2) POST(3) ANIME(4) LIVE(5) ARTICLE(6)
 */
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

// ==================== 通用类型 ====================

/** API 通用响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

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

// ==================== 认证 API ====================

/** 用户登录 */
export function userLogin(params: LoginParams) {
  return post(urls.userLogin, params) as Promise<ApiResponse<LoginResult>>
}

/** 用户注册 */
export function userRegister(params: RegisterParams) {
  // 若后端注册成功也返回用户信息，可直接当登录态用
  return post(urls.userRegister, params) as Promise<ApiResponse<UserBaseInfo | null>>
}

/** 用户登出 */
export function userLogout() {
  return post(urls.userLogout) as Promise<ApiResponse>
}


/** 用户修改个性签名 */
export function changeSignature(params: UpdateSignatureReq){
  return put(urls.changeUserSignature,params) as Promise<ApiResponse>
}
export function changeSex(params: {sex:number}){
  return put(urls.changeUserSex,params) as Promise<ApiResponse>
}
export function changeBirthday(params: {birthday:string}){
  //传过来是string类型的日期，后端自动转成时间戳
  return put(urls.changeUserBirthday,params) as Promise<ApiResponse>
}
// export function changeAvatar(params: UpdateAvatarReq){
//   return put(urls.changeUserAvatar,params) as Promise<ApiResponse>
// }

/** 上传头像文件，对应后端 @RequestParam("file") MultipartFile file */
export function uploadAvatarFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return postForm(urls.uploadUserAvatar, formData) as Promise<ApiResponse<string>>
}
export function changeNickname(params: {nickname:string}){
  return put(urls.changeUserNickname,params) as Promise<ApiResponse>  
}

/** 关注 / 取消关注（后端 toggle），body 只需被关注者 u_id */
export function followUser(params: { followId: number }) {
  return post(urls.userFollow, params) as Promise<ApiResponse<boolean>>
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

/** 个人空间主页 */
export function getUserSpace(targetUid: number) {
  return get(urls.userSpace(targetUid)) as Promise<ApiResponse<UserSpaceVO>>
}

/** 查自己隐私设置 */
export function getMyPrivacy() {
  return get(urls.userPrivacyGet) as Promise<ApiResponse<UserPrivacyVO>>
}

/** 更新隐私设置 */
export function updatePrivacy(body: UserPrivacyVO) {
  return put(urls.userPrivacyUpdate, body) as Promise<ApiResponse<boolean>>
}

/** 关注列表 */
export function listFollows(targetUid: number, page = 1, size = 24) {
  return get(urls.userFollows(targetUid), { page, size }) as Promise<ApiResponse<UserSimpleVO[]>>
}

/** 粉丝列表 */
export function listFans(targetUid: number, page = 1, size = 24) {
  return get(urls.userFans(targetUid), { page, size }) as Promise<ApiResponse<UserSimpleVO[]>>
}

/**
 * 统一搜索接口 POST /api/search/all
 * 通过 searchType 区分：视频/用户/帖子/番剧/直播/专栏
 */
export function searchAll(params: SearchAllParams) {
  return post(urls.searchAll, params) as Promise<ApiResponse<SearchAllResult>>
}

// ==================== 默认导出 ====================
export default {
  userLogin,
  userRegister,
  userLogout,
  changeSignature,
  changeBirthday,
  searchAll,
  followUser,
  getUserSpace,
  getMyPrivacy,
  updatePrivacy,
  listFollows,
  listFans,
  // changeAvatar
}
