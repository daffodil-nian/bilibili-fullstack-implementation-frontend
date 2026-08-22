// 这是一个负责给前端提供API的文件
import { post, put, postForm } from './request'
import urls from './urls'
import type { UserBaseInfo,UpdateSignatureReq,UpdateAvatarReq } from './types'

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
// ==================== 默认导出 ====================
export default {
  userLogin,
  userRegister,
  userLogout,
  changeSignature,
  changeBirthday,
  // changeAvatar
}
