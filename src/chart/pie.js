import _ from 'lodash';

const PIE_OPTION = {
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.name}: ${params.value}(${params.percent}%)`;
    }
  },
  color: ['#1fc1d2', '#26b069', '#83d161', '#fed95b'],
  legend: {
    orient: 'vertical',
    right: '10%',
    bottom: '20%',
    data: [] // ['name1', 'name2']
  },
  series: [{
    name: '',
    clockwise: false,
    type: 'pie',
    radius: '65%',
    center: ['50%', '50%'],
    data: [], // { value: 235, name: 'name1' },
  }],
};

const CIRCLE_OPTION = _.merge({}, PIE_OPTION, {
  series: [{
    name: '',
    clockwise: false,
    type: 'pie',
    radius: ['50%', '65%'],
    center: ['50%', '50%'],
    data: [] // { value: 235, name: 'name1' },
  }]
});

// 饼图
// data = { key: value, key2: value2} 或者 [{name, value}]
export function pie(data = {}, opts = {}) {
  let legendNames = [];
  let series = [];
  if (!Array.isArray(data)) {
    if (Object.keys(data).length === 0) {
      data = { '暂无数据': 0 };
    }
    series = Object.keys(data).map((key) => {
      return {
        value: data[key],
        name: key
      }
    })
  } else {
    if (data.length === 0) {
      data = [{ name: '暂无数据', value: 0 }];
    }
    series = data;
  }
  let option = _.merge({}, PIE_OPTION, opts);
  option.legend.data = legendNames;
  option.series[0].data = series;
  return option;
}

// 环状图
// data = { key: value, key2: value2} 或者 [{name, value}]
export function circle(data, opts = {}) {
  let option = _.merge({}, CIRCLE_OPTION, opts);
  return pie(data, option);
}

/*
  data = [{isp, flow}]
*/
export function ispFlow(data) {
  let list = data.data.map(x => {
    return { name: x.isp, value: x.flow };
  });
  return pie(list);
}

export function ispVisits(data) {
  let list = data.data.map(x => {
    return { name: x.isp, value: x.count };
  });
  return pie(list);
}
export function httpCode(data) {
  let list = data.data.map(x => {
    return { name: x.code, value: x.count };
  });
  return pie(list);
}

export function domainDevice(data) {
  let list = data.data.map(x => {
    return { name: x.device, value: x.count };
  });
  console.log(list);
  return pie(list);
}

export function domainFile(data) {
  let list = data.data.map(x => {
    return { name: x.file, value: x.count };
  });
  return pie(list);
}