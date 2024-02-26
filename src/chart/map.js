import { loadEcharts, mapCfg } from './help';
import chroma from 'chroma-js';
import axios from 'axios';
import _ from 'lodash';

const MAP_OPTION = {
  tooltip: {},
  visualMap: {
    show: false,
    min: 0,
    max: 100,
    left: '4%',
    top: 'bottom',
    text: [],
    calculable: false,
  },
  series: [{
    name: '',
    type: 'map',
    roam: false,
    mapType: 'china',
    label: {
      normal: {
        show: false
      },
      emphasis: {
        show: true,
        textStyle: {
          color: 'black'
        }
      }
    },
    itemStyle: {
      normal: {
        areaColor: '#eee',
        borderColor: '#999',
      },
      emphasis: {
        areaColor: '#eee',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10,
      }
    },
    data: []
  }]
};

let jsonData = {};

export async function registerChina() {
  let echarts = await loadEcharts();
  return new Promise((resolve, reject) => {
    if (jsonData.china) {
      resolve();
      return;
    }
    axios.get(mapCfg.china).then((res) => {
      jsonData.china = true;
      echarts.registerMap('china', res.data);
      resolve();
    })
  }).catch((e) => {
    console.log('get china json error');
  });
}

// 计算出标尺最大值
function getMax(data) {
  let max = Math.max(...data, 50);
  if (max <= 1000) {
    max = Math.ceil(max / 50) * 50;
  } else {
    max = Math.ceil(max / 500) * 500;
  }
  return max;
}

// 地图 data = [{name:'浙江', value: 20}]
async function chinaOption(data = [], opts = {}, unit) {
  await registerChina();

  if (Object.prototype.toString.call(data) !== '[object Array]') {
    console.error('chart map: data must be Array');
    return;
  }
  const MAP_COLOR = ['#2e87ed', 'white'];
  let colorMap = chroma.scale(MAP_COLOR.reverse());
  let max = getMax(data.map(obj => obj.value));
  for (let item of data) {
    item.itemStyle = {
      emphasis: {
        areaColor: colorMap(item.value / max).hex()
      }
    };
  }
  let option = _.merge({}, MAP_OPTION, opts, {
    visualMap: {
      max: max,
      text: [unit],
      inRange: {
        color: MAP_COLOR
      },
    },
    series: [{
      data: data
    }]
  });

  return option;
}


export async function china(data, option = {}) {
  return await chinaOption(data, option);
}

/*
地区流量，地区访问量
data = {
  data : { flow, area},
  unit : 'GB'
}
*/
export async function areaFlow(data, option = {}) {
  let list = data.data.map(x => {
    return { name: x.area, value: x.flow };
  });
  return await chinaOption(list, option, data.unit);
}

export async function areaVisit(data, option = {}) {
  let list = data.data.map(x => {
    return { name: x.area, value: x.count };
  });
  return await chinaOption(list, option, data.unit);
}

// 统计模块 全局 各地带宽情况
export async function summaryAreaBandWidth(data, option = {}) {
  let list = data.data.map(x => {
    return { name: x.area, value: x.data };
  });
  return await chinaOption(list, option, data.unit);
}

// 统计模块 全局 各地流量情况
export async function summaryAreaFlow(data, option = {}) {
  let list = data.data.map(x => {
    return { name: x.area, value: x.data };
  });
  return await chinaOption(list, option, data.unit);
}