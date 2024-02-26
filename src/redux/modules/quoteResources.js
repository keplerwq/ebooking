import _ from 'lodash';
import api from 'src/api';

const QUOTE_RESOURCES_DATA = 'quoteResources/data';
const UPDATEQUOTEDTOTAL = Symbol('UPDATEQUOTEDTOTAL');

const initialState = {
  initFormData: {},  //初始数据
  updateForm: {}, //更新表单数据,
  auth: {},
  supplement: [],
  quotedTotal: 0
};


export default function quoteResources(state = initialState, action = {}) {
  switch (action.type) {
    case QUOTE_RESOURCES_DATA:
      return Object.assign({}, state, action);
    case UPDATEQUOTEDTOTAL:
      return {
        ...state,
        quotedTotal: action.quotedTotal
      }
    default:
      return state;
  }
}

/**
 * 更新表单数据
 * @param {*} updateForm 
 */
export function freshForm(form) {
  return function (dispatch, getState) {
    const updateForm = _.get(getState(), 'quoteResources.updateForm', {});
    const nextForm = _.assign({}, updateForm, form);
    dispatch({
      type: QUOTE_RESOURCES_DATA,
      updateForm: nextForm
    });
  }
}
/**
 * 清空表单数据
 * @param {*} updateForm 
 */
export function resetForm() {
  return function (dispatch) {
    dispatch({
      type: QUOTE_RESOURCES_DATA,
      updateForm: {}
    });
  }
}

/**
 * 删除表单数据
 * @param {*} updateForm 
 */
export function delForm(key) {

  return function (dispatch, getState) {
    const updateForm = _.get(getState(), 'quoteResources.updateForm', {});
    delete updateForm[key]
    dispatch({
      type: QUOTE_RESOURCES_DATA,
      updateForm: updateForm
    });
  }
}

/**
 * 复制表单数据
 * @param {*} updateForm 
 */
export function copyForm(key) {

  return function (dispatch, getState) {
    const updateForm = _.get(getState(), 'quoteResources.updateForm', {});
    // delete updateForm[key];
    updateForm.push(updateForm[key])

    dispatch({
      type: QUOTE_RESOURCES_DATA,
      updateForm: updateForm
    });
  }
}

/**
 * 获取新增报价权限
 */
export function getAuth(callback) {
  return function (dispatch) {
    api.getIDCCommonFieldList().then(res => {
      const { msg } = res;
      dispatch({
        type: QUOTE_RESOURCES_DATA,
        auth: msg
      });
      callback();
    })
  }
}


/**
 * 保存已上传的文件（地址）
 * @param {*} name 
 * @param {*} fileURL 
 */
export function saveFile(name, file) {
  
  return function (dispatch, getState) {
    dispatch({
      type: QUOTE_RESOURCES_DATA,
      [name]: file
    });
  }
}

export const getQuotedTotal = data => ({
  type: UPDATEQUOTEDTOTAL,
  ...data
})

export function setQuotedTotal(data) {
  return dispatch => {
    api.getIDCQuoteList({
      requireType: '',
      applicationId: '',
      pageNum: 1,
      pageSize: 10,
    }).then(({ code, msg }) => {
      if (code === 0) {
        const { count: quotedTotal } = msg
        dispatch(getQuotedTotal({quotedTotal}))
      } 
    })
  }
}


