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