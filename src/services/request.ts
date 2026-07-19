// 封装并且修改axios的请求,并导出
import axios from "axios";

import { message } from 'ant-design-vue'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * @param {string} url 接口路径
 * @param {object} data 参数
 * @param {string} method 请求方式 GET/POST/PUT/DELETE
 */
function request<T extends Record<string, any>>(url: string, data: T, method: HttpMethod) {
  return axios({
    // baseURL: BASE_URL,
    url,
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    ...(method.toUpperCase() === 'GET' ? { params: data } : { data })
  }).catch(err => {
    const errMsg = err.response?.data?.msg || '请求出错'
    message.error(errMsg)
    throw err
  })
}

export const get = <T = Record<string, any>>(url: string, params?: T) => request(url, (params ?? {}) as Record<string, any>, 'GET')
export const post = <T = Record<string, any>>(url: string, data?: T) => request(url, (data ?? {}) as Record<string, any>, 'POST')
export default { get, post, request }
