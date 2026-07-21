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
