import _ from 'lodash';

const INFO_RESOURCES_DATA = 'infoResources/data';

const initialState = {
  initFormData: {},  //查询出供应商详情的原始数据，用于做最后确认的比对，比对后，需根据是否更改公司信息和资质信息，弹框二次确认
  updateForm: {   //表单数据
  },
  licenceFileList: [],
  contactKeys: [],
  contactUuid: 0,
  bankKeys: [],
  bankUuid: 0,
  editStatus: {
    company: false,
    contact: false,
    credentials: false,
    bank: false,
  },
  otherLicense: [],
  bankLicense: [],
  businessLicense: [],
  authorizationFile: []
};

export default function infoResources(state = initialState, action = {}) {
  switch (action.type) {
    case INFO_RESOURCES_DATA:
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
      type: INFO_RESOURCES_DATA,
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
      type: INFO_RESOURCES_DATA,
      [name]: file
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
      type: INFO_RESOURCES_DATA,
      contactKeys,
      contactUuid
    });
  }
}

/**
 *  保存银行卡信息keys
 * @param {*}
 */

export function saveBankKeys(bankKeys, bankUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_RESOURCES_DATA,
      bankKeys,
      bankUuid
    });
  }
}


export function setEditStatus(name, status) {
  return function (dispatch, getState) {
    const editStatus = _.get(getState(), 'info.editStatus', {});
    const nextStatus = _.assign({}, editStatus, { [name]: status });
    // console.log(nextStatus)
    dispatch({
      type: INFO_RESOURCES_DATA,
      editStatus: nextStatus,
    });
  }

}
