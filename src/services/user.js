import { request } from '../utils/request'
import { setUserInfo } from '../utils/auth'

export function login(ticketCode, tradeNo) {
  return request({
    url: '/user/login',
    method: 'POST',
    data: { ticketCode, tradeNo },
    skipAuth: true,
  })
}

export function getUserById(userId) {
  return request({
    url: `/user/${userId}`,
    method: 'GET',
  })
}

export async function fetchUserInfo(userId) {
  const userInfo = await getUserById(userId)
  setUserInfo(userInfo)
  return userInfo
}