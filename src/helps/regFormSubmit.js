import _ from 'lodash';
import moment from 'moment';

import { convertAcceptDataToOld } from '../utils/convert'

export function regFormSubmit(form) {
  // console.log(form, 'regFormSubmit 1');
  // debugger
  if (form.emailAccount.accountType === 0 || form.accountType === 0 /* ||form.emailAccount.accountType === 2 || form.accountType === 2 */) {
    /* it类 */

    /* 删除资源类字段 */
    delete form.resourcesLicenceFileList
    delete form.resourcesCompany
    delete form.resourcesContact
    delete form.resourcesQualification
    delete form.businessLicense
    delete form.otherLicense

    const areaArray = _.get(form, 'company.areaArray', []);

    const area = {
      province: areaArray[0],
      city: areaArray[1],
      county: areaArray[2],
    }

    form.company.area = _.assign({}, form.company.area, area);
    form.company.file = form.file;
    form.company.category = form.company.category && form.company.category.map(cat => { return cat.join('&&&') });

    form.qualification.legalRepresentative = form.company.legalRepresentative;
    form.qualification.bank = form.company.bank;
    form.qualification.bankAccountId = form.company.bankAccountId;


    form.qualification.authorizationFile = form.authorizationFile;
    form.qualification.licenceFileList = form.licenceFileList;

    delete form.company.areaArray
    delete form.company.legalRepresentative
    delete form.company.bank
    delete form.company.bankAccountId

    delete form.emailAccount.confirmPassword

    delete form.licenceFileList
    delete form.authorizationFile
    delete form.file




    // console.log(form,'regFormSubmit 2')
    // debugger

    return form;
  } else if (form.emailAccount.accountType === 1 || form.accountType === 1 ||
    form.emailAccount.accountType === 2 || form.accountType === 2) {
    /* 服务类 */

    /* 删除it类字段 */
    delete form.file

    /* 区分是注册还是修改信息 */
    if (form.resourcesCompany) {
      form.company = form.resourcesCompany;
      if (form.emailAccount.accountType === 1 || form.accountType === 1) {
        form.contactList = form.resourcesContact;
        delete form.contact;
      } else if (form.emailAccount.accountType === 2 || form.accountType === 2) {
        form.contact.position = '供应商商务对接人';
      }
      form.qualification = form.resourcesQualification;
      form.qualification.licenceFileList = form.resourcesLicenceFileList;

      delete form.resourcesCompany;
      delete form.resourcesContact;
      delete form.resourcesQualification;
      delete form.resourcesLicenceFileList;
    } else {
      // 资质文件信息写入bankInfoList
      form.bankInfoList.forEach((item, index) => {
        form.bankInfoList[index].legalRepresentative = form.qualification.legalRepresentative;
        form.bankInfoList[index].licenceId = form.qualification.licenceId;
        form.bankInfoList[index].licenceFileList = form.licenceFileList;
        form.bankInfoList[index].licenceFile = (Array.isArray(form.licenceFileList) && form.licenceFileList.join('&&&')) || '';
        form.bankInfoList[index].otherLicense = form.otherLicense;
        if (form.emailAccount.accountType === 1 || form.accountType === 1) {
          form.bankInfoList[index].businessLicense = form.businessLicense;
          form.bankInfoList[index].bankLicense = form.bankLicense;
        } else {
          form.bankInfoList[index].authorizationFile = form.authorizationFile;
        }
      })
    }

    const areaArray = _.get(form, 'company.areaArray', []);

    const area = {
      province: areaArray[0],
      city: areaArray[1],
      county: areaArray[2],
    }

    form.company.area = _.assign({}, form.company.area, area);
    delete form.company.areaArray;
    // 资源类 vs 硬件类资质文件
    if (form.emailAccount.accountType === 1 || form.accountType === 1) {
      form.qualification.businessLicense = form.businessLicense;
      form.qualification.bankLicense = form.bankLicense;
    } else {
      form.qualification.authorizationFile = form.authorizationFile;
    }
    form.qualification.otherLicense = form.otherLicense;

    delete form.authorizationFile;
    delete form.businessLicense;
    delete form.licenceFileList;
    delete form.otherLicense;
    delete form.bankLicense;

    return form;
  }
}


export function convertPublicFormData(form = {}) {
  const {
    company,
    emailAccount,
    contactList,
    qualification,
    credentialsInfoList,
    financialList,
    customerList,
  } = form;

  const newForm = {
    "bizCode": "administration",
    "bizName": "职能采购",
    "companyName": company?.companyName,
    "bizScopes": `[${company?.bizScopes}]`,
    "companyType": company?.companyType,
    "areaAddress": {
      "province": company?.areaArray?.[0],
      "city": company?.areaArray?.[1],
      "county": company?.areaArray?.[2]
    },
    "companyAddress": company?.companyAddress,
    "contractAccount":{
      "email": emailAccount?.email,
      "userName": contactList?.contactName,
      "phoneNo": contactList?.mobilePhone,
      "gender": contactList?.gender,
      "duties": contactList?.position,
      "password": emailAccount?.password,
    },

    "qualification": {
      "licenseId": qualification?.licenseId,
      "taxerId": qualification?.taxerId,
      "legalRepresentative":  qualification?.legalRepresentative,
      "companyRegisterTime": moment(qualification?.companyRegisterTime).valueOf(),
      "licenseExpireTime": moment(qualification?.licenseExpireTime).valueOf(),
      "registerMoney": qualification?.registerMoney,
      "licenseFile": form?.publiclicenseFile,
    },
    "credentialsInfoList": credentialsInfoList?.map?.(el => ({
      "qualificationName": el.qualificationName,
      "qualificationNo": el.qualificationNo,
      "organizationName": el.organizationName,
      "expireStart": moment(el.expireDate[0]).valueOf(),
      "expireEnd": moment(el.expireDate[1]).valueOf(),
      "qualificationFile": el.qualificationFile
    })),
    "bankCardList": [{
      "bankName": company?.bankName,
      "bankAccountName": company?.bankAccountName,
      "bankAccountId": company?.bankAccountId,
      "settCurrency": company?.settCurrency,
      // "swiftCode":"SWIFT",
      // TODO 这里需要后端确认，是否必传，因为前端页面没有这项输入
      "bankAddress":"china"
    }],
    "financialList": financialList?.map?.(el => ({
      "reportYear": el.reportYear,
      "bizIncome": el.bizIncome,
      "totalProfit": el.totalProfit,
      "paidInCapital": el.paidInCapital,
      "auditReportFile": el.auditReportFile
    })),
    "customerList": customerList?.map?.(el => ({
      "customerName": el.customerName,
      "serveStart": moment(el.serveStart).valueOf(),
      "onServe": Boolean(el.onServe),
      "introduceFile": el.introduceFile
    }))
  };
  return newForm;
}



export function regPublicFormSubmit(form) {
  //文件处理
  form.qualification.licenseFile = form.licenseFile;
  delete form.licenseFile;


  const areaArray = _.get(form,'company.areaArray',[])
  const area = {
    province:areaArray[0],
    city:areaArray[1],
    county:areaArray[2]
  }
  form.company.area = _.assign({},form.company.area,area);
  delete form.company.areaArray;

  //时间戳
  form.qualification.companyRegisterTime = moment(form.qualification.companyRegisterTime).valueOf();
  form.qualification.licenseExpireTime = moment(form.qualification.licenseExpireTime).valueOf();

  form.credentialsInfoList.forEach(item => {
    let [expireStart,expireEnd] = item.expireDate;

    item.expireStart = moment(expireStart).valueOf();
    item.expireEnd = moment(expireEnd).valueOf();

    delete item.expireDate;
  })
  form.customerList.forEach(item => {
    item.serveStart = moment(item.serveStart).valueOf();
  })


  // form.contactInfo.bizContact = _.isArray(form.contactInfo.bizContact) ? form.contactInfo.bizContact : [form.contactInfo.bizContact];
  delete form.resourcesCompany
  delete form.resourcesContact
  delete form.contactInfo

  return form
}

export function regFormFormat(form) {
  const area = _.get(form, 'company.area', {});

  const areaArray = [
    area.province, area.city, area.county,
  ];

  form.company.areaArray = areaArray;

  form.authorizationFile = form.qualification.authorizationFile;
  form.licenceFileList = form.qualification.licenceFileList;
  form.file = form.company.file;

  let files = {
    licenceFileList: form.qualification.licenceFileList.map((item, index) => {
      return {
        uid: index,
        name: item,
        response: { errorCode: 0, data: item },
        status: 'done',
        url: item,
      }
    }),
    authorizationFile: [
      {
        uid: -1,
        name: form.qualification.authorizationFile,
        status: 'done',
        url: form.qualification.authorizationFile,
      }
    ],
    file: form.company.file ? [
      {
        uid: -1,
        name: form.company.file,
        status: 'done',
        url: form.company.file,
      }
    ] : [],

  };

  // console.log(form)
  return {
    files,
    updateForm: form,
  };

}

export function regRescourcesFormFormat(form) {
  const area = _.get(form, 'company.area', {});

  const areaArray = [
    area.province, area.city, area.county,
  ];

  form.company.areaArray = areaArray;
  // 资质信息从第一个银行卡信息中取
  const qualification = (form.bankInfoList && form.bankInfoList[0]) || {};

  form.licenceFileList = qualification.licenceFileList;
  form.businessLicense = qualification.businessLicense;
  form.otherLicense = qualification.otherLicense;
  form.bankLicense = qualification.bankLicense;
  form.authorizationFile = qualification.authorizationFile;

  let files = {
    licenceFileList: form.qualification.licenceFileList.map((item, index) => {
      return {
        uid: index,
        name: item,
        response: { errorCode: 0, data: item },
        status: 'done',
        url: item,
      }
    }),
    businessLicense: [
      {
        uid: -1,
        name: form.qualification.businessLicense,
        status: 'done',
        url: form.qualification.businessLicense,
      }
    ],
    otherLicense: [
      {
        uid: -1,
        name: form.qualification.otherLicense,
        status: 'done',
        url: form.qualification.otherLicense,
      }
    ],
    bankLicense: [
      {
        uid: -1,
        name: form.qualification.bankLicense,
        status: 'done',
        url: form.qualification.bankLicense,
      }
    ],
    authorizationFile: [
      {
        uid: -1,
        name: form.qualification.authorizationFile,
        status: 'done',
        url: form.qualification.authorizationFile,
      }
    ]
  };

  // console.log(form)
  return {
    files,
    updateForm: form,
  };

}


//新版本-行政供应商详情-转换为旧版本的数据
export function convertResourcesFormData(form) {

  const { bankCardList, qualification, contractUser, areaAddress, customerList, credentialsInfoList } = form;

  const newForm = {
    bankCardList: bankCardList?.map(el => (
      {
        bankAccountName: el?.bankAccountName,
        settCurrency: el?.settCurrency,
        bankAccountId: el?.bankAccountId,
        bankName: el?.bankName,
        id: el?.id,
        bankAddress: el?.bankAddress,
      }
    )),
    qualification: {
      taxerId: qualification?.taxerId,
      licenseExpireTime: qualification?.licenseExpireTime,
      legalRepresentative: qualification?.legalRepresentative,
      companyRegisterTime: qualification?.companyRegisterTime,
      registerMoney: qualification?.registerMoney,
      id: qualification?.id,
      licenseId: qualification?.licenseId,
      licenseFile: qualification?.licenseFile,
    },
    accountType: 10,
    // TODO emailAccount 数据源待确认
    emailAccount: {
      modifyTime: form.updateTime,
      createTime: form.createTime,
      accountType: 10,
      id: form.id,
      email: contractUser?.[0]?.email,
      name:  contractUser?.[0]?.userName,
      refuseReason: form.refuseReason,
      status: form.status,
    },
    financialList: form.financialList.map(el => ({
      reportYear: el?.reportYear,
      totalProfit: el?.totalProfit,
      bizIncome: el?.bizIncome,
      id: el?.id,
      auditReportFile: el?.auditReportFile,
      paidInCapital: el?.paidInCapital,
      // TODO: 该字段缺失
      // auditReportFileData: [
      //   {
      //     uid: 0,
      //     name:
      //         "https://nos.netease.com/crm-test/BPS资源—提单功能迭代-6b2814bfb8054e5b9b96fb92473aa663.doc",
      //     status: "done",
      //     url:
      //         "https://nos.netease.com/crm-test/BPS资源—提单功能迭代-6b2814bfb8054e5b9b96fb92473aa663.doc",
      //   },
      // ],
    })),
    company: {
      area: { province: areaAddress.split('-')[0], city: areaAddress.split('-')[1], county: areaAddress.split('-')[2] },
      // bankAccountName: "行政测试开户名",
      // settCurrency: "人民币",
      companyName: form.companyName,
      companyAddress: form.companyAddress,
      // bankAccountId: "4512687451245",
      areaAddress: areaAddress.replace(/-/g, '/'),
      // bankName: "滨江区开户行",
      id: form.id,
      bizScopes: form.bizScopes?.slice(1, -1)?.split(','),
      areaArray: areaAddress.split('-'),
    },
    customerList: customerList.map(el => ({
      serveStart: el.serveStart,
      introduceFile: el.introduceFile,
      onServe: el.onServe,
      id: el.id,
      customerName: el.customerName,
      // TODO 该字段缺失
      // introduceFileData: [
      //   {
      //     uid: 0,
      //     name:
      //       "https://nos.netease.com/crm-test/BPS资源—提单功能迭代-8decf3e389dc4094a2841dcfbf4f3d5e.doc",
      //     status: "done",
      //     url:
      //       "https://nos.netease.com/crm-test/BPS资源—提单功能迭代-8decf3e389dc4094a2841dcfbf4f3d5e.doc",
      //   },
      // ],
    })),
    credentialsInfoList: credentialsInfoList.map(el => ({
      organizationName: el.organizationName,
      expireEnd: el.expireEnd,
      expireStart: el.expireStart,
      qualificationFile: el.qualificationFile,
      id: el.id,
      qualificationName: el.qualificationName,
      qualificationNo: el.qualificationNo,
      // TODO 以下三个字段缺失
      // expireTime: "2020-12-29 至 2021-01-06",
      // expireDate: ["2020-12-29T02:27:24.325Z", "2021-01-06T02:27:24.325Z"],
      // qualificationFileData: [
      //   {
      //     uid: 0,
      //     name:
      //       "https://nos.netease.com/crm-test/61579-060495c0caa24b8daeca1d738358c95a.jpg",
      //     status: "done",
      //     url:
      //       "https://nos.netease.com/crm-test/61579-060495c0caa24b8daeca1d738358c95a.jpg",
      //   },
      // ],
    })),
    // licenseFile:
    //   "https://nos.netease.com/crm-test/fc7dc1afd09bdcbfe240eb8f12ad0cb-d3660a59c6f1498dafc11dc8c5cdbc78.png",
  };

  return newForm;
}



//行政详情-转换为组件需要的数据
export function regPublicFormFormat(rawForm) {
  const form = localStorage.getItem('NEW_EDITION') ?
    // convertResourcesFormData(rawForm) :
    convertAcceptDataToOld(rawForm) :
    rawForm;

  //数字处理
  // form.qualification.registerMoney=Number(form.qualification.registerMoney);
  form.qualification.registerMoney=Number(form.qualification && form.qualification.registerMoney);
  form.financialList.forEach((item)=>{
    item.bizIncome=Number(item.bizIncome);
    item.paidInCapital=Number(item.paidInCapital);
    item.totalProfit=Number(item.totalProfit);
  })
  //文件处理

  form.licenseFile = form.qualification.licenseFile;

  //地址处理
  const area = _.get(form, 'company.area', {});
  const areaArray = [
    area.province, area.city, area.county,
  ];
  form.company.areaArray = areaArray;
  //时间处理
  form.credentialsInfoList && form.credentialsInfoList.forEach((item) => {
    if (item.expireStart && item.expireEnd) {
      item.expireTime = moment(item.expireStart).format("YYYY-MM-DD")+ " 至 "
       +moment(item.expireEnd).format("YYYY-MM-DD");
      item.expireDate = [moment(item.expireStart),
        moment(item.expireEnd)]
    } else {
      item.expireTime = "";
      item.expireDate = []
    }
  })
  form.qualification.companyRegisterTime = moment(form.qualification.companyRegisterTime);
  form.qualification.licenseExpireTime = moment(form.qualification.licenseExpireTime);
  form.customerList && form.customerList.forEach((item) => {
    if (item.serveStart) {
      item.serveStart = moment(item.serveStart);
    } else {
      item.serveStart = "";
    }
  })

  form.credentialsInfoList.forEach((item,index) => {
    item.qualificationFileData = item.qualificationFile ? [
      {
        uid: index,
        name: item.qualificationFile,
        status: 'done',
        url: item.qualificationFile,
      }
    ] : []
  });
  form.customerList.forEach((item,index) => {
    item.introduceFileData = item.introduceFile ? [
      {
        uid: index,
        name: item.introduceFile,
        status: 'done',
        url: item.introduceFile,
      }
    ] : []
  });
  form.financialList.forEach((item,index) => {
    item.auditReportFileData = item.auditReportFile ? [
      {
        uid: index,
        name: item.auditReportFile,
        status: 'done',
        url: item.auditReportFile,
      }
    ] : []
  });

  let files = {
    licenseFile:form.qualification.licenseFile ?[
      {
        uid: -1,
        name: form.qualification.licenseFile,
        status: 'done',
        url: form.qualification.licenseFile
      }
    ]:[]
  };
  return {
    files,
    updateForm: form
  };

}



export function regQuoteResourcesFormReverse(item) {
  console.log(item)
  if (item.supplierType === 'CDN') {
    item.item2 = item.item2.split();
    // item.item3 = item.item3.split();
    item.unit = item.unit.split();
    item.usageUnit = item.usageUnit.split();
    item.priceUnit = item.priceUnit.split();
    item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
    // item.validityPeriod = moment("2020-02-04","YYYY-MM-DD");
  } else if (item.supplierType === '云服务') {
    // item.item2 = item.item2.split();
    // item.item3 = item.item3.split();
    item.priceUnit = item.priceUnit.split();
    item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
  } else if (item.supplierType === 'IDC') {
    if (item.secondType === '线路') {
      item.bothEnds = item.bothEnds.split();
      // item.routeType = item.routeType.split();
      item.item2 = item.item2.split();
      item.item3 = item.item3.split();
      item.priceUnit = item.priceUnit.split();
      item.usageUnit = item.usageUnit.split();
      item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
    } else if (item.secondType === '主体机房') {
      item.item2 = item.item2.split();
      item.item3 = item.item3.split();
      item.unit = item.unit.split();
      item.usageUnit = item.usageUnit.split();
      item.priceUnit = item.priceUnit.split();
      // 李栋大佬让我注释city
      // item.city = [];
      console.log(item.validityPeriod);
      item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
      console.log(item.validityPeriod);
    } else if (item.secondType === '外围机房') {
      item.item2 = item.item2.split();
      item.item3 = item.item3.split();
      item.unit = item.unit.split();
      item.usageUnit = item.usageUnit.split();
      item.priceUnit = item.priceUnit.split();
      // let x = item.area
      // item.area = x[0];
      // item.operator = x[1].split();
      item.operators = item.operators && item.operators.split();
      // 李栋大佬让我注释city
      // item.city = [];
      item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
    }
  } else if (item.supplierType === '海外资源') {
    item.item2 = item.item2.split();
    item.item3 = item.item3.split();
    item.unit = item.unit.split();
    item.usageUnit = item.usageUnit.split();
    item.operators = item.operators === '' ? undefined : item.operators.split();
    item.priceUnit = item.priceUnit.split();
    // 李栋大佬让我注释city
    // item.city = [];
    item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
  } else if (item.supplierType === '固网及文印' || item.supplierType === '其他') {
    // item.item2 = item.item2.split();
    // item.item3 = item.item3.split();
    item.unit = item.unit.split();
    item.usageUnit = item.usageUnit.split();
    item.priceUnit = item.priceUnit.split();
    item.validityPeriod = moment(item.validityPeriod, "YYYY-MM-DD");
  }
  const result = item.area && item.area.split('-');
  if (result && result.length) {
    if (result.length === 1) {
      item.area = result[0];
    }
    if (result.length === 2) {
      item.roomName = result[1];
      item.area = result[0];
    } else if (result.length > 2) {
      item.roomName = result[1] + result[2] + result[3];
      item.area = result[0];
    }
  }
  return item;
}


export function regQuoteResourcesFormSubmit(formObj, allListObj, fixListObj) {
  const form = Object.values(formObj);
  const allList = Object.values(allListObj);
  const fixList = Object.values(fixListObj);
  /* 循环一次表单，格式化分为通用的和某些特有的两种 */
  form.forEach((item, index) => {
    delete item.secondName;
    if (item.statusName !== '再次报价' && item.statusName!== '草稿' ) {
      if (item.supplierType === 'CDN') {
        item.item2 = item.item2.join();
        // item.item3 = item.item3.join();
        item.unit = item.unit.join();
        item.usageUnit = item.usageUnit.join();
        item.priceUnit = item.priceUnit.join();
        item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
      } else if (item.supplierType === '云服务') {
        // item.item2 = item.item2.join();
        // item.item3 = item.item3.join();
        // item.unit = item.unit.join();
        // item.usageUnit = item.usageUnit.join();
        item.priceUnit = item.priceUnit && item.priceUnit.join();
        item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
      } else if (item.supplierType === 'IDC') {
        if (item.secondType === '线路') {
          item.bothEnds = item.bothEnds.join();
          // item.routeType = item.routeType.join();
          item.item2 = item.item2.join();
          item.item3 = item.item3.join();
          // item.unit = item.unit.join();
          item.priceUnit = item.priceUnit.join();
          // debugger
          item.usageUnit = item.usageUnit.join();
          item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
        } else if (item.secondType === '主体机房') {
          item.item2 = item.item2.join();
          item.item3 = item.item3.join();
          item.unit = item.unit.join();
          item.usageUnit = item.usageUnit.join();
          item.city = item.city ? item.city.join('-') : '';
          item.priceUnit = item.priceUnit && item.priceUnit.join();
          item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
        } else if (item.secondType === '外围机房') {
          item.item2 = item.item2.join();
          item.item3 = item.item3.join();
          item.unit = item.unit.join();
          item.usageUnit = item.usageUnit.join();
          item.priceUnit = item.priceUnit.join();
          item.city = item.city ? item.city.join('-') : '';
          item.operators = item.operators == '' ? '' : item.operators.join();
          item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
        }
      } else if (item.supplierType === '海外资源') {
        item.item2 = item.item2.join();
        item.item3 = item.item3.join();
        item.unit = item.unit.join();
        item.usageUnit = item.usageUnit.join();
        item.priceUnit = item.priceUnit.join();
        item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
        // item.city = item.city ? item.city.join('-') : '';
        item.city = Array.isArray(item.city) ? item.city.join('-') : item.city;
        item.operators = (item.operators == '' || item.operators == undefined) ? '' : item.operators.join();
        item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
      } else if (item.supplierType === '固网及文印' || item.supplierType === '其他') {
        item.unit = item.unit.join();
        item.usageUnit = item.usageUnit.join();
        item.priceUnit = item.priceUnit.join();
        item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
      }
    } else { //再次报价  草稿
      item.item2Copy && (item.item2 = item.item2Copy);
      delete item.item2Copy;
      item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
      Object.keys(item).forEach((key) => {
        const val = item[key];
        if (Array.isArray(val)) {
          item[key] = key === 'city' ? val.join('-') : val.join();
        } else if (key === 'secondName') {
          delete item[key];
        } else if (key === 'area') {
          // 地区字段用机房名称拼接的原因在哪？ 这样貌似会有bug，先改了
          // item[key] = item.roomName ? val + '-' + item.roomName : val;
          item[key] = val
        }
      })
    }
    let model = item.model;
    let str = '';
    if (model === '阶梯单价' || model === '阶梯累计单价') {
      // https://sentry.n.netease.com/organizations/sentry/issues/1111/?project=1&query=is%3Aunresolved
      // 修复Cannot convert undefined or null to object 问题
      if (allList[index]) {
        Object.values(allList[index]).forEach((itemList, subIndex) => {
          let priceItem = itemList;
          if (priceItem) {
            str += priceItem.min + priceItem.maze1 + 'x' + priceItem.maze2 + priceItem.max + ':' + priceItem.cost;
            if (subIndex !== Object.values(allList[index]).length - 1) {
              str += ','
            }
          }
        })
      }
      item.price = str;
    } else if (model === '固定+阶梯单价') {
      if (fixList[index]) {
        Object.values(fixList[index]).forEach((fixItem, subIndex) => {
          str += 'x=' + fixItem.xprice + ':' + fixItem.totalprice + ','
        })
      }
      if (allList[index]) {
        Object.values(allList[index]).forEach((itemList, subIndex) => {
          let priceItem = itemList;
          str += priceItem.min + priceItem.maze1 + 'x' + priceItem.maze2 + priceItem.max + ':' + priceItem.cost;
          if (subIndex != Object.values(allList[index]).length - 1) {
            str += ','
          }
        })
      }
      item.price = str;
    }
  })
  return form;
}



export function regBaseFormSubmit(form) {
  //文件处理
  form.contactInfo = form.contactInfo || {};
  form.contactInfo.techContact = form.contactInfo.techContact || {};
  form.contactInfo.techContact.techQualificationFile = _.isString(form.techQualificationFile) ? form.techQualificationFile :"";
  form.company.companyLogoFile =  _.isString(form.companyLogoFile) ? form.companyLogoFile :"";
  form.company.companyIntroduce = _.isString(form.companyIntroduce) ? form.companyIntroduce :"";
  form.qualification.licenseFile = _.isString(form.licenseFile) ? form.licenseFile :"";
  form.securityRegistration.securityRegistrationFile =  _.isString(form.securityRegistrationFile) ? form.securityRegistrationFile :"";

  //地址处理
  form.company.areaArray = form.company.areaArray || ["","",""]
  form.qualification.registrationOrganAreaArray =form.qualification.registrationOrganAreaArray || ["","",""]
  const [province1,city1,county1] = form.company.areaArray;
  const [province2,city2,county2] = form.qualification.registrationOrganAreaArray;

  form.company.area = {province: province1,city: city1,county: county1};
  form.qualification.registrationOrganArea = {province: province2,city: city2,county: county2};

  //时间处理
  form.company.companySetUpTime = moment(form.company.companySetUpTime).valueOf();
  form.qualification.registerTime = moment(form.qualification.registerTime).valueOf();
  form.qualification.licenseExpireTime = moment(form.qualification.licenseExpireTime).valueOf();

  form.credentialsInfoList && form.credentialsInfoList.forEach(item => {
    let [expireStart,expireEnd] = item.expireDate;

    item.expireStart = moment(expireStart).valueOf();
    item.expireEnd = moment(expireEnd).valueOf();

    delete item.expireDate;
  })
  form.paidInList && form.paidInList.forEach(item => {
    item.paidInTime = moment(item.paidInTime).valueOf();
  })
  form.caseList && form.caseList.forEach(item => {
    let [caseStart,caseEnd] = item.caseDate;

    item.caseStart = moment(caseStart).valueOf();
    item.caseEnd = moment(caseEnd).valueOf();

    delete item.caseDate;
  })

  form.contactInfo.bizContact = _.isArray(form.contactInfo.bizContact) ? form.contactInfo.bizContact : [form.contactInfo.bizContact];
  form.company.bizType = _.isArray(form.company.bizType) ? form.company.bizType.join(',') : '';

  //删除不需要的属性
  delete form.techQualificationFile;
  delete form.companyLogoFile;
  delete form.companyIntroduce;
  delete form.licenseFile;
  delete form.securityRegistrationFile;

  delete form.company.areaArray;
  delete form.qualification.registrationOrganAreaArray;

  delete form.resourcesCompany;
  delete form.resourcesContact;

  return form
}

export function regBaseFormFormat(form) {
  // 业务类型转数组
  form.company.bizType = (form.company.bizType &&form.company.bizType.split(',')) || [];
  //文件处理
  form.companyLogoFile = form.company.companyLogoFile;
  form.companyIntroduce = form.company.companyIntroduce;
  form.licenseFile = form.qualification.licenseFile;
  form.securityRegistrationFile = form.securityRegistration.securityRegistrationFile;
  form.securityRegistration.activeStaff = parseFloat(form.securityRegistration.activeStaff) || 0;
  form.securityRegistration.securityPayers = parseFloat(form.securityRegistration.securityPayers) || 0;
  form.qualification.registerMoney = parseFloat(form.qualification.registerMoney) || 0;

  //地址处理
  const area = _.get(form, 'company.area', {});
  const registrationOrganArea = _.get(form, 'qualification.registrationOrganArea', {});
  const areaArray = [
    area.province, area.city, area.county,
  ];
  const registrationOrganAreaArray = [
    registrationOrganArea.province, registrationOrganArea.city, registrationOrganArea.county,
  ];
  form.company.areaArray = areaArray;
  form.qualification.registrationOrganAreaArray = registrationOrganAreaArray;

  //时间处理
  form.company.companySetUpTime = moment(form.company.companySetUpTime);
  form.qualification.licenseExpireTime = moment(form.qualification.licenseExpireTime);
  form.qualification.registerTime = moment(form.qualification.registerTime);

  form.credentialsInfoList && form.credentialsInfoList.forEach((item) => {
    if (item.expireStart && item.expireEnd) {
      item.expireTime = moment(item.expireStart).format("YYYY-MM-DD")+ " 至 "
       +moment(item.expireEnd).format("YYYY-MM-DD");
      item.expireDate = [moment(item.expireStart),
        moment(item.expireEnd)]
    } else {
      item.expireTime = "";
      item.expireDate = []
    }
  })
  form.caseList && form.caseList.forEach((item) => {
    if (item.caseStart && item.caseEnd) {
      item.caseTime = moment(item.caseStart).format("YYYY-MM-DD")+ " 至 "
       +moment(item.caseEnd).format("YYYY-MM-DD");
      item.caseDate = [moment(item.caseStart),
        moment(item.caseEnd)]
    } else {
      item.caseTime = "";
      item.caseDate = []
    }
  })
  form.paidInList && form.paidInList.forEach((item) => {
    item.paidInAmount = parseFloat(item.paidInAmount) || 0;
    item.paidInRatio = parseFloat(item.paidInRatio) || 0;
    item.paidInTime = moment(item.paidInTime)
  })

  form.contactInfo.legalContact.position = "法人代表"
  form.contactInfo.techContact.position = "工程技术负责人"
  form.credentialsInfoList.forEach((item,index) => {
    item.qualificationFileData = item.qualificationFile ? [
      {
        uid: index,
        name: item.qualificationFile,
        status: 'done',
        url: item.qualificationFile,
      }
    ] : []
  });
  form.subCompanyList.forEach((item,index) => {
    item.subLicenseFileData = item.subLicenseFile ? [
      {
        uid: index,
        name: item.subLicenseFile,
        status: 'done',
        url: item.subLicenseFile,
      }
    ] : []
  });

  form.financialList.forEach((item,index) => {
    item.bizIncome = parseFloat(item.bizIncome) || 0;
    item.actualPaidIn = parseFloat(item.actualPaidIn) || 0;
    item.totalProfit = parseFloat(item.totalProfit) || 0;
    item.incomeTax = parseFloat(item.incomeTax) || 0;
    item.totalAsset = parseFloat(item.totalAsset) || 0;
    item.totalLiability = parseFloat(item.totalLiability) || 0;
    item.totalOwnerEquity = parseFloat(item.totalOwnerEquity) || 0;
    item.auditReportFileData = item.auditReportFile ? [
      {
        uid: index,
        name: item.auditReportFile,
        status: 'done',
        url: item.auditReportFile,
      }
    ] : []
  });

  form.caseList.forEach((item,index) => {
    item.caseFileData = item.caseFile ? [
      {
        uid: index,
        name: item.caseFile,
        status: 'done',
        url: item.caseFile,
      }
    ] : []
  });
  let files = {
    companyLogoFile: form.company.companyLogoFile ? [
      {
        uid: -1,
        name: form.company.companyLogoFile,
        status: 'done',
        url: form.company.companyLogoFile,
      }
    ] : [],
    companyIntroduce: form.company.companyIntroduce ? [
      {
        uid: -1,
        name: form.company.companyIntroduce,
        status: 'done',
        url: form.company.companyIntroduce,
      }
    ] : [],
    licenseFile: form.qualification.licenseFile ? [
      {
        uid: -1,
        name: form.qualification.licenseFile,
        status: 'done',
        url: form.qualification.licenseFile,
      }
    ] : [],
    securityRegistrationFile: form.securityRegistration.securityRegistrationFile ? [
      {
        uid: -1,
        name: form.securityRegistration.securityRegistrationFile,
        status: 'done',
        url: form.securityRegistration.securityRegistrationFile,
      }
    ] : [],
    subLicenseFile: form.subCompanyList.map((item, index) => {
      return {
        uid: index,
        name: item.subLicenseFile,
        response: { errorCode: 0, data: item.subLicenseFile },
        status: 'done',
        url: item.subLicenseFile,
      }
    }),
  };

  return {
    files,
    updateForm: form,
  };

}
