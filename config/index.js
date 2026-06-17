import { defineConfig } from '@tarojs/cli'

export const config = defineConfig({
  projectName: '线下活动叫号系统',
  date: '2026-6-17',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  framework: 'react',
  compiler: 'webpack5',
  copy: {
    patterns: [
      { from: 'src/assets/', to: 'dist/assets/' },
    ],
    options: {},
  },
  mini: {
    addChunkPages(pages, pageNames) {
      pageNames.forEach((pageName) => {
        pages.set(pageName, ['common'])
      })
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
  },
})

export default function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
