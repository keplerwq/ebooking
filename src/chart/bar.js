import _ from 'lodash';

const BAR_OPTION = {
  color: ['#3398DB'],
  tooltip: {
    show: false,
    trigger: 'axis',
    formatter: function(params) {
      let data = params[0];
      if (data.name && data.value) {
        return `${data.name}: ${data.value}`;
      }
      return '暂无数据';
    },
    axisPointer: { // 坐标轴指示器，坐标轴触发有效
      type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '3%',
    containLabel: true
  },
  xAxis: [{
    type: 'category',
    data: [],
    axisTick: {
      alignWithLabel: true
    },
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
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false,
      textStyle: {
        color: '#999999'
      }
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: '#1e3151'
      }
    }
  }],
  series: [{
    type: 'bar',
    barWidth: '40%',
    barMaxWidth: '100',
    data: [],
    label: {
      normal: {
        show: true,
        position: 'inside',
        formatter: '{c}'
      }
    },
  }]
};

// 柱状图 data = { key: value, key2: value2}
export function bar(data = {}, option = {}) {
  return _.merge({}, BAR_OPTION, option, {
    xAxis: [
      { data: Object.keys(data), }
    ],
    series: [{
      type: 'bar',
      data: Object.values(data),
    }]
  });
}

// 柱状图 百分比单位 data = { key: value, key2: value2}
export function barOfPercent(data = {}, option = {}) {
  return _.merge({}, BAR_OPTION, option, {
    xAxis: [
      { data: Object.keys(data), }
    ],
    series: [{
      type: 'bar',
      data: Object.values(data),
      label: {
        normal: {
          show: true,
          position: 'inside',
          formatter: '{c}%'
        }
      },
    }]
  });
}
