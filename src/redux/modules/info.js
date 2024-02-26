import _ from 'lodash';

const INFO_DATA = 'info/data';

const initialState = {
  initFormData: {},  //查询出供应商详情的原始数据，用于做最后确认的比对，比对后，需根据是否更改公司信息和资质信息，弹框二次确认
  updateForm: {   //表单数据
  },
  file: [],
  licenceFileList: [],
  invoiceFile: [],
  authorizationFile: [],
  keys: [],
  uuid: 0,
  categoryKeys: [],
  categoryUuid: 0,
  contactKeys: [],
  contactUuid: 0,
  editStatus: {
    company: false,
    contact: false,
    credentials: false,
  }
};

export default function info(state = initialState, action = {}) {
  switch (action.type) {
    case INFO_DATA:
      return Object.assign({}, state, action);
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
    const { updateForm } = getState();
    const nextForm = _.assign({}, updateForm, form);
    dispatch({
      type: INFO_DATA,
      updateForm: nextForm
    });
  }
}

/**
 * 保存已上传的文件（地址）
 * @param {*} name 
 * @param {*} fileList 
 */
export function saveFile(name, file) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_DATA,
      [name]: file
    });
  }
}

/**
 *  保存品牌keys
 * @param {*} 
 */

export function saveKeys(keys, uuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_DATA,
      keys,
      uuid
    });
  }
}

/**
 *  保存类目categorykeys
 * @param {*} 
 */

export function saveCategoryKeys(categoryKeys, categoryUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_DATA,
      categoryKeys,
      categoryUuid
    });
  }
}

/**
 *  保存联系人信息keys
 * @param {*} 
 */

export function saveContactKeys(contactKeys, contactUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_DATA,
      contactKeys,
      contactUuid
    });
  }
}



export function setEditStatus(name, status) {
  return function (dispatch, getState) {
    const editStatus = _.get(getState(), 'info.editStatus', {});
    const nextStatus = _.assign({}, editStatus, { [name]: status });
    // console.log(nextStatus)
    dispatch({
      type: INFO_DATA,
      editStatus: nextStatus,
    });
  }

}
