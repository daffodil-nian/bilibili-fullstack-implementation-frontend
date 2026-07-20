// 封装并且修改 axios 的请求，并导出
import axios from 'axios'
import { message } from 'ant-design-vue'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 业务成功码：兼容 0 / 200 */
function isBizSuccess(code: unknown) {
  return code === 0 || code === 200
}

/** 从后端响应 / 异常里取出可读文案（对应 AssertUtil / BusinessException 的那句） */
function pickMsg(data: any, fallback = '请求出错') {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return data.msg || data.message || data.description || fallback
}

/**
 * @param url 接口路径
 * @param data 参数
 * @param method 请求方式 GET/POST/PUT/DELETE
 * @returns 后端 JSON 体，形如 { code, msg, data }
 */
function request<T extends Record<string, any>>(url: string, data: T, method: HttpMethod) {
  return axios({
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(method.toUpperCase() === 'GET' ? { params: data } : { data }),
  })
    .then((res) => {
      const body = res.data
      // HTTP 200，但业务失败（部分接口不抛异常，只返回 code != 0）
      if (body && typeof body === 'object' && 'code' in body && !isBizSuccess(body.code)) {
        const errMsg = pickMsg(body, '操作失败')
        message.error(errMsg)
        return Promise.reject(body)
      }
      return body
    })
    .catch((err) => {
      // 已经在 then 里处理并 reject 过的业务错误，不要重复弹窗
      if (err && typeof err === 'object' && 'code' in err && !err.response) {
        throw err
      }
      // 后端 throw BusinessException → 全局异常处理返回 4xx/5xx
      // 这里弹出异常里的那句 msg，例如「用户名或密码错误」
      message.error(pickMsg(err?.response?.data, err?.message || '请求出错'))
      throw err
    })
}

export const get = <T = Record<string, any>>(url: string, params?: T) =>
  request(url, (params ?? {}) as Record<string, any>, 'GET')

export const post = <T = Record<string, any>>(url: string, data?: T) =>
  request(url, (data ?? {}) as Record<string, any>, 'POST')

export default { get, post, request }
