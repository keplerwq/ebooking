// 工具集合
import config from 'src/config';

const echartConfig = config.echartConfig;

function loadScript(url, cb) {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  if (script.readyState) {
    script.onreadystatechange = function() {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        cb && cb();
      }
    };
  } else {
    script.onload = function() {
      cb && cb();
    };
  }
  script.src = url;
  document.body.appendChild(script);
}

export const COLOR = ['#4680fe', '#1c9fef', '#51b9f8', '#7dcdfe', '#c6eaff'];

// 异步加载 echart
// let echarts = await loadEcharts();
export function loadEcharts() {
  return new Promise((resolve, reject) => {
    if (window.echarts) {
      resolve(window.echarts);
    } else {
      loadScript(echartConfig.url, function() {
        resolve(window.echarts);
      });
    }
  }).catch((e) => {
    console.log(e);
  });
}

export const mapCfg = {
  china: echartConfig.chinaJson,
};

// 获取对象中 data最大值 {line1: [{data, time}, {data, time}], line2: [{data, time}]}
export function getTheMax(data = {}) {
  console.log(data);
  let values = [];
  for (let key of Object.keys(data)) {
    values.push(...data[key].map(obj => obj.data));
  }
  return Math.max(...values);
}

// 根据value值获取 对应的 带宽单位 Gbps Mbps Kbps bps
export function getAutoBanwidth(value) {
  if (value > Math.pow(10, 9)) {
    return 'Gbps';
  } else if (value > Math.pow(10, 6)) {
    return 'Mbps';
  } else if (value > Math.pow(10, 3)) {
    return 'Kbps';
  }
  return 'bps';
}

// 根据value值获取 对应的 流量单位 Byte KB MB GB
export function getAutoFlow(value) {
  if (value > Math.pow(10, 9)) {
    return 'GB';
  } else if (value > Math.pow(10, 6)) {
    return 'MB';
  } else if (value > Math.pow(10, 3)) {
    return 'KB';
  }
  return 'Byte';
}

// 将数据转换成对应单位
export function parseToUnit(value, unit) {
  let v = value;
  if (unit === 'Gbps' || unit === 'GB') {
    v = (value / Math.pow(1024, 3)).toFixed(2);
  } else if (unit === 'Mbps' || unit === 'MB') {
    v = (value / Math.pow(1024, 2)).toFixed(2);
  } else if (unit === 'Kbps' || unit === 'KB') {
    v = (value / Math.pow(1024, 1)).toFixed(2);
  }
  return v;
}

// 根据传入值，换算成相对合适的y轴数值 78->100, 32->50
export function getY(value) {
  let wei = Math.log(value) / Math.log(10);
  if (wei <= 0) { // value <= 1
    return 1;
  }
  let half = Math.pow(10, Math.floor(wei)) * 5;
  let max = Math.ceil(value / half) * half;
  return max;
}
