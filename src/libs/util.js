export function textEllipsis(text) {
  return subStringWithChinese(text, 40)
}

export function subStringWithChinese(str, len) {
  // eslint-disable-next-line
  var r = /[^\x00-\xff]/g;
  if (str.replace(r, "mm").length <= len) {
    return str;
  }
  // n = n - 3;    
  var m = Math.floor(len / 2);
  for (var i = m; i < str.length; i++) {
    if (str.substr(0, i).replace(r, "mm").length >= len) {
      return str.substr(0, i) + '...';
    }
  }
  return str;
}

(function () {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number}      The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function (value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function (value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function (value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }

})();


// 格式化金额
export function formatCashNumber(val, size, noPatch) {
  // 处理负号
  var minus = false;
  if ((val + "").indexOf("-") !== -1) {
    minus = true;
    val = (val + "").substring(1);
  }

  // size不传表示直接处理原值
  var showVal = parseFloat(val) + "";
  if (size) {
    var fixedVal = Math.round10(parseFloat(val), -size).toFixed(size);
    if (noPatch) {
      showVal = parseFloat(fixedVal) + "";
    }
    else {
      showVal = fixedVal;
    }
  }
  var intStr = showVal.split(".")[0];
  var decimalStr = showVal.split(".")[1];

  // 先反转，方便匹配
  var reverseStrs = intStr.split("").reverse();

  var newStr = "";
  for (var i = 0; i < reverseStrs.length; i++) {
    if (i !== 0 && i % 3 === 0) {
      newStr += ",";
    }
    newStr += reverseStrs[i];
  }

  // 处理无小数的情况
  if (!decimalStr) {

    // 再反正，进行恢复
    return (minus ? "-" : "") + newStr.split("").reverse().join("");
  }

  // 再反正，进行恢复
  return (minus ? "-" : "") + newStr.split("").reverse().join("") + "." + decimalStr;
}
// 用于显示格式化金额如：1,000,000.00的方法，当值为0或为空时显示为0.xxx
export function formatCashNullToZero(val, size) {
  if (!val && val !== 0) {
    return parseFloat(0).toFixed(size);
  }
  if (isNaN(val)) {
    return parseFloat(0).toFixed(size);
  }
  if (parseFloat(val) === 0) {
    return parseFloat(0).toFixed(size);
  }

  if (size === 0) {
    return parseFloat(val);
  }

  var result = formatCashNumber(val, size);
  if (parseFloat(result) === 0) {
    return parseFloat(0).toFixed(size);
  }
  return result;
}

// 计算字符实际长度，英文 = 1，中文 = 2
export function realLength(val) {
  var len = 0;
  for (var i = 0; i < val.length; i++) {
    var a = val.charAt(i);
    // eslint-disable-next-line
    if (a.match(/[^\x00-\xff]/ig) != null) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}

export function handleTrim(val) {
  if (typeof val !== 'string') return val
  return (val && val.trim()) || "";
}

