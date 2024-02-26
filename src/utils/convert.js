import _ from "lodash";
import moment from "moment";

//新版本-行政供应商详情-转换为旧版本的数据
export function convertAcceptDataToOld(form) {

  const { bankCardList, qualification, contractUser, financialList, areaAddress, customerList, credentialsInfoList } = form;

  const newForm = {

    bankCardList: bankCardList && Object.values(bankCardList).length ? bankCardList.map(el => ({
      bankAccountName: _.get(el,'bankAccountName'),
      settCurrency: _.get(el,'settCurrency'),
      bankAccountId: _.get(el,'bankAccountId'),
      bankName: _.get(el,'bankName'),
      id: _.get(el,'id'),
      bankAddress: _.get(el,'bankAddress'),
      swiftCode: _.get(el,'swiftCode'),
    })) : [],

    qualification: qualification && Object.values(qualification).length ? {
      taxerId: _.get(qualification,'taxerId'),
      licenseExpireTime: _.get(qualification,'licenseExpireTime'),
      legalRepresentative: _.get(qualification,'legalRepresentative'),
      companyRegisterTime: _.get(qualification,'companyRegisterTime'),
      registerMoney: _.get(qualification,'registerMoney'),
      id: _.get(qualification,'id'),
      licenseId: _.get(qualification,'licenseId'),
      licenseFile: _.get(qualification,'licenseFile'),
    } : [],

    accountType: 10,

    status: form.status,

    refuseReason: form.refuseReason,

    // TODO emailAccount 数据源待确认 可以
    emailAccount: {
      modifyTime: form.updateTime,
      createTime: form.createTime,
      accountType: 10,
      id: form.id,
      // email: contractUser?.[0]?.email,
      email: contractUser && contractUser[0] && contractUser[0].email,
      // name:  contractUser?.[0]?.userName,
      name: contractUser && contractUser[0] && contractUser[0].name,
      refuseReason: form.refuseReason,
      status: form.status
    },

    financialList: financialList && Object.values(financialList).length ? financialList.map(el => ({
      reportYear: _.get(el,'reportYear'),
      totalProfit: _.get(el,'totalProfit'),
      bizIncome: _.get(el,'bizIncome'),
      id: _.get(el,'id'),
      auditReportFile: _.get(el,'auditReportFile'),
      paidInCapital: _.get(el,'paidInCapital'),
      // TODO: auditReportFileData 前端生成
      // auditReportFileData: [
      //   {
      //     uid: 0,
      //     name:
      //       "https://nos.netease.com/crm-test/BPS资源—提单功能迭代-6b2814bfb8054e5b9b96fb92473aa663.doc",
      //     status: "done",
      //     url:
      //       "https://nos.netease.com/crm-test/BPS资源—提单功能迭代-6b2814bfb8054e5b9b96fb92473aa663.doc",
      //   },
      // ],
    })) : [],

    company: {
      area: { province: areaAddress.split('-')[0], city: areaAddress.split('-')[1], county: areaAddress.split('-')[2] },
      companyName: form.companyName,
      companyAddress: form.companyAddress,
      areaAddress: areaAddress.replace(/-/g, '/'),
      bankName: "滨江区开户行",
      id: form.id,
      bizScopes: form.bizScopes.replace(/\[|]/g,'').split(','),
      areaArray: areaAddress.split('-'),
      companyType: form.companyType
    },

    customerList: customerList && Object.values(customerList).length ? customerList.map(el => ({
      serveStart: _.get(el,'serveStart'),
      introduceFile: _.get(el,'introduceFile'),
      onServe: _.get(el,'onServe'),
      id: _.get(el,'id'),
      customerName: _.get(el,'customerName'),
      // TODO: introduceFileData字段缺失  前端自己处理生成
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
    })) : [],

    credentialsInfoList: credentialsInfoList && Object.values(credentialsInfoList).length ? credentialsInfoList.map(el => ({
      organizationName: _.get(el,'organizationName'),
      expireDate: _.get(el,'expireDate'),
      expireEnd: _.get(el,'expireEnd'),
      expireStart: _.get(el,'expireStart'),
      qualificationFile: _.get(el,'qualificationFile'),
      id: _.get(el,'id'),
      qualificationName: _.get(el,'qualificationName'),
      qualificationNo: _.get(el,'qualificationNo'),
      // TODO: expireTime，expireDate没有使用到 qualificationFileData 前端自己生成
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
      // ]
    })) : [],

    contactList: contractUser && Object.values(contractUser).length ? contractUser.map(el => ({
      mobilePhone: _.get(el,'phoneNo'),
      // 性别字段直接使用
      gender: _.get(el,'gender'),
      contactEmail: _.get(el,'email'),
      contactName: _.get(el,'userName'),
      id: _.get(el,'userId'),
      position: _.get(el,'duties')
    })) : [],

    //id展示时用不到，编辑时使用
    id: form.id

    //前端处理生成
    // licenseFile: form.

    //outStatus淘汰状态 已去除
    // outStatus:

  }

  return newForm;
}

//新版本-行政供应商详情-提交时老版本数据转化为新接口所需要的数据
export function convertSubmitDataToNew(form) {

  const newSubmitForm = {
    operatorType: 'supplier',
    areaAddress: {
      city: form.company.area.city,
      county: form.company.area.county,
      province: form.company.area.province
    },
    bankCardList: form.bankCardList.length ? form.bankCardList.map(el => ({
      bankAccountId: el.bankAccountId,
      bankAccountName: el.bankAccountName,
      bankAddress: el.bankAddress,
      bankName: el.bankName,
      id: el.id,
      settCurrency: el.settCurrency,
      swiftCode: el.swiftCode,
    })) : [],
    // bizCode和bizName字段不需要
    // TODO: bizCode字段在回显时只有bizCodeList，且是个数组，如何取
    // bizCode: '',
    // TODO: bizName字段在回显时字段缺失
    // bizName: '',
    // TODO: bizScopes字段需要和后端确认
    bizScopes: "[" + form.company.bizScopes.join(',') + "]",
    companyType: form.company.companyType,
    companyAddress: form.company.companyAddress,
    companyName: form.company.companyName,
    //只展示不能编辑
    // contractAccount: {
    //   duties: "3eRpG9KB7z",
    //   email: "A3cjmGr@or54k.bwl",
    //   gender: "eFmVjaHd0N",
    //   phoneNo: "frs2nJQzzC",
    //   userName: "3K761Uw8H2"
    // },
    //TODO: 老接口有qualificationFileData数组字段，新接口是否不需要？
    credentialsInfoList: form.credentialsInfoList.length ? form.credentialsInfoList.map(el => ({
      // expireStart: moment(el.expireDate[0]).valueOf(),
      // expireEnd: moment(el.expireDate[1]).valueOf(),
      expireStart: el.expireStart,
      expireEnd: el.expireEnd,
      id: el.id,
      organizationName: el.organizationName,
      // qualificationFile: el.qualificationFileData.length ? el.qualificationFileData[0].url : '',
      qualificationFile: el.qualificationFile,
      qualificationName: el.qualificationName,
      qualificationNo: el.qualificationNo,
    })) : [],
    //TODO: 老接口有introduceFileData数组字段，新接口是否不需要？
    customerList: form.customerList.length ? form.customerList.map(el => ({
      customerName: el.customerName,
      id: el.id,
      // introduceFile: el.introduceFileData.length ? el.introduceFileData[0].url : '',
      introduceFile: el.introduceFile,
      onServe: el.onServe,
      serveStart: moment(el.serveStart).valueOf()
    })) : [],
    //TODO: 老接口有auditReportFileData数组字段，新接口是否不需要？
    financialList: form.financialList.length ? form.financialList.map(el => ({
      // auditReportFile: el.auditReportFileData.length ? el.auditReportFileData[0].url : '',
      auditReportFile: el.auditReportFile,
      bizIncome: el.bizIncome,
      id: el.id,
      paidInCapital: el.paidInCapital,
      reportYear: el.reportYear,
      totalProfit: el.totalProfit,
    })) : [],
    id: form.id,
    qualification: {
      companyRegisterTime: form.qualification.companyRegisterTime.valueOf(),
      id: form.qualification.id,
      legalRepresentative: form.qualification.legalRepresentative,
      licenseExpireTime: moment(form.qualification.licenseExpireTime).valueOf(),
      licenseFile: form.qualification.licenseFile ? form.qualification.licenseFile : '',
      licenseId: form.qualification.licenseId,
      registerMoney: form.qualification.registerMoney,
      taxerId: form.qualification.taxerId
    }
  }
  return newSubmitForm

}
