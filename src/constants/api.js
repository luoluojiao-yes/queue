// 由 config/dev.js、config/prod.js 的 defineConstants 在编译期注入
/* global API_BASE_URL */
const BASE_URL = API_BASE_URL

export { BASE_URL as API_BASE_URL }
