import Taro from '@tarojs/taro'
import { API_BASE_URL } from '../constants/api'
import { getToken, handleLoginExpired, isTokenExpired, getAuth, LOGIN_EXPIRED_MSG } from './auth'

const BASE_URL = API_BASE_URL
const BEARER_PREFIX = 'Bearer '

/**
 * 按后端规范组装 Authorization：Bearer <token>
 * 若本地已带 Bearer 前缀则去重，避免重复拼接。
 */
export function buildAuthorizationHeader(token) {
  if (!token || typeof token !== 'string') return ''
  const raw = token.trim()
  if (!raw) return ''
  const value = raw.startsWith(BEARER_PREFIX) ? raw.slice(BEARER_PREFIX.length).trim() : raw
  return value ? `${BEARER_PREFIX}${value}` : ''
}

function buildHeaders({ skipAuth, header }) {
  const headers = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (!skipAuth) {
    const authorization = buildAuthorizationHeader(getToken())
    if (authorization) {
      headers.Authorization = authorization
    }
  }

  return headers
}

function unwrapResponse(res) {
  const { statusCode, data } = res
  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`请求失败(${statusCode})`)
  }
  if (data && data.code !== undefined && data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || data.msg || '请求失败')
  }
  return data && data.data !== undefined ? data.data : data
}

/**
 * 基于 Taro.request（小程序侧等价于 wx.request）的统一请求封装。
 * 负责 baseURL、鉴权头、401/过期处理与业务码解包。
 */
export function request(options) {
  const { url, method = 'GET', data, header = {}, skipAuth = false } = options

  if (!skipAuth && isTokenExpired(getAuth())) {
    handleLoginExpired()
    return Promise.reject(new Error(LOGIN_EXPIRED_MSG))
  }

  return Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: buildHeaders({ skipAuth, header }),
  })
    .then((res) => {
      if (res.statusCode === 401) {
        handleLoginExpired()
        throw new Error(LOGIN_EXPIRED_MSG)
      }
      return unwrapResponse(res)
    })
    .catch((err) => {
      if (err.errMsg && err.errMsg.includes('request:fail')) {
        throw new Error('网络请求失败，请检查本地服务是否启动')
      }
      throw err
    })
}

export { BASE_URL }
