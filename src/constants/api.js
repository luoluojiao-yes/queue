// 开发环境本地接口；上线前将 PROD 改为正式域名并在微信公众平台配置 request 合法域名
const DEV_BASE_URL = 'http://localhost:8080/api'
const PROD_BASE_URL = 'http://localhost:8080/api'

export const API_BASE_URL =
  process.env.NODE_ENV === 'development' ? DEV_BASE_URL : PROD_BASE_URL
