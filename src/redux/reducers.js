import { combineReducers } from '@reduxjs/toolkit';
import app from './modules/app';
import info from './modules/info';
import infoResources from './modules/infoResources';
import quoteResources from './modules/quoteResources';
import infoPublic from './modules/infoPublic';
import register from './modules/register';
import infoBase from './modules/infoBase';
import accountResources from './modules/accountResources';
import contactsManage from 'src/pages/ContactsManage/reduxJs';
import roleManage from 'src/pages/RoleManage/reduxJs';
import roleRightsManage from 'src/pages/RoleManage/RoleRightsManage/reduxJs';
import quoteCommon from 'src/pages/QuoteCommon/reduxJs';


/**
 * ⚠️ 注意！
 * 🚗 这里是合并 Reducer 的地方,
 * 🔧 旧的 redux 已经被替换为对 React 16/7 支持更好的 @reduxjs/toolkit 了。
 * 🚔 不再建议在 ./modules 文件夹中编写公共的 state（容易全局污染），
 * 👀 请参考 https://redux-toolkit.js.org/api/createSlice 在各自页面组件中
 * 直接创建具有 namespace 特性的 redux 状态。
 */

export default combineReducers({
  //以下公共的 reducer，不再建议修改和添加，请参照下面每个页面对应一个 reducer 的方式
  app,
  info,
  register,
  infoResources,
  quoteResources,
  infoPublic,
  infoBase,
  accountResources,
  //以下每个页面对应一个 reducer
  contactsManage,
  roleManage,
  roleRightsManage,
  quoteCommon,
});