import config from 'src/config';
import api from 'src/api';
import _ from 'lodash';
import { regFormFormat, regRescourcesFormFormat,regPublicFormFormat,regBaseFormFormat } from 'src/helps/regFormSubmit'

const APP_DATA = 'app/data';
const INFO_DATA = 'info/data';
const INFO_BASE_DATA = 'infoBase/data';
const INFO_RESOURCES_DATA = 'infoResources/data';
const INFO_PUBLIC_DATA ='infoPublic/data';
const menuItemObj = {
  name: {
    name: '11',
    key: '/11'
  },
};

//状态转换
const mapStatusToText = (status) => {
  if (typeof (status) !== 'number') return '';
  if (status === -1) return '审核不通过';
  if (status === 0) return '审核中';
  if (status === 1) return '审核通过';

};

//状态转换
const mapBaseStatusToText = (status) => {
  if (typeof (status) !== 'number') return '';
  if (status === -1) return '已驳回';
  if (status === 0) return '待审核';
  if (status === 1) return '已审核';
};

//可选类目
const defaultCategory = [
  '电脑整机',
  '电脑配件',
  '手机整机',
  '手机配件',
  '电视整机',
  '电视配件',
  '外设产品',
  '数码影音',
  '智能设备',
  '软件',
  'SSL证书',
  '家居家装',
]

// antd上传属性
const isNewEdition = Boolean(localStorage.getItem('NEW_EDITION'));
const token = localStorage.getItem('ACCESS_TOKEN');

const uploadProps = {
  name: 'file',
  action: isNewEdition ? api._config.uploadNew.url + '?businessBucketType=supplier' : api._config.upload.url,
  headers: {},
};

if (isNewEdition && token) {
  Reflect.set(uploadProps.headers, 'authorization', `Bearer ${token}`);
}

const initialState = {
  config: config,
  api: api._config,
  clientWidth: document.documentElement.clientWidth,
  clientHeight: document.documentElement.clientHeight,
  // title: ['SM'],
  isLogin: false,
  userInfo: {}, //用户信息
  mapStatusToText,
  mapBaseStatusToText,
  defaultCategory,
  uploadProps,
  menuItemObj, //菜单模块对象
};

export default function app(state = initialState, action = {}) {
  switch (action.type) {
    case APP_DATA:
      return Object.assign({}, state, action);
    default:
      return state;
  }
}





// 设置页面标题
export function appSetTitle(titleList) {
  return {
    type: APP_DATA,
    title: titleList
  };
}

// 设置页面尺寸
export function setClientSize() {
  return {
    type: APP_DATA,
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight
  }
}


export function authGetInfo(accountType) {
  return async function (dispatch) {
    const isNewEdition = Boolean(localStorage.getItem('NEW_EDITION'));

    const getCurrentSupplier =
      () => JSON.parse(localStorage.getItem('USER_META_INFO'))?.supplierInfoDO;

    const apiRequest = isNewEdition ?
      api.supplierDetails.bind(null, getCurrentSupplier()?.id) : api.infoQuery;
    const data = {}
    const oneType = sessionStorage.getItem('oneType')
    if (oneType) {
      data.accountType = Number(oneType)
    }
    if (accountType !== '' && accountType !== undefined) {
      data.accountType = Number(accountType)
    }
    return apiRequest(data).then(res => {
      const { data } = res;

      // 通用类
      if (data.accountType === 0 /*||data.accountType === 2*/) {

        const initFormData = _.cloneDeep(data);
        let { updateForm, files, } = regFormFormat(data);
        updateFormFileDispatch(files, dispatch);

        const mainBrand = _.get(updateForm, 'company.mainBrand', []);
        const keys = mainBrand.map((b, index) => index);
        const uuid = keys.length;

        const category = _.get(updateForm, 'company.category', []);
        const categoryKeys = category.map((b, index) => index);
        const categoryUuid = categoryKeys.length;

        const contact = _.get(updateForm, 'contactList', []);
        const contactKeys = contact.map((b, index) => index);
        const contactUuid = contactKeys.length;

        updateForm.company.category = _.get(updateForm, 'company.category', []).map(cat => {
          return cat.split('&&&');
        })
        // console.log('category', updateForm.company.category)
        updateForm.company.bank = _.get(updateForm, 'qualification.bank', '');
        updateForm.company.legalRepresentative = _.get(updateForm, 'qualification.legalRepresentative', '');
        updateForm.company.bankAccountId = _.get(updateForm, 'qualification.bankAccountId', '');

        dispatch({ type: INFO_DATA, updateForm, keys, uuid, categoryKeys, categoryUuid, contactKeys, contactUuid, initFormData });
        dispatch({ type: APP_DATA, userInfo: updateForm, isLogin: true });

      // 资源类和硬件类
      } else if (data.accountType === 1 || data.accountType === 2) {
        const initFormData = _.cloneDeep(data);
        let { updateForm, files, } = regRescourcesFormFormat(data);
        updateFormFileResourcesDispatch(files, dispatch);

        const contact = _.get(updateForm, 'contactList', []);
        const contactKeys = contact.map((b, index) => index);
        const contactUuid = contactKeys.length;

        const bank = _.get(updateForm, 'bankInfoList', [])
        const bankKeys = bank.map((b, index)  => index);
        const bankUuid = bankKeys.length;

        dispatch({ type: INFO_RESOURCES_DATA, updateForm, contactKeys, contactUuid, bankKeys, bankUuid, initFormData });
        dispatch({ type: APP_DATA, userInfo: updateForm, isLogin: true });
        //基建类
      } else if (+data.accountType === 20) {
        const initFormData = _.cloneDeep(data);
        let { updateForm,files } = regBaseFormFormat(data);
        updateFormFileBaseDispatch(files,dispatch)
        const bizContact = _.get(updateForm, 'contactInfo.bizContact', []);
        const credentialsInfoList = _.get(updateForm, 'credentialsInfoList', []);
        const subCompanyList = _.get(updateForm, 'subCompanyList', []);
        const paidInList = _.get(updateForm, 'paidInList', []);
        const financialList = _.get(updateForm, 'financialList', []);
        const caseList = _.get(updateForm, 'caseList', []);
        const bankCardList = _.get(updateForm, 'bankCardList', []);
        const bizKeys = bizContact.map((b, index) => index);
        const authKeys = credentialsInfoList.map((b, index) => index);
        const branchKeys = subCompanyList.map((b, index) => index);
        const fundKeys = paidInList.map((b, index) => index);
        const financeKeys = financialList.map((b, index) => index);
        const caseKeys = caseList.map((b, index) => index);
        const bankKeys = bankCardList.map((b, index) => index);
        const bizUuid = bizKeys.length;
        const authUuid = authKeys.length;
        const branchUuid = branchKeys.length;
        const fundUuid = fundKeys.length;
        const financeUuid = financeKeys.length;
        const caseUuid = caseKeys.length;
        const bankUuid = bankKeys.length;

        dispatch({ type: APP_DATA, userInfo: updateForm, isLogin: true });
        dispatch({ type: INFO_BASE_DATA, updateForm,initFormData, bizKeys,bizUuid,authKeys,authUuid,branchKeys,branchUuid,bankKeys,bankUuid,caseKeys,caseUuid,financeKeys,financeUuid,fundKeys,fundUuid});
      }
      //新系统-行政类
      else if (sessionStorage.getItem('isAccountType') === '10')
      {
        const initFormData = _.cloneDeep(data);
        let { updateForm,files} = regPublicFormFormat(data);
        updateFormFilePublicDispatch(files, dispatch);
        const contact = _.get(updateForm, 'contactList', []);
        const contactKeys = contact.map((b, index) => index);
        const contactUuid = contactKeys.length;

        const bank = _.get(updateForm, 'bankCardList', [])
        const bankKeys = bank.map((b, index)  => index);
        const bankUuid = bankKeys.length;

        const authorization =_.get(updateForm,'credentialsInfoList',[]);
        const authorKeys = authorization.map((b, index) => index);
        const authorUuid = authorKeys.length;

        const financial =_.get(updateForm,'financialList',[]);
        const financialKeys = financial.map((b, index) => index);
        const financialUuid = financialKeys.length;

        const customer =_.get(updateForm,'customerList',[]);
        const customerKeys = customer.map((b, index) => index);
        const customerUuid = customerKeys.length;

        // TODO: 调试时，下面这行可以切换账号的审核状态
        // updateForm.emailAccount.status = 1;
        dispatch({ type: APP_DATA, userInfo: updateForm, isLogin: true });
        dispatch({ type: INFO_PUBLIC_DATA, updateForm,initFormData,contactKeys, contactUuid, bankKeys, bankUuid,authorKeys, authorUuid,financialKeys,financialUuid,customerKeys,customerUuid });

      }

    })
  }
}

function updateFormFileDispatch(files, dispatch) {
  const licenceFileList = files.licenceFileList;
  const invoiceFile = files.invoiceFile;
  const authorizationFile = files.authorizationFile;
  const file = files.file;
  dispatch({
    type: INFO_DATA,
    licenceFileList,
    invoiceFile,
    authorizationFile,
    file,
  });

}
function updateFormFileResourcesDispatch(files, dispatch) {
  const licenceFileList = files.licenceFileList;
  const otherLicense = files.otherLicense;
  const businessLicense = files.businessLicense;
  const bankLicense = files.bankLicense;
  dispatch({
    type: INFO_RESOURCES_DATA,
    licenceFileList,
    otherLicense,
    businessLicense,
    bankLicense
  });

}
function updateFormFilePublicDispatch(files, dispatch) {
  const licenseFile = files.licenseFile;
  dispatch({
    type: INFO_PUBLIC_DATA,
    licenseFile
  });

}

function updateFormFileBaseDispatch(files, dispatch) {
  const companyLogoFile = files.companyLogoFile;
  const companyIntroduce = files.companyIntroduce;
  const licenseFile = files.licenseFile;
  const securityRegistrationFile = files.securityRegistrationFile;
  const subLicenseFile = files.subLicenseFile;
  const qualificationFile = files.qualificationFile;
  dispatch({
	  type: INFO_BASE_DATA,
	  companyLogoFile,
	  companyIntroduce,
	  licenseFile,
	  securityRegistrationFile,
	  subLicenseFile,
	  qualificationFile
  });
}
