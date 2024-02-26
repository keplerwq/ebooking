## 一、为什么使用 Vite

Vite 是下一代前端开发与构建工具，由 Vue 作者尤雨溪领衔打造，它能够显著提升前端开发体验。是 webpack 的有力竞争对手；

它主要由两部分组成：

- 一个开发服务器，它基于原生 ES 模块提供了丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。
- 一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

它支持开箱即用的 vue2、vue3、react 模版，TS 及 JS 版本；[体验一下](https://cn.vitejs.dev/guide/)

> 兼容性：Vite 需要 Node.js 版本 >= 12.0.0。

### 开发服务器

Webpack 的开发服务器(webpack-dev-server) 是基于 `Babel`将代码转为 `< Es6` 打包后通过 `Express` 启动本地服务。而 Vite 使用 [esbuild](https://esbuild.github.io/) 省去了转码 `< Es6` 这一步，它在开发环境直接打包 [原生 ES 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)，这大大提高了 Dev 模式时的启动速度。

esbuild 官方提供了一张打包的对比参考：

![esBuild-speed.png](https://i.loli.net/2021/08/12/JTsQnmKIOEY6S1g.png)

上面是以 [three.js](https://github.com/mrdoob/three.js) 为打包对象（含代码压缩及 source maps），分别使用各种工具进行的打包耗时对比。[更多细节](https://esbuild.github.io/faq/#benchmark-details)

可以看到，同样是打包，esbuild 的打包速度快了其他工具百倍；
除了上面说的，它不会转码以外，还有几点主要原因，使它执行高效：

- esbuild 是使用 go 编写的，go 是纯机器码，肯定要比 JIT 快
- js 是单线程串行，esbuild 是新开一个进程，然后多线程并行，充分发挥多核优势
- 不使用 AST，优化了构建流程。但是这也导致了它接不了 babel 之类的编译工具，无法打包 `< Es6`

我们放几张项目中实操图感受下：

**vite(esbuild)**

1. 未缓存的耗时: 3113ms

![vite-start_no-cache_.gif](https://i.loli.net/2021/08/10/kqa5KZ7uGXTCI3Y.gif)

2. 已缓存的耗时: 574ms

![vite-start_cached_.gif](https://i.loli.net/2021/08/10/Plr3G2cOZI5pQ9R.gif)

**webpack**

1. 未缓存的耗时: 53669ms

![webpack-start_no-cache_.png](https://i.loli.net/2021/08/10/PpUkiQ6etgZoAbs.png)

2. 已缓存的耗时: 24044ms

![webpack-start_cached_.png](https://i.loli.net/2021/08/10/OgIn45cSTWFlfGA.png)

果然，这个启动速度真是太香了。
借助于 esbuild，依赖更新及热更新的速度都得到飞速的提升，开发体验大幅提升。

### 构建打包

在构建打包阶段，Vite 使用的是 Rollup 进行打包的，为什么不用 esbuild 呢？
esbuild 目前在代码分割和 CSS 处理方面相对较差，同时它缺失 AST 导致 babel 及其 plugin 都无法使用了。

**什么是 Rollup？**

这个工具听起来不如 webpack 熟悉，但是它可是个老牌工具了，而且我们前端其实每天都在用 Rollup 打出来的包进行开发；
比如：React、Vue、Angular、Babel...，这些前端天天用的框架和工具基本都是用 Rollup 来打包的。
在 Vite 之前，大多数 js lib 都会选择 Rollup 来进行打包，大多数前端应用则使用 webpack 来打包，这样因为 webpack 有更好的 dev server、HMR、处理 html 等配套能力，
而 Rollup 因其支持 Es6，打包的冗余代码更少，以及更优的 Tree Shaking 被广泛用于 lib 开发。总之它的打包，总能更小更快。

我们来对比下两者的打包产物，以简单一个函数为例；
在 webpack 中，打包;

**原代码：**

```js
// webpack 在不借助 babel 的情况下，仅支持 commonjs
module.exports = function fn() {
    return 'hello world'
}
```

**打包代码：**

```js
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 220:
/***/ ((module) => {

module.exports = function fn() {
    return 'hello world'
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(220);
/******/
/******/ })()
;
```

我们再来看看 Rollup：

**原代码：**

```js
// Rollup 天然支持 Es6
export default function fn() {
    return 'hello world'
}
```

**打包代码：**

```js
(function () {
    'use strict';

    function fn() {
        return 'hello world'
    }

    return fn;

}());
```

上面我们看得出，webpack 打包冗余代码确实比较多，随着各种代码、插件的增加，webpack 打包的冗余代码会进一步增加；

再来看看同一项目的打包速度：

**vite(rollup)**

`09:56:16 -> 09:57:12` = 56s

`09:58:01 -> 09:58:56` = 55s

`09:59:12 -> 10:00:08` = 56s

**webpack**

`10:07:41 -> 10:09:42` = 121s

`10:11:39 -> 10:13:47` = 128s

`10:14:05 -> 10:16:18` = 133s

除了在打包产物上进一步提升效率及压缩体积外，vite 还在用户加载性能上进一步做出了提升，它的默认构建产物是 Es6（Es Module），但是它同时 shim 了 `< Es6` 的部分。我们看下它打包后的 `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite</title>
    <script type="module" crossorigin src="/assets/main.97c676b6.js"></script>
    <link rel="modulepreload" href="/assets/antd.4951f401.js">
    <link rel="modulepreload" href="/assets/vendor.e4e241c6.js">
    <link rel="stylesheet" href="/assets/vendor.961c17e0.css">
    <link rel="stylesheet" href="/assets/antd.51cda461.css">
    <link rel="stylesheet" href="/assets/main.e2591054.css">
    <script type="module">!function(){try{new Function("m","return import(m)")}catch(o){console.warn("vite: loading legacy build because dynamic import is unsupported, syntax error above should be ignored");var e=document.getElementById("vite-legacy-polyfill"),n=document.createElement("script");n.src=e.src,n.onload=function(){System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))},document.body.appendChild(n)}}();</script>
  </head>
  <body>
    <div id="root"></div>
    <script nomodule>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",(function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()}),!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>
    <script nomodule id="vite-legacy-polyfill" src="/assets/polyfills-legacy.df055e94.js"></script>
    <script nomodule id="vite-legacy-entry" data-src="/assets/main-legacy.1b0f76f4.js">System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))</script>
</body>
</html>
```

Vite 打包优先支持 Es Module，当浏览器不支持 Es Module 时，通过 `nomodule` 加载 `< Es6` 的代码。这样在大多数现代浏览器，我们可以直接运行 Es6 代码，这样可以减少资源体积和提高代码运行性能。

## 三、坑点、配置、优化等

说了很多 Vite 的优点，那么切换 Vite 有哪些坑呢？

### 遇到的坑点

1. esbuild 不支持草案阶段的特性，比如 `export DefaultExport from 'bar.js'; // Invalid` 及 `decorators`，而且 vite dev 环境下对 babel 支持并不友好，所以你无法通过 babel 来进行转换。而官方 github 上给出的解决方案也十分粗暴；

![image.png](https://i.loli.net/2021/08/12/LzUF7uEtSjT5Rdb.png)

2. 当代码中动态加载未安装的依赖时，比如 antd 的依赖 `component-classes` 中就有这么段代码：

```js
try {
  var index = require('indexof');
} catch (err) {
  var index = require('component-indexof');
}
```

`component-classes` 中并没有安装 `indexof` 这个依赖，在 commonjs 中，这段代码是可以运行的，因为 require 是动态的，但是转化为 esModule 后，因为 `import` 是静态的，Rollup 无法根据 `indexof` 找到对应的文件，于是它直接编译成`import "indexof"` 从而导致运行时报错；

![image.png](https://i.loli.net/2021/08/12/EGrg4CmotR9PKed.png)

3. 不要在 dev 模式下开启 antd 的按需加载，因为 vite 每次增加依赖时，都会重新加载依赖执行预构建（把依赖中的 commonjs 转为 es6），从而导致页面刷新，多个依赖动态加载则会反复刷新。

### 配置

Vite 默认读取根目录下的 `vite.config.ts` 作为配置文件；

下面是部分配置的示例及说明，完整版本请查看 [官方文档](https://cn.vitejs.dev/config/)

```ts
import { defineConfig } from 'vite'
import path from 'path';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import type { ViteSentryPluginOptions } from 'vite-plugin-sentry';
import viteSentry from 'vite-plugin-sentry';
import usePluginImport from 'vite-plugin-importer';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  // ...
  server: {
    proxy: { // 代理
        '^/api': {
        target: 'http://10.10.75.10:8000',
        changeOrigin: true,
      },
    }
  },
  build: {
    sourcemap: true, // sourceMap
    outDir: 'build', // 打包目录
    rollupOptions: {
      input: { // 入口，这里配置 MPA
        main: path.resolve(__dirname, 'index.html'),
        welcome: path.resolve(__dirname, 'welcome.html')
      },
      output: { // 出口控制，这里进行 splitChunk
        manualChunks(id) {
          if (id.includes('node_modules'))
              return 'vendor';
        }
      }
    }
  },
  define: { // 定义全局变量
    NODE_SENTRY: JSON.stringify(sentryHash)
  },
  resolve: {
    alias: { // 别名
      'src': path.join(__dirname, 'src')
    }
  },
  plugins: [ // 插件，支持 vite 插件，同时继承 Rollup 插件
    {
      ...viteSentry(sentryConfig), // sentry
      apply: 'build' // 这里表示只应用于 build 模式
    },
    legacy({ // legacy 插件用来打包生成 `< es6 的代码`
      targets: ['defaults', 'not IE 11']
    }),
    {
      ...usePluginImport({ // 按需加载 antd
        libraryName: "antd",
        libraryDirectory: "es",
        style: "css",
      }),
      apply: 'build'
    },
    reactRefresh() // Hot reload 插件
  ],
})
```

### 优化

像 webpack 一样 splitChunk 来减少包的体积，避免单包过大的问题：

```js
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
```

### 生态

Webpack 的生态非常强大，比如它的 loader 和 plugin；而 Vite 借助 Rollup 的插件系统，可以说是 webpack 插件基本都可以找到 Rollup 版本的替代品；

## 总结

以上就是对 Vite 的一个简单的介绍，总的来说，它在整体性能上是远远优于 webpack 的，它让我们在生产环境也安全的用上了 Es6 的代码，这个确实是向前了一大步。
Vite 目前还很年轻，借助 Esbuild 我觉得后续还有更多的可能。
