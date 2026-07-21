import { request } from '../utils/request'

export function presentInteraction(data) {
  return request({
    url: '/interaction/present',
    method: 'POST',
    data,
  })
}
