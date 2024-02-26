import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';
import reducer from './reducers';

/**
 * ⚠️ 注意！
 * 🔧 旧的 redux 已经被替换为对 React 16/7 支持更好的 @reduxjs/toolkit 了。
 * 🚔 https://redux-toolkit.js.org
 * 🚗 接入状态请查看 ./reducers.js
 */

const middlewareConfig = {
  serializableCheck: false,
  immutableCheck: false
}

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(middlewareConfig).concat(thunk),
  devTools: import.meta.env.MODE !== 'production',
})

export default store;