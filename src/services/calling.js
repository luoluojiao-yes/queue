import { request } from '../utils/request'

export function startCalling(guestId) {
  return request({
    url: '/calling/start',
    method: 'POST',
    data: { guestId },
  })
}

export function nextCalling({ guestId, callingId }) {
  return request({
    url: '/calling/next',
    method: 'POST',
    data: { guestId, callingId },
  })
}

export function passCalling({ guestId, callingId }) {
  return request({
    url: '/calling/pass',
    method: 'POST',
    data: { guestId, callingId },
  })
}
