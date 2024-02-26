import { actions } from '.';
import api from 'src/api';

const getEnquiryTypeName = (type) => {
  switch (type) {
    case 'online_quotation': return '线上询价';
    case 'proxy_quotation': return '代理报价';
    case 'contract_quotation': return '框架报价';
    default: return console.error('没有匹配');
  }
}

const getUrgeName = (value) => {
  return value ? '紧急' : '普通'
}

function quoteListDataAdaptor(originData) {
  const newData = {
    ...originData,
    data: originData.data.map(item => {
      // 待报价状态中，紧急状态需要标红
      const urgeInWaitingQuotation = item.urge && item.displayStatus === 'waiting_quotation'

      return {
        id: item.id,
        // 询价单编码
        enquiryCode: item.enquiryCode,
        // 询价任务编码
        enquiryTaskCode: item.enquiryTaskCode,
        // 询价序号
        inquiryNo: item.inquiryNo,
        // 需求子单 ID
        requestDetailId: item.requestDetailId,
        // 询价数量
        enquiryAmount: item.enquiryAmount + item.enquiryAmountUnit,
        // 询价信息
        quote: [
          {label: '需求子单ID：', value: item.requestDetailId},
          {label: '需求ID：', value: item.requestId},
          {label: '采购员：', value: item.ownerUserName},
          {label: '紧急程度：', value: getUrgeName(item.urge), valueStyle: { color: urgeInWaitingQuotation ? '#e64949' : null}},
        ],
        // 询价产品信息
        inquiryProduct: [
          {label: '商品名称：', value: item.productName},
          {label: '品牌：', value: item.brand},
          {label: '规格型号：', value: item.attrs?.slice(1, -1)},
          {label: '参考网址：', value: {type: 'link', value: item.referenceWebSite}},
          {label: '询价数量：', value: item.enquiryAmount + item.enquiryAmountUnit},
        ],
        // 询价产品信息
        inquiryProductInQuotation: [
          {label: '商品名称：', value: item.productName},
          {label: '品牌：', value: item.brand},
          {label: '规格型号：', value: item.attrs?.slice(1, -1)},
          {label: '参考网址：', value: {type: 'link', value: item.referenceWebSite}},
        ],
        // 询价状态
        status: item.displayStatusName,
        // 询价时间
        times: [
          {label: '询价时间：', value: item.createTime},
          {label: '报价截止时间：', value: item.expireDate},
          item?.quotation && {label: '报价时间：', value: item?.quotation?.createTime},
        ].filter(Boolean),
        // 报价商品
        quoteProduct: item?.quotation && [
          {label: '商品名称：', value: item.quotation?.productName},
          {label: '品牌：', value: item.quotation?.brand},
          {label: '规格型号：', value: item.quotation?.attrs?.slice(1, -1)},
        ],
        // 报价
        quotedPrice: item?.quotation && [
          {label: '含税单价：', value: item.quotation?.taxIncludedPrice + item.quotation?.currency},
          {label: '税率：', value: item.quotation?.tax},
          {label: '供应数量：', value: item.quotation?.supplyAmount + item.quotation?.supplyAmountUnit}
        ],
        // 其他信息
        otherInfo: item?.quotation && [
          {label: '报价时间：', value: item?.quotation?.createTime},
          {label: '报价有效期：', value: item?.quotation?.quoteExpireDate},
          {label: '保修信息：', value: item?.quotation?.warrantyInformation},
          item?.quotation && {label: '到货周期：', value: item?.quotation?.arrivalPeriod + item?.quotation?.periodUnit}
        ].filter(Boolean),
        // 报价备注
        quotationNotes: item?.quotation?.remark
      }
    })
  }

  return newData
}

export const getQuoteList = (params = {}) => (dispatch, getState) => {

  const { activeTab, urge, keywords, ownerEmail, sort, orderByQ, quoteList } = getState().quoteCommon
  const { email: companyEmail } = getState().app?.userInfo?.emailAccount
  const query = {
    // "supplierEmail": "xx@163.com",
    "supplierEmail": companyEmail,
    "displayStatus": activeTab,
    "keyword": keywords,
    "urge": urge,
    "ownerEmail": ownerEmail,
    "type": "0",
    "pageNo": params.pageNo || quoteList.pageNo,
    "pageSize": params.pageSize || quoteList.pageSize,
  }
  // import('./_MOCK_').then(({list}) => list)
  if (sort && orderByQ) {
    query.sort = sort
    if (activeTab === 'already_quotation') {
      query.orderByQ = orderByQ
    } else if (activeTab === 'waiting_quotation' || activeTab === 'overtime'){
      query.orderByE = orderByQ
    }
  }
  api.getQuoteListNew(query)
    .then(res => {
      const newData = quoteListDataAdaptor(res.data)
      dispatch(actions.setQuoteList(newData));
    })
};


function quoteHistoryDataAdaptor(originData) {
  let index = originData.length
  const newData = originData.map(item => {
    const newItem = {
      ...item,
      inquiryNo: index--,
    }

    return Object.assign(
      newItem,
      {
        enquiryTypeName: getEnquiryTypeName(item.enquiryType),
        urgeName: getUrgeName(item.urge),
        tableData: quoteListDataAdaptor({data: [newItem]}).data
      }
    )
  })


  return newData
}

export const getHistoryQuote = ({enquiryTaskCode, enquiryCode}) => (dispatch, getState) => {

  const { email: companyEmail } = getState().app?.userInfo?.emailAccount

  // import('./_MOCK_').then(({historyList}) => historyList)
  api.getHistoryQuote({
    // supplierEmail: "xx@163.com",
    supplierEmail: companyEmail,
    enquiryTaskCode,
    type: "0"
  })
    .then(res => {
      const currentData = res.data.find(el => el.enquiryCode === enquiryCode);

      const newData = {
        requestId: currentData.requestId,
        requestDetailId: currentData.requestDetailId,
        ownerUserName: currentData.ownerUserName,
        historyList: quoteHistoryDataAdaptor(res.data),
      }

      dispatch(actions.setQuoteDetails(newData));
    })
};

export const getEnquiryOwners = () => (dispatch, getState) => {
  const { activeTab } = getState().quoteCommon
  const { email: companyEmail } = getState().app?.userInfo?.emailAccount

  api.getEnquiryOwners({
    // supplierEmail: "xx@163.com",
    supplierEmail: companyEmail,
    displayStatus: activeTab,
    type: "0"
  })
    .then(res => {
      dispatch(actions.setOwnerList(res?.data))
    })
}

export const getBrandList = () => (dispatch, getState) => {
  // import('./_MOCK_').then(({brandList}) => brandList)
  api.getBrandList()
    .then(res => {
      dispatch(actions.setBrandList(
        res?.msg?.map(({name}) => ({value: name, label: name}))
      ))
    })
}

export const getCurrencyList = () => (dispatch, getState) => {
  
  // api.getCurrencyList({"code":"CURRENCY_TYPE"})
  api.getCurrencies()
    .then(res => {
      dispatch(actions.setCurrencyList(
        res?.data?.map(({currencyDesc: name}) => ({value: name, label: name}))
      ))
    })
}

export const submitQuotation = (params) => api.submitQuotation(params)