import reg from './reg';

const descriptor = {
  chinaName: { type: 'string', pattern: reg.chinaName, message: '请填写2-20位汉字' },
  email: { type: 'string', pattern: reg.email, message: '请填写正确的邮箱地址' },
  password: { type: 'string', pattern: reg.password, message: '密码由6-16位字母数字或下划线组成' },
  passwordNewRule: { type: 'string', pattern: reg.passwordNewRule, message: '密码由6-20位字母加数字组成' },
  telephone: { type: 'string', pattern: reg.telephone, message: '请输入正确的手机号码' },
  code: { type: 'string', pattern: reg.code, message: '请输入正确的验证码格式' },
  tel: { type: 'string', pattern: reg.tel, message: '请输入正确的座机号码' },
  telOrPhone: { type: 'string', pattern: reg.telOrPhone, message: '请输入正确的电话' }
};

export default descriptor;