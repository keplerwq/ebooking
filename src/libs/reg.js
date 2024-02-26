/**
 * 正则
 */
const reg = {
  chinaName: /(^[\u2E80-\uFE4F]{2,20}$)/,
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  password: /^\w{6,16}$/,
  passwordNewRule: /^(?!\d+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,20}$/,
  telephone: /^[1][0-9]{10}$/,
  code: /^[0-9a-zA-Z]+$/,
  tel: /^0\d{2,3}-?\d{7,8}$/,
  telOrPhone: /^[1][0-9]{10}$|^0\d{2,3}-?\d{7,8}$/
}

export default reg;