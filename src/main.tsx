import './polyfills';
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import getRoutes from 'src/routes/route-index';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import store from 'src/redux/create';
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";
import 'moment/locale/zh-cn';
import './style/index.scss';

moment.locale('zh-cn');


// @ts-ignore
const release = NODE_SENTRY
const PRODUCTION = import.meta.env.MODE === 'production'

if (PRODUCTION) {
  Sentry.init({
    dsn: "https://c74ebb7f8d1a43c187d5f0ca5756e1a5@sentry.n.netease.com/1",
    // To set your release version
    release,
    integrations: [new Integrations.BrowserTracing()],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <HashRouter>
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        {getRoutes()}
      </ConfigProvider>
    </Provider>
  </HashRouter>,
  document.getElementById('root')
)
