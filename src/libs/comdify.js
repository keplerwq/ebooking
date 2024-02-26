import _ from 'lodash';
/**
 * 数字转千分位字符串
 * number: 传入的数字
 * fixed: 固定小数位数
 * defaultVal: 传入null或者undefined时的默认值
 */
export default function comdify(number, fixed = 2, defaultVal = '') {
  if (typeof(number) !== 'number') {
    if (number === null || typeof(number) === 'undefined') {
      return defaultVal;
    } else {
      return number;
    }
  } else {
    // 避免toFixed四舍五入的缺陷，牺牲一些性能
    const strNum = _.round(number, fixed).toFixed(fixed).toString();
    const reg = /\d{1,3}(?=(\d{3})+$)/g;
    const str = strNum.replace(/^(\d+)((\.\d+)?)$/, function(s, s1, s2){
      return s1.replace(reg, '$&,') + s2;
    });
    return str;
  }
}
