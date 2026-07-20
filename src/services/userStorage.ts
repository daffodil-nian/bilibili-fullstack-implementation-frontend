import type { UserBaseInfo } from './types'

const USER_KEY = 'bili_user_info'

/** 登录成功后写入 localStorage */
export function saveUserInfo(user: UserBaseInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** 读取本地登录用户；没有则返回 null */
export function getUserInfo(): UserBaseInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserBaseInfo
  } catch {
    return null
  }
}

/** 退出登录时清除 */
export function clearUserInfo() {
  localStorage.removeItem(USER_KEY)
}
