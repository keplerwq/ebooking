/*
全局请求配置
api.test({});
api.get({});
console.log(api._config);
如需手动配置，直接调用axios
https://github.com/mzabriskie/axios
*/
import axios from 'axios';
import apiConfig from './api-config';
import { willRequest, willRequestError, didRequest, didRequestError } from './axios-config';

// axios 默认参数
const defaultOptions = {
  timeout: 30000,
  errorHandling: true, // 当前接口是否使用统一的错误处理
  normalErrorHandling: true,
  withProgress: true,
  errorMessage: true,
};
const api = {
  _config: apiConfig
};

let customGlobalParams = {};

const instance = axios.create();
instance.interceptors.request.use(willRequest, willRequestError);
instance.interceptors.response.use(didRequest, didRequestError);

function isJsonFormat(method) {
  return ['PUT', 'POST', 'PATCH'].findIndex(x => x === method.toUpperCase()) > -1;
}

function pageHandlerFactory(config) {
  return (params, options) => {
    //处理分页转换
    params && params.offset && (params.offset = (params.offset - 1 ) * params.limit);

    const opts = Object.assign(
      {}, 
      defaultOptions,
      config, 
      options, 
    );

    const defaultHeader = {
      applicationId: 'supplier',
      // TODO; 配合后台，添加请求渠道的识别参数
      // 'n-d-version':
      //   '{"purchase-auth":"0.0.2","purchase-user":"0.0.2","purchase-permission":"0.0.2","purchase-form":"0.0.2","purchase-commodity":"0.0.2","purchase-supplier":"0.0.2","purchase-gateway":"0.0.2","purchase-backend":"0.0.2"}'
    }

    // 这个token只有新版登录登录成功后会存储，
    // 每次进入登录页一始，这个值会被清空
    const token = localStorage.getItem('ACCESS_TOKEN');

    if (token)
      defaultHeader.Authorization = `Bearer ${token}`;
    
    opts.headers = Object.assign({}, opts.headers || {}, defaultHeader);

    if (typeof params === 'string' || typeof params === 'number') {
      opts.url = `${opts.url}/${params}`;
      params = void 0;
    }

    // 当使用 POST 时，params 默认为 request.body，所以这里设置一个 query，给 url 添加参数
    if (Object.prototype.toString.call(options?.query) === '[object Object]') {
        let query = ''

        for (const [key, val] of Object.entries(options?.query)) {
          query += `${key}=${val}&`
        }

        if (query) {
          query = query.slice(0, -1)
          opts.url = opts.url.split('?')[0]
          opts.url = `${opts.url}?${query}`
        }
    }

    if (isJsonFormat(opts.method)) {

      opts.data = Array.isArray(params) ? params : Object.assign({}, customGlobalParams, params);
    } else if(opts.method === 'form-data') {

      const form = new FormData();
      Object.keys(params).forEach(key => form.append(key, params[key]));

      const newOpts = {method: 'post', data: form, headers: Object.assign(opts.headers || {}, { 'content-type': 'multipart/form-data' })};
      Object.assign(opts, newOpts);
    } else {

      opts.params = Object.assign({}, customGlobalParams, params);
    }
    return instance(opts);
  };
}

for (let key of Object.keys(apiConfig)) {
  api[key] = pageHandlerFactory(apiConfig[key]);
}

export default api;

// 设置全局参数，每个请求都会带上该参数
export function setGlobalParams(params) {
  customGlobalParams = params;
}