// 封装并且修改 axios 的请求，并导出
import axios from 'axios'
import { message } from 'ant-design-vue'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 业务成功码：兼容 0 / 200 */
function isBizSuccess(code: unknown) {
  return code === 0 || code === 200
}

/** 从后端响应 / 异常里取出可读文案 */
function pickMsg(data: any, fallback = '请求出错') {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return data.msg || data.message || data.description || fallback
}

/**
 * 核心修改部分：提取 Header 并自动附带 bili_user_info 里的凭证
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const userInfoStr = localStorage.getItem('bili_user_info')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      // 1. 如果包含 token，带上 Token
      const token = userInfo.token || userInfo.accessToken
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      // 2. 如果包含 uid，也塞进 Header（供后端直接读取或兜底）
      if (userInfo.uid) {
        headers['uid'] = String(userInfo.uid)
      }
      console.log(headers)
    } catch (e) {
      console.error('解析 bili_user_info 失败:', e)
    }
  }

  return headers
}

function request<T extends Record<string, any>>(url: string, data: T, method: HttpMethod) {
  return axios({
    url,
    method,
    headers: getHeaders(), // 👈 替换原来固定的 headers
    ...(method.toUpperCase() === 'GET' ? { params: data } : { data }),
  })
    .then((res) => {
      const body = res.data
      if (body && typeof body === 'object' && 'code' in body && !isBizSuccess(body.code)) {
        const errMsg = pickMsg(body, '操作失败')
        message.error(errMsg)
        return Promise.reject(body)
      }
      return body
    })
    .catch((err) => {
      if (err && typeof err === 'object' && 'code' in err && !err.response) {
        throw err
      }
      message.error(pickMsg(err?.response?.data, err?.message || '请求出错'))
      throw err
    })
}

export const get = <T = Record<string, any>>(url: string, params?: T) =>
  request(url, (params ?? {}) as Record<string, any>, 'GET')

export const post = <T = Record<string, any>>(url: string, data?: T) =>
  request(url, (data ?? {}) as Record<string, any>, 'POST')

export const put = <T = Record<string, any>>(url: string, data?: T) =>
  request(url, (data ?? {}) as Record<string, any>, 'PUT')

export default { get, post, put, request }