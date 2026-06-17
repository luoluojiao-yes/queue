# 烬光灵契 · 线下活动叫号系统

基于 **Taro 4 + React 18** 的微信小程序，用于线下活动的嘉宾/官委展示、叫号详情与个人中心。

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    微信开发者工具                         │
│                  （预览 / 调试 / 上传）                    │
└─────────────────────────┬───────────────────────────────┘
                          │ 读取 dist/
┌─────────────────────────▼───────────────────────────────┐
│  dist/          编译产物（小程序运行目录）                 │
│  app.json · pages/ · common.js · taro.js · vendors.js   │
└─────────────────────────▲───────────────────────────────┘
                          │ Taro Webpack5 编译
┌─────────────────────────┴───────────────────────────────┐
│  src/           源码（React JSX + Sass）                  │
│  ├── app.js / app.config.js    小程序入口与全局配置       │
│  ├── pages/                    页面                       │
│  ├── mockdata/                 Mock 数据                 │
│  └── assets/tabbar/            TabBar 图标               │
└─────────────────────────▲───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│  config/        Taro 构建配置（Webpack5 / 分包 / 拷贝）   │
└─────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Taro 4.0.9 | 跨端编译，目标平台 `weapp` |
| UI | React 18 | 函数组件 + Hooks |
| 样式 | Sass | 页面级 `.scss` |
| 构建 | Webpack 5 | `@tarojs/webpack5-runner` |
| 运行 | 微信小程序 | AppID: `wx6ecd2fc8d5c179f1` |

### 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/index/index` | 嘉宾框 / 官委框，点击跳转详情 |
| 个人中心 | `pages/profile/index` | 用户信息、票号、登录 |
| 详情 | `pages/detail/index` | 展示目前叫号等信息 |

底部 TabBar：**首页** · **个人中心**

### 数据流（当前）

```
mockdata/home.js  ──►  首页嘉宾/官委列表
mockdata/profile.js ──► 个人中心登录 Mock
         │
         ▼
   点击头像 ──► navigateTo 详情页（携带 id + type）
         │
         ▼
   getUserById(type, id) 读取详情
```

> 后续接入后端时，将 `mockdata` 替换为 API 请求即可。

---

## 环境要求

- **Node.js** 18.x 或 20.x LTS
- **npm** 9+
- **[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)**

---

## 启动项目

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式（推荐）

监听源码变化，自动编译到 `dist/`：

```bash
npm run dev:weapp
```

### 3. 在微信开发者工具中打开

| 配置项 | 值 |
|--------|-----|
| 项目目录 | 本项目根目录（含 `project.config.json`） |
| AppID | `wx6ecd2fc8d5c179f1` |
| 小程序目录 | `dist/`（已在配置中指定 `miniprogramRoot`） |

**注意：**
- 不要只导入 `dist/pages` 子目录
- 首次打开前先执行 `npm run dev:weapp`，确保 `dist/` 有内容
- 若页面空白：工具栏 → **清缓存 → 全部清除** → 重新编译

### 4. 生产构建

```bash
npm run clean
npm run build:weapp
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev:weapp` | 开发模式，监听编译 |
| `npm run build:weapp` | 生产构建 |
| `npm run clean` | 清空 `dist/` 目录 |

---

## 目录说明

```
queuereact/
├── config/                 # Taro 构建配置
├── src/
│   ├── app.js              # 应用入口
│   ├── app.config.js       # 全局配置、TabBar、路由
│   ├── pages/
│   │   ├── index/          # 首页
│   │   ├── profile/        # 个人中心
│   │   └── detail/         # 详情页
│   ├── mockdata/           # Mock 数据
│   └── assets/tabbar/      # Tab 图标
├── dist/                   # 编译输出（勿手改）
├── project.config.json     # 微信开发者工具配置
└── package.json
```

---

## 编译说明

- **只修改 `src/`**，不要手动编辑 `dist/`
- `dist/` 已加入 `.gitignore`，每次构建自动生成
- 生产构建会将公共代码拆到 `common.js`，已通过 `addChunkPages` 保证页面正常加载
