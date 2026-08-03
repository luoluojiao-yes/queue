import { request } from '../utils/request'

export function getCurrentActivity() {
  return request({
    url: '/admin/activity/current',
    method: 'GET',
  })
}
