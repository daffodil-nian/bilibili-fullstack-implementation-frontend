// 这是一个负责给前端提供API的文件
import { get, post, put, postForm } from './request'
import urls from './urls'
import type { UserBaseInfo, UpdateSignatureReq, UserFollowReq } from './types'
import type {UserSpaceVO,UserPrivacyVO, UserSimpleVO, SearchAllParams, SearchAllResult,LoginParams,LoginResult,RegisterParams} from './types'
import { updateUserField } from './userStorage'
export { SearchType } from './types'
export type {
  SearchArticleItem,
  SearchUserItem,
  SearchVideoItem,
  UserSimpleVO,
  UserPrivacyVO,
  UserFollowReq
  // ...
} from './types'

/**
 * 后端 SearchTypeEnum
 * VIDEO(1) USER(2) POST(3) ANIME(4) LIVE(5) ARTICLE(6)
 */


// ==================== 通用类型 ====================

/** API 通用响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
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
export function followUser(params: UserFollowReq) {
/*
把这个也改改，改成用计算属性
const followCount = computed(() => {
  if (isSelf.value) return currentUser.value?.userFollowInfo?.followCount ?? 0
  return otherSpace.value?.followCount ?? 0
})

export function updateUserField<K extends keyof UserBaseInfo>(
  field:K,
  value:UserBaseInfo[K]
)
  即时修改这个
*/
// updateUserField('userFollowInfo',{});
  return post(urls.userFollow, params) as Promise<ApiResponse<boolean>>
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
