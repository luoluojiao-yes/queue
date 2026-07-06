import Taro from '@tarojs/taro'
import { API_BASE_URL } from '../constants/api'
import { getToken, handleLoginExpired, isTokenExpired, getAuth, LOGIN_EXPIRED_MSG } from './auth'

const BASE_URL = API_BASE_URL

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

export function request(options) {
  const { url, method = 'GET', data, header = {}, skipAuth = false } = options

  if (!skipAuth && isTokenExpired(getAuth())) {
    handleLoginExpired()
    return Promise.reject(new Error(LOGIN_EXPIRED_MSG))
  }

  const token = getToken()

  return Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...(!skipAuth && token ? { Authorization: token } : {}),
      ...header,
    },
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
