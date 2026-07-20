module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {
    // 本地启动：npm run dev:weapp
    API_BASE_URL: '"http://localhost:8080/api"',
  },
  mini: {},
  cache: {
    enable: false,
  },
}
