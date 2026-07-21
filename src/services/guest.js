import { request } from '../utils/request'

export function queryGuestAll() {
  return request({
    url: '/guest/queryGuestAll',
    method: 'POST',
    data: {},
  })
}
