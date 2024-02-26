
const REGISTER_DATA = "register/data";
const REGISTER_DATA_RESET = "register/data/reset";
const REGISTER_DATA_SET_CONTACTS_INFO = "register/data/setContactsInfo";
const initialState = {
  step: 1,
  registerForm: {
    company: {
      area: {
        country: "china",
      },
    },
    emailAccount: {
      accountType: 0,
    },
    resourcesCompany: {
      area: {
        country: "china",
      },
    },
    contactList:{},
    contactInfo: {},
    qualification:{
      registrationOrganArea: {
        country: "china",
      },
      // check:false
    },
    credentialsInfoList:[],
    financialList:[],
    customerList:[],
    resourcesContact: [{ position: "供应商商务对接人" }, { position: "供应商技术对接人" }],
  },
  fileList: [],
  licenceFileList: [],
  licenseFileList: [],
  invoiceFile: [],
  authorizationFile: [],
  keys: [0],
  uuid: 1,
  categoryKeys: [0],
  categoryUuid: 1,
  resourcesLicenceFileList: [],
  businessLicense: [],
  bankLicense: [],
  otherLicense: [],
  //行政
  credentialsKeys: [],
  credentialsUuid: 0,
  financialKeys:[],
  financialUuid:0,
  customerKeys:[],
  customerUuid:0,
  publiclicenseFile:[],
  //基建
  logoFileList: [],
  authKeys: [],
  authUuid: 0,
  branchKeys: [],
  branchUuid: 0,
  licenseFile: [],
  companyLogoFile: [],
  companyIntroduce: [],
  securityRegistrationFile: [],
  techQualificationFile: [],
  caseKeys: [],
  caseUuid: 0,
  financeKeys: [],
  financeUuid: 0,
  fundKeys: [],
  fundUuid: 0,
};

export default function register(state = initialState, action = {}) {
  switch (action.type) {

    case REGISTER_DATA:
      return Object.assign({}, state, action);

    case REGISTER_DATA_RESET:
      return initialState;

    case REGISTER_DATA_SET_CONTACTS_INFO:

      const newState = {...state};
      const contactsInfo = newState.registerForm.contactList;
      Object.assign(contactsInfo, action.values);
      return newState;

    default:
      return state;
  }
}


/**
 * Reset
 */
export function registerDataReset() {
  return {
    type: REGISTER_DATA_RESET
  }
}

/**
 * 设置 state.registerForm.contactList
 * @param {*} values
 */
export function setContactsInfo(values) {
  return {
    type: REGISTER_DATA_SET_CONTACTS_INFO,
    values,
  }
}

/**
 * 切换步骤
 * @param {*} step
 */

export function changeStep(step, cb) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      step,
    });

    cb && cb();
  };
}

/**
 * 更新注册表单数据
 * @param {*} registerForm
 */
export function freshForm(registerForm) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      registerForm,
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
      type: REGISTER_DATA,
      [name]: file,
    });
  };
}

/**
 *  保存品牌keys
 * @param {*}
 */

export function saveKeys(keys, uuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      keys,
      uuid,
    });
  };
}

/**
 *  保存类目categorykeys
 * @param {*}
 */

export function saveCategoryKeys(categoryKeys, categoryUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      categoryKeys,
      categoryUuid,
    });
  };
}

export function saveAuthKeys(authKeys, authUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      authKeys,
      authUuid,
    });
  };
}

/**
 *  保存公司信息授权及资质证明keys
 * @param {*}
 */

export function saveCredentialsKeys(credentialsKeys, credentialsUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      credentialsKeys,
      credentialsUuid
    });
  }
}

/**
 *  保存近三年财务信息keys
 * @param {*}
 */

export function saveFinancialKeys(financialKeys, financialUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      financialKeys,
      financialUuid
    });
  }
}


/**
 *  保存主要客户信息keys
 * @param {*}
 */

export function saveCustomerKeys(customerKeys, customerUuid) {
  return function (dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      customerKeys,
      customerUuid
    });
  }
}
export function saveBranchKeys(branchKeys, branchUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      branchKeys,
      branchUuid,
    });
  };
}

export function saveCaseKeys(caseKeys, caseUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      caseKeys,
      caseUuid,
    });
  };
}

export function saveFinanceKeys(financeKeys, financeUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      financeKeys,
      financeUuid,
    });
  };
}

export function saveFundKeys(fundKeys, fundUuid) {
  return function(dispatch, getState) {
    dispatch({
      type: REGISTER_DATA,
      fundKeys,
      fundUuid,
    });
  };
}
