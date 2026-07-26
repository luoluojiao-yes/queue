import Taro from '@tarojs/taro'
import { USER_TYPE } from '../mockdata/home'

const DETAIL_USER_KEY = 'detail_guest_user'

let guestAllCache = {
  guests: [],
  officials: [],
  freeTravels: [],
}

export function setDetailUser(user, type) {
  Taro.setStorageSync(DETAIL_USER_KEY, { ...user, type })
}

export function getDetailUser() {
  return Taro.getStorageSync(DETAIL_USER_KEY) || null
}

function normalizeUser(item, index) {
  return {
    id: item.id ?? index,
    userName: item.name || item.userName || '',
    avatar: item.avatar || item.avatarUrl || '',
    currentNo: item.currentNo || item.current_no || item.code || '',
  }
}

function formatQueueDisplay(code, queueNo) {
  const prefix = code == null || code === '' ? '' : String(code)
  if (queueNo == null || queueNo === '') {
    return prefix || ''
  }
  return prefix ? `${prefix} - ${queueNo}` : String(queueNo)
}

function resolveCallingId(data) {
  if (data.type === 1) {
    return data.interaction?.id ?? null
  }
  if (data.type === 2) {
    return data.officialGuestCallRecord?.id ?? null
  }
  return null
}

export function normalizeGuestDetail(data) {
  if (!data) return null
  const code = data.code ?? ''
  const nowQueueNo = data.nowQueueNO ?? data.nowQueueNo ?? null
  const nextQueueNo = data.nextQueueNo ?? data.nextQueueNO ?? null

  return {
    ...normalizeUser(data),
    status: data.status,
    guestType: data.type,
    code,
    nowQueueNo,
    nextQueueNo,
    callingId: resolveCallingId(data),
    currentNo: formatQueueDisplay(code, nowQueueNo),
    nextNo: nextQueueNo == null ? null : formatQueueDisplay(code, nextQueueNo),
  }
}

export function normalizeGuestAll(data) {
  if (!data) {
    return { guests: [], officials: [], freeTravels: [] }
  }

  if (Array.isArray(data)) {
    return {
      guests: data.map(normalizeUser),
      officials: [],
      freeTravels: [],
    }
  }

  return {
    guests: (data.guestRespListGuest || []).map(normalizeUser),
    officials: (data.guestRespListOfficially || []).map(normalizeUser),
    freeTravels: (data.guestRespListFree || []).map(normalizeUser),
  }
}

export function setGuestAllCache(data) {
  guestAllCache = data
}

export function getGuestAllCache() {
  return guestAllCache
}

export function getUserById(type, id) {
  let list = []
  if (type === USER_TYPE.GUEST) {
    list = guestAllCache.guests
  } else if (type === USER_TYPE.OFFICIAL) {
    list = guestAllCache.officials
  } else if (type === USER_TYPE.FREE) {
    list = guestAllCache.freeTravels
  }
  return list.find((item) => String(item.id) === String(id))
}
