import path from 'path';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from 'vite-plugin-svgr';
import type { ViteSentryPluginOptions } from 'vite-plugin-sentry';
import viteSentry from 'vite-plugin-sentry';
import usePluginImport from 'vite-plugin-importer';
import legacy from '@vitejs/plugin-legacy';
import sizes from 'rollup-plugin-sizes';
import { injectHtml } from 'vite-plugin-html';


const isEnvProduction = process.env.NODE_ENV === 'production';

// Create sentry ...
const createHash = (hashLength) => {
  if (!hashLength || typeof (Number(hashLength)) !== 'number') {
    hashLength = 18
  }
  const ar = '1,2,3,4,5,6,7,8,9,0,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',')
  const hs = []
  const hl = Number(hashLength)
  const al = ar.length
  for (let i = 0; i < hl; i++) {
    hs.push(ar[Math.floor(Math.random() * al)])
  }
  return hs.join('')
}
// const sentryHash = `e-booking-${childProcess.execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8' }).trim()}`; // 带上环境前缀方便区分
// 存在一个问题，我们的发布系统在构建时获取不到git仓库的提交hash，永远是同一个commitId，因此这里通过创建随机hash
const sentryHash = isEnvProduction ? createHash(7) : undefined;

/*
	Configure sentry plugin
*/

const sentryConfig: ViteSentryPluginOptions = {
  release: sentryHash,
  configFile: '.sentryclirc',
  authToken: '60220e20010146f3bd5c476a2cd4ed2c72d6a64809044c46a5fe52dd0916b718',
  org: 'sentry',
  project: 'e-booking',
  finalize: true,
  deploy: {
    env: 'production'
  },
  setCommits: {
    auto: false,
    commit: sentryHash,
  },
  sourceMaps: {
    include: ['./build/assets'],
    ignore: ['node_modules'],
    urlPrefix: '~/assets'
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '^/(api-|oauth|validate|user)': {
        target: 'http://10.220.21.106',
        changeOrigin: true,
      },
      '^/supplier': {
        target: 'http://10.246.75.18:8686',
        changeOrigin: true,
      },
      '^/supply': {
        target: 'http://ebooking-test.netease.com',
        changeOrigin: true,
      },
    }
  },
  build: {
    sourcemap: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        welcome: path.resolve(__dirname, 'welcome.html')
      },
      output: {
        manualChunks(id) {
          switch (true) {
            case /@ant-design\/compatible/.test(id):
            case /@ant-design\/icons-svg/.test(id):
            case /@ant-design\/icons/.test(id):
            case /antd/.test(id):
            case /lodash/.test(id):
            case /moment/.test(id):
            case /sentry/.test(id):
            case /rc-[a-zA-Z0-9]+/.test(id):
            case /pdfjs-dist/.test(id):
            case /draft-js/.test(id):
            case /react-pdf/.test(id):
            case /async-validator/.test(id):
            case /marked/.test(id):
              return RegExp.lastMatch;
            case /node_modules/.test(id):
              return 'vendor';
          }
        }
      }
    }
  },
  define: {
    NODE_SENTRY: JSON.stringify(sentryHash)
  },
  resolve: {
    alias: {
      'src': path.join(__dirname, 'src')
    }
  },
  plugins: [
    injectHtml({
      injectData: {
        title: '网易集团供应商管理系统',
        injectAntdCss: isEnvProduction ? '' : `<link rel="stylesheet" href="/node_modules/antd/dist/antd.css">`,
      },
    }),
    {
      ...viteSentry(sentryConfig),
      apply: 'build'
    },
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    {
      ...usePluginImport({
        libraryName: "antd",
        libraryDirectory: "es",
        style: "css",
      }),
      apply: 'build'
    },
    svgr(),
    reactRefresh({
      parserPlugins: [
        'classProperties',
        'classPrivateProperties',
        'classStaticBlock',
        'decimal',
        'asyncGenerators',
        'classPrivateMethods',
        'dynamicImport',
        'exportNamespaceFrom',
        'moduleStringNames',
        'objectRestSpread',
        'optionalChaining'
      ]
    }),
    // @ts-ignore
    sizes(),
  ],
})
