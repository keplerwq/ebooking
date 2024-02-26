const PRODUCTION = import.meta.env.MODE === 'production'

// 项目一些基本配置
let echartConfig = {
  url: 'vendor/echarts/echarts.min.js',
  chinaJson: 'vendor/echarts/china.json',
  provincesPath: 'vendor/echarts/provinces'
};

const config = {
  name: 'supplier-management',
  echartConfig, // echart需要异步的文件配置
  isForcedLogin: true, // 接口请求失败是否强制跳转
};

if (PRODUCTION) {
  // window.debug = true;
  // (function() {
  //   const log = console.log;
  //   const info = console.info;
  //   console.log = (...arg) => window.debug && log(...arg);
  //   console.info = (...arg) => window.debug && info(...arg);
  // })();
}

if (PRODUCTION) {
  console.log('PRODUCTION');
  window.debug = false;
  Object.assign(config, {
    isForcedLogin: true,
  });
}

export default config;