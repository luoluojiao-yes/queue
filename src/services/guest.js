import { request } from '../utils/request'

export function queryGuestAll() {
  return request({
    url: '/guest/queryGuestAll',
    method: 'POST',
    data: {},
  })
}

export function getGuestById(id) {
  return request({
    url: `/guest/${id}`,
    method: 'GET',
  })
}
