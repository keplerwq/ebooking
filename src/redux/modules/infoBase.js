import _ from 'lodash';

const INFO_BASE_DATA = "infoBase/data";

const initialState = {
  initFormData: {}, //查询出供应商详情的原始数据，用于做最后确认的比对，比对后，需根据是否更改公司信息和资质信息，弹框二次确认
  updateForm: {
    //表单数据
  },
  logoFileList:[],

  licenseFile: [],
  companyLogoFile:[],
  companyIntroduce: [],
  securityRegistrationFile:[],
  techQualificationFile:[],
  authKeys:[],
  authUuid:0,
  branchKeys:[],
  branchUuid:0,
  bankKeys:[],
  bankUuid:0,
  caseKeys:[],
  caseUuid: 0,
  financeKeys:[],
  financeUuid:0,
  fundKeys:[],
  fundUuid:0,
  bizKeys:[],
  bizUuid:0
};

export default function infoBase(state = initialState, action = {}) {
  switch (action.type) {
    case INFO_BASE_DATA:
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
  return function(dispatch, getState) {
    const { updateForm } = getState();
    const nextForm = _.assign({}, updateForm, form);
    dispatch({
      type: INFO_BASE_DATA,
      updateForm: nextForm,
    });
  };
}

/**
 * 保存已上传的文件（地址）
 * @param {*} name
 * @param {*} fileList
 */
export function saveFile(name, file) {
  return function(dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      [name]: file,
    });
  };
}

/**
 *  保存联系人信息keys
 * @param {*}
 */

export function saveContactKeys(contactKeys, contactUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      contactKeys,
      contactUuid,
    });
  };
}

/**
 *  保存银行卡信息keys
 * @param {*}
 */

export function saveBankKeys(bankKeys, bankUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      bankKeys,
      bankUuid,
    });
  };
}

export function setEditStatus(name, status) {
  return function(dispatch, getState) {
    const editStatus = _.get(getState(), "info.editStatus", {});
    const nextStatus = _.assign({}, editStatus, { [name]: status });
    // console.log(nextStatus)
    dispatch({
      type: INFO_BASE_DATA,
      editStatus: nextStatus,
    });
  };
}

/**
 *  保存授权keys
 * @param {*}
 */
export function saveAuthKeys(authKeys, authUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      authKeys,
      authUuid
    });
  }
}

/**
 *  保存人员keys
 * @param {*}
 */
export function saveBizKeys(bizKeys, bizUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      bizKeys,
      bizUuid
    });
  }
}

export function saveBranchKeys(branchKeys, branchUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      branchKeys,
      branchUuid
    });
  }
}

export function saveCaseKeys(caseKeys, caseUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      caseKeys,
      caseUuid
    });
  }
}

export function saveFinanceKeys(financeKeys, financeUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      financeKeys,
      financeUuid
    });
  }
}

export function saveFundKeys(fundKeys, fundUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: INFO_BASE_DATA,
      fundKeys,
      fundUuid
    });
  }
}