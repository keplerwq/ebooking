import config from 'src/config';
import { message } from 'src/components';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

let requestCount = 0;

// 加载进度条
nprogress.configure({ showSpinner: false });

function addProgress({ config } = {}) {
  if (!config?.withProgress)
    return;
  if (requestCount++ === 0) {
    nprogress.start();
  }
}

function removeProgress({ config } = {}) {
  if (!config?.withProgress)
    return;
  if (--requestCount === 0) {
    nprogress.done();
  }
}

// link to login
function toLogin(res) {
  // if (!isLinkToLogin && window.location.pathname !== res.data.redirect) {

  let isLinkToLogin = sessionStorage.getItem('isLinkToLogin');
  if (isLinkToLogin === '1') {
    message.loading('即将跳转到登录页面', 3, null, false);
    setTimeout(() => {
      if (config.isForcedLogin === true) {
        isLinkToLogin--;
        sessionStorage.setItem('isLinkToLogin', isLinkToLogin.toString());
        window.location = '#/login';
      }
    }, 3000);
  }
}

// Do something before request is sent
export function willRequest(config) {
  addProgress({ config });
  return config;
}

// Do something with request error
export function willRequestError(error) {
  removeProgress(error);
  return Promise.reject(error);
}

// Do something with response data 处理由后端抛出的错误
export async function didRequest(res) {

  const {errorMessage, errorHandling, normalErrorHandling} =  res?.config;

  removeProgress(res);
  // not handling error
  if (errorHandling === false)
    return res.data;

  // need login
  // 2005 和 res.data?.errorCode、res.data?.code 为旧版本鉴权契约
  // a000040(1|2) 和 res.data?.code 为新版本鉴权契约
  const invalidAccessRegular = /^2005|a000040(1|2)$/;
  if (invalidAccessRegular.test(res.data?.errorCode) || invalidAccessRegular.test(res.data?.code)) {
    let isLinkToLogin = sessionStorage.getItem('isLinkToLogin') ? parseInt(sessionStorage.getItem('isLinkToLogin')) : 0;
    isLinkToLogin++;
    sessionStorage.setItem('isLinkToLogin', isLinkToLogin.toString());
    toLogin(res);
    return Promise.reject(res);
  }

  if (
    // a0030005 未选择实体
    // a0050002 没有匹配的供应商
    /^a00(30005|50002)$/.test(res.data?.code)
  ) {
    import('src/pages/SetSupplierModal').then(({ default: setBizHandler }) =>
      setBizHandler(),
    );
    return Promise.reject(res);
  }

  // not handling normal error
  if (normalErrorHandling === false)
    return res.data;


  if((res.status >= 200 && res.status < 300) && res.data instanceof Blob && res.data.type === 'application/json')
    res.data = JSON.parse(await res.data.text())

  // 200 and type = ok
  //此处兼容两种接口处理方式,一种以供应商页面为例的接口(errorCode),一种以订单管理页面为例的接口(code),
  if ((res.status >= 200 && res.status < 300) && (res.data.errorCode === 0 || res.data.code == 0)) {
    return res.data;
  }

  if((res.status >= 200 && res.status < 300) && res.data instanceof Blob)
    return res;

  // show error
  if (errorMessage)
    message.error(res.data.msg, 6);
  return Promise.reject(res);
}

// Do something with response error 由网络或者服务抛出的错误
export function didRequestError(error) {
  removeProgress(error);
  let { config } = error;
  if (config?.errorHandling === false) {
    return error;
  }

  let msg = error.message;
  if (error.message.match(/timeout/)) {
    msg = '请求超时';
  } else if (error.response && error.response.data && (error.response.data.data || error.response.data.detail)) {
    msg = error.response.data.data || error.response.data.detail;
  } else {
    msg = '网络错误，请检查您的网络，稍后再试';
  }
  message.error(msg, 3);
  return Promise.reject(error);
}