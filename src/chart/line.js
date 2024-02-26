import { COLOR } from './help';
import _ from 'lodash';

const LINE_OPTION = {
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    left: '18%',
    right: '10%',
  },
  legend: {
    show: false,
    orient: 'horizontal',
    right: '8%',
    data: []
  },
  color: COLOR,
  xAxis: [{
    type: 'category',
    data: [],
    axisLabel: {
      textStyle: {
        color: '#999999'
      }
    },
    axisLine: {
      lineStyle: {
        color: '#999999'
      }
    },
  }],
  yAxis: [{
    type: 'value',
    name: '',
    axisLine: {
      show: false
    },
    // min: 0,
    // minInterval: 1,
    axisLabel: {
      textStyle: {
        color: '#999999'
      }
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: '#999'
      }
    }
  }],
  series: []
};
const LINE_STYLE = {
  normal: {
    width: 1
  }
};

// data = {lineName: [{data, time}, {data, time}]}
// data = [{data, time}, {data, time}]
export function line(data = {}, opts = {}, unit) {
  let legendNames = [];
  let series = [];
  let xAxis = [];
  // 多条线的情况
  if (_.isPlainObject(data)) {
    for (let key of Object.keys(data)) {
      legendNames.push(key);
      series.push({
        name: key,
        type: 'line',
        lineStyle: LINE_STYLE,
        data: data[key].map(obj => obj.data),
      });
      // 生成x轴
      xAxis = data[key].map(obj => obj.time);
    }
  }
  // 单线情况
  else if (_.isArray(data)) {
    series.push({
      name: 'line',
      type: 'line',
      lineStyle: LINE_STYLE,
      data: data.map(x => x.data),
    });
    xAxis = data.map(obj => obj.time);
  }

  return _.merge({}, LINE_OPTION, opts, {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        if (!params || params.length === 0) {
          return;
        }
        let str = params[0].axisValue + '<br/>';
        for (let x of params) {
          str = str + x.marker + x.seriesName + ': ' + x.data + unit;
        }
        return str;
      }
    },
    legend: {
      data: legendNames
    },
    series: series,
    xAxis: [{
      data: xAxis
    }]
  });
}

/*
线图 带宽
data = {
  data: [{data, time}],
  unit: 'bps'
}
*/
export function bandwidth(data = {}) {
  return line({ '带宽': data.data }, {}, data.unit);
}
// 线图 流量
export function flow(data = {}, opts = {}) {
  return line({ '流量': data.data }, {}, data.unit);
}
// 线图 流量
export function visits(data = {}, opts = {}) {
  return line({ '请求数': data.data }, {}, data.unit);
}
