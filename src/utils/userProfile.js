import { EMPTY, emptyUserInfo } from '../mockdata'

function formatQueueNo(coserCode, code) {
  if (coserCode == null && code == null) return EMPTY
  return `${coserCode ?? ''}${code ?? ''}`
}

export function normalizeGuestList(interactionResps = []) {
  return interactionResps.map((item) => ({
    id: item.id,
    coserName: item.coserName || item.coserCode || EMPTY,
    queueNo: formatQueueNo(item.coserCode, item.code),
  }))
}

export function normalizeUserProfile(userInfo) {
  if (!userInfo) return emptyUserInfo
  return {
    username: userInfo.userName || EMPTY,
    ticketNo: userInfo.ticketCode || EMPTY,
    orderNo: userInfo.tradeNo || EMPTY,
    guestList: normalizeGuestList(userInfo.interactionResps),
  }
}
