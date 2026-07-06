import Taro from '@tarojs/taro'

const AUTH_KEY = 'auth_data'
const USER_INFO_KEY = 'userInfo'
export const LOGIN_EXPIRED_MSG = '登录过期，需要重新登录'

export function getAuth() {
  return Taro.getStorageSync(AUTH_KEY) || null
}

export function getToken() {
  const auth = getAuth()
  return auth?.token || ''
}

export function getUserId() {
  const auth = getAuth()
  return auth?.userId ?? null
}

export function getRoleType() {
  const auth = getAuth()
  return auth?.roleType ?? null
}

export function isTokenExpired(auth = getAuth()) {
  return !!(auth?.expireAt && Date.now() >= auth.expireAt)
}

export function isLoggedIn() {
  const auth = getAuth()
  return !!(auth?.token && !isTokenExpired(auth))
}

export function setAuth({ userId, token, roleType, expireAt }) {
  Taro.setStorageSync(AUTH_KEY, {
    userId,
    token,
    roleType,
    expireAt,
  })
}

export function setUserInfo(userInfo) {
  Taro.setStorageSync(USER_INFO_KEY, userInfo)
}

export function getUserInfo() {
  return Taro.getStorageSync(USER_INFO_KEY) || null
}

export function clearAuth() {
  Taro.removeStorageSync(AUTH_KEY)
  Taro.removeStorageSync(USER_INFO_KEY)
}

export function redirectToLogin() {
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage ? currentPage.route : ''

  if (currentRoute !== 'pages/login/index') {
    Taro.reLaunch({ url: '/pages/login/index' })
  }
}

export function handleLoginExpired() {
  clearAuth()

  const pages = Taro.getCurrentPages()
  const currentRoute = pages[pages.length - 1]?.route || ''
  if (currentRoute === 'pages/login/index') {
    return
  }

  Taro.showToast({ title: LOGIN_EXPIRED_MSG, icon: 'none', duration: 2000 })
  setTimeout(() => {
    Taro.reLaunch({ url: '/pages/login/index' })
  }, 500)
}

export function ensureLoggedIn() {
  const auth = getAuth()
  if (!auth?.token) {
    redirectToLogin()
    return false
  }
  if (isTokenExpired(auth)) {
    handleLoginExpired()
    return false
  }
  return true
}
