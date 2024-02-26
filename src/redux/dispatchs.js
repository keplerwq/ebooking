import { bindActionCreators } from '@reduxjs/toolkit';
import * as app from './modules/app';
import * as info from './modules/info';
import * as infoResources from './modules/infoResources';
import * as infoPublic from './modules/infoPublic';
import * as quoteResources from './modules/quoteResources';
import * as register from './modules/register';
import * as infoBase from './modules/infoBase';
import * as accountResources from './modules/accountResources';

const modules = { app, info, register, infoResources, infoPublic, infoBase, quoteResources, accountResources };
export default function dispatchs(...names) {
  let actions = {};
  for (let n of names) {
    Object.assign(actions, modules[n] || null);
  }
  // mapDispatchToProps
  return (dispatch, ownProps) => {
    return {
      actions: { ...bindActionCreators({ ...actions }, dispatch) },
      dispatch
    }
  }
}