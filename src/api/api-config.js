const apiPath = import.meta.env.MODE === 'production' ? '' : '';
// eslint-disable-next-line
export default {
  // 登录
  login: { method: 'post', url: 'supplier/login' },
  authCode: { method: 'get', url: 'supplier/auth_code', desc: '登录验证码' },
  logout: { method: 'get', url: 'supplier/logout', desc: '登出' },
  // 注册
  register: { method: 'post', url: 'supplier/register', desc: '' },
  // 密码找回
  sendCode: { method: 'post', url: 'supplier/password/send_code', desc: '找回密码邮箱code' },
  checkCode: { method: 'post', url: 'supplier/password/check_code', desc: '邮箱code检测' },
  checkCodeReg: { method: 'post', url: 'supplier/register/check_code', desc: '注册邮箱code检测' },
  resetPwd: { method: 'post', url: 'supplier/password/reset', desc: '重置密码' },
  // 注册信息检查
  registerCheck: { method: 'get', url: '/supplier/register/check', desc: '注册信息检查' },

  //供应商信息
  infoQuery: { method: 'get', url: 'supplier/query', desc: '供应商信息' },
  infoModify: { method: 'post', url: 'supplier/modify', desc: '修改供应商信息' },

  queryCategoryList: { method: 'get', url: 'supplier/getCatList.do', desc: '获取类目列表' },
  //订单
  queryOrderList: { method: 'get', url: 'supplier/order/getOrderList', desc: '获取订单信息' },
  queryOrderStateList: { method: 'get', url: 'supplier/order/getOrderState', desc: '获取订单状态标签页' },
  queryOrderType: { method: 'get', url: 'supplier/order/getOrderType', desc: '获取订单来源' },
  queryOrderDetail: { method: 'get', url: 'supplier/order/getOrderDetail', desc: '获取订单详情' },
  queryOrderRemarkList: { method: 'get', url: 'supplier/price/getRemarkList', desc: '获取订单详情备注' },
  deliveryOrder: { method: 'post', url: 'supplier/order/deliver', desc: '订单发货' },
  delivery: { method: 'post', url: 'supplier/order/deliver', desc: '订单发货' },
  batchDelivery: { method: 'post', url: 'supplier/order/batchDeliver', desc: '订单批量发货' },
  excelBatchDeliver: { method: 'post', url: 'supplier/order/excelBatchDeliver', desc: '订单表格批量发货' },
  queryOrderExpressList: { method: 'get', url: 'supplier/order/getOrderExpressList', desc: '获取订单的物流信息' },
  updateHuiExpressId: { method: 'post', url: 'supplier/order/updateHuiExpressId', desc: '更新内购订单物流单号' },
  //文件上传
  upload: { method: 'post', url: 'supplier/upload', desc: '' },
  //文件上传新接口
  uploadNew: {method: 'form-data', url: 'api-file/ui/fileService/v1/files/url', desc: ''},

  //报价管理
  getTaxRate: { method: 'get', url: '/supplier/price/getTaxRate' },  //获取税率
  getGuarantee: { method: 'get', url: '/supplier/price/getGuarantee' }, //获取保修期
  getQuoteList: { method: 'get', url: '/supplier/price/getInquiryList' },    //供应商报价列表
  getQuoteRemarkList: { method: 'get', url: '/supplier/price/getRemarkList' },   //供应商报价查看列表
  priceQuote: { method: 'post', url: '/supplier/price/quote' },   //供应商报价
  batchPriceQuote: { method: 'post', url: '/supplier/price/batchQuote' },   //供应商批量报价
  quoteExportByIds: { method: 'get', url: '/supplier/price/exportByIds.do' }, // 批量导出所选

  //售后管理
  getAfterSaleList: { method: 'get', url: '/supplier/ass/getOrderList.do', desc: '获取售后列表list' },
  getAfterSaleStateList: { method: 'get', url: '/supplier/ass/getOrderState.do', desc: '获取售后状态下拉列表' },
  addAftersaleRemark: { method: 'get', url: '/supplier/ass/remark.do', desc: '添加售后备注' },
  getAfterSaleDetail: { method: 'get', url: '/supplier/ass/getOrderDetail.do', desc: '获取售后详情' },
  getAfterSaleStates: { method: 'get', url: '/supplier/ass/statusOnline.do', desc: '获取售后状态' },
  approveAfterSale: { method: 'get', url: '/supplier/ass/checkSaa.do', desc: '售后审核' },
  confirmReceiptAfterSale: { method: 'get', url: '/supplier/ass/submit.do', desc: '售后商品确认收货' },
  //财务管理
  getAccountStateList: { method: 'get', url: '/supplier/Account/getAllAccountState.do', desc: '获取对账状态下拉列表' },
  getAccountTimeList: { method: 'get', url: '/supplier/Account/getALLAccounts.do', desc: '获取账期下拉列表' },
  getAccountList: { method: 'get', url: '/supplier/Account/getAccountList.do', desc: '获取账期列表list' },
  confirmAccount: { method: 'post', url: '/supplier/Account/confirmAccount.do', desc: '确认账单' },
  getAccountPayTypeList: { method: 'get', url: '/supplier/Account/getALLPayType.do', desc: '获取账单支付方式下拉列表' },
  getAccountDetail: { method: 'get', url: '/supplier/Account/getAccountsDetail.do', desc: '获取账单详情列表' },
  addAccountRemark: { method: 'post', url: '/supplier/Account/remarkAccount.do', desc: '添加账单备注' },
  mergeAccountOrder: { method: 'post', url: '/supplier/Account/mergeAccountOrder.do', desc: '新增/修改订单', requestType: 'JSON', headers: { 'Content-Type': "application/json;" } },
  //待办事项
  queryBacklogList: { method: 'get', url: '/supplier/ass/backLog.do', desc: '获取待办事项' },

  //资源类财务管理
  getIDCAccountType: { method: 'get', url: '/supplier/Account/idc/getAccountType.do', desc: '账单类型列表' },
  getIDCAccountList: { method: 'get', url: '/supplier/Account/idc/getAccountList.do', desc: '获取账单列表' },
  getIDCAccountDetail: { method: 'get', url: '/supplier/Account/idc/getAccountDetail.do', desc: '获取账单详情' },
  getIDCAccountAllItem: { method: 'get', url: '/supplier/Account/idc/getAllItem.do', desc: '获取供应商的全部计费项' },
  getIDCAccountAddBill: { method: 'post', url: '/supplier/Account/idc/addBilling.do', desc: '新建账单',requestType: 'JSON', headers: { 'Content-Type': "application/json;charset=utf-8"}},
  getIDCUploadAccount: { method: 'post', url: '/supplier/Account/idc/uploadAccount.do', desc: '导入账单' },
  getIDCAccountTemplate:{method:'get',url: '/supplier/Account/idc/getBillingTemplate.do', desc: '获取账单模板'},
  getIDCApproveDetail:{method:'get',url: '/supplier/Account/idc/getApproveAccountDetail.do', desc: '获取复核详情/已确认详情'},
  getIDCApproveDetailPost: { method: 'post', url: '/supplier/Account/idc/postApproveAccountDetail.do', desc: '供应商提交复核',requestType: 'JSON', headers: { 'Content-Type': "application/json;" } },
  getIDCAccountUpload: { method: 'post', url: '/supplier/Account/idc/upload.do', desc: '上传资料' },
  getIDCAccountFormula: { method: 'post', url: '/supplier/Account/idc/getFormulaAndResult.do', desc: '获取价格'},
  confirmItemInfo: { method: 'post', url: '/supplier/Account/idc/confirm.do', desc: '确认商务单条信息'},


  //资源类报价管理
  getIDCTypeAuth: { method: 'get', url: '/supplier/inquiry/getTypeAuth', desc: '获取供应商可选一级大类' },
  getIDCQuoteList: { method: 'get', url: '/supplier/inquiry/quoteList', desc: '获取待报价列表' },
  getIDCApprovalList: { method: 'get', url: '/supplier/inquiry/approvalList', desc: '获取已报价列表' },
  getIDCInvalidList: { method: 'get', url: '/supplier/inquiry/failureList', desc: '获取已失效列表'},
  getIDCQuoteDetail: { method: 'get', url: '/supplier/inquiry/quoteDetail', desc: '报价单详情' },//老接口
  getIDCQuoteDetailNew:{method:'get',url:'/supplier/inquiry/addInquiryPrice',desc:'获取计费项数据'}, //新接口
  getIDCCommonFieldList: { method: 'get', url: '/supplier/inquiry/commonFieldList', desc: '根据一级大类和细分类获取下拉数据' }, // 需替换联动
  getSupplierLinkage: { method: 'get', url: '/supplier/inquiry/supplierLinkage', desc: '供应商联动-根据一级大类和细分类获取计费项下拉数据'},
  getFindPriceUnit:{ method: 'get', url: '/supplier/inquiry/findPriceUnit', desc: '供应商联动-根据传入的数量单位和币种获取价格单位'},
  getIDCSubmitQuote: { method: 'post', url: '/supplier/inquiry/submitQuote', desc: '提交报价单' },
  getProvinceCity: { method: 'get', url: '/supplier/inquiry/provinceCity', desc: '省市联动' },
  updateBillToWaitCheck: { method: 'post', url: '/supplier/Account/idc/updateBillToWaitCheck.do', desc: '草稿页面编辑---提交' },
  updateBillStillDraft: { method: 'post', url: '/supplier/Account/idc/updateBillStillDraft.do', desc: '草稿页面编辑---存为草稿' },
  addBillingAsDraft: { method: 'post', url: '/supplier/Account/idc/addBillingAsDraft.do', desc: '草稿页面编辑---存为草稿' },
  deleteBillDraft: { method: 'get', url: '/supplier/Account/idc/deleteBill.do', desc: '草稿页面列表---删除' },
  withdrawBillDraft: { method: 'post', url: '/supplier/Account/idc/withdrawBilling.do', desc: '已提交账单页面列表---撤回' },

  //供应商
  supplyQueryPriceList: { method: 'get', url: apiPath + '/supply/queryPriceList', desc: '供应商询价列表' },
  supplyQuote: { method: 'post', url: apiPath + '/supply/quote', desc: '确认报价' },
  supplyPoList: { method: 'get', url: apiPath + '/supply/poList', desc: '合同列表' },
  supplyUploadPo: { method: 'post', url: apiPath + '/supply/uploadPo', desc: '上传合同' },
  supplyQueryDeliverPo: { method: 'get', url: apiPath + '/supply/queryDeliverPo', desc: '待发货/已发货合同列表' },
  supplyQueryDeliverDevice: { method: 'get', url: apiPath + '/supply/queryDeliverDevice', desc: '待发货/已发货清单' },
  supplyToDeliver: { method: 'post', url: apiPath + '/supply/deliver', desc: '确认发货' },
  supplyImportSN: { method: 'post', url: apiPath + '/supply/importSn', headers: { 'Content-Type': 'multipart/form-data' }, desc: '导入SN' },
  supplyExportSN: { method: 'get', url: apiPath + '/supply/exportSn', desc: '导出SN' },
  supplyConfirm: { method: 'post', url: apiPath + '/supply/confirm', desc: '确认接单' },
  changePassword: { method: 'post', url: apiPath + '/login/changePassword', desc: '修改密码' },

  //基建
  baseIndex: {method: 'get', url:'/supplier/index', desc: '供应商首页招标公告列表'},
  baseProjectDetail: {method: 'get', url:'/supplier/project/detail', desc: '供应商项目公告详情'},
  baseProjectList: {method: 'get', url:'/supplier/project/list', desc: '供应商投标列表'},
  baseProjectApply: {method: 'post', url:'/supplier/project/apply', desc: '供应商申请报名'},

  // 新版-注册/登录
  registerService: { method: 'post', url: '/api-supplier/ui/supplierRegisterService/v1/supplier', desc: '新版-注册' },
  authImgCode: { method: 'get', url: '/validate/code/web', desc: '登录图像验证码' },
  loginService: { method: 'form-data', url: '/oauth/token' , desc: '新版-登录' },
  sendValidateCode: { method: 'get', url: '/validate/emailCode' , desc: '新版-发送验证码到邮箱' },
  validateCode: { method: 'get', url: '/validate/emailCodeValidation' , desc: '新版-邮箱验证码校验' },
  logoutService: { method: 'get', url: '/user/logout' , desc: '新版-退登' },
  // 新版-用户权限列表
  authorization: { method: 'get', url: '/api-backend/ui/userService/v1/menus' , desc: '新版-用户权限列表' },
  // 新版-供应商信息
  userInfo: { method: 'get', url: `/api-backend/ui/userService/v1/userInfo`, desc: '新版-用户信息' },
  supplierDetails: { method: 'get', url: `/api-supplier/ui/supplierManageService/v1/suppliers`, desc: '新版-供应商详情' },
  supplierDetailsModify: { method:'put', url: '/api-supplier/ui/supplierManageService/v1/suppliers', desc: '新接口修改供应商信息'},
  getMySupplierEntities: { method: 'get', url: '/api-backend/ui/userService/v1/suppliers', desc: '新版-供应商实体列表' },
  setSupplierEntity: { method: 'get', url: '/api-backend/supplier/check', desc: '新版-选择供应商实体' },
  // 新版-后台管理
  findUserByEmail: { method: 'get', url: '/api-backend/ui/userService/v1/userInfo/email' , desc: '根据邮箱检索用户信息' },
  getSupplierRoleList: { method: 'get', url: '/api-backend/ui/permissionService/v1/supplierRoleList', desc: '角色列表（筛选用）' },
  getSupplierContactsList: { method: 'post', url: '/api-backend/ui/userRoleService/v1/supplierUserRolePages', desc: '联系人列表' },
  createSupplierContacts: { method: 'post', url: '/api-backend/ui/userRoleService/v1/supplierUserRoles', desc: '创建联系人' },
  modifySupplierContacts: { method: 'put', url: '/api-backend/ui/userRoleService/v1/supplierUserRoles', desc: '编辑联系人' },
  deleteSupplierContacts: { method: 'delete', url: '/api-backend/ui/userRoleService/v1/supplierUserRoles', desc: '删除联系人' },
  getSupplierRoles: { method: 'post', url: '/api-backend/ui/permissionService/v1/supplierRolePages', desc: '角色列表' },
  getSupplierRoleDetails: { method: 'get', url: '/api-backend/ui/permissionService/v1/supplierRoleDetails', desc: '角色详情' },
  getSupplierBizEntities: { method: 'get', url: '/api-backend/ui/businessEntityService/v1/supplierBizEntities/sync', desc: '查询当前供应商关联的业务实体' },
  getSupplierDataGrantItem: { method: 'get', url: '/api-backend/ui/permissionService/v1/supplierDataGrantItem', desc: '查找供应商端授权元素列表(roleId不传表示新增)' },
  createSupplierRole: { method: 'post', url: '/api-backend/ui/permissionService/v1/supplierRole', desc: '创建角色' },
  modifySupplierRole: { method: 'put', url: '/api-backend/ui/permissionService/v1/supplierRole', desc: '修改角色' },
  deleteSupplierRole: { method: 'delete', url: '/api-backend/ui/permissionService/v1/roles', desc: '删除角色' },
  // 新版报价
  getQuoteListNew: { method: 'post', url: '/api-sourcing/ui/enquiryService/v1/supplierEnquiryPage', desc: '询价列表' },
  getHistoryQuote: { method: 'post', url: '/api-sourcing/ui/enquiryService/v1/supplierQuotHisList', desc: '报价历史列表' },
  getBrandList: { method: 'get', url: '/supplier/getBrandList', desc: '品牌列表' },
  getEnquiryOwners: { method: 'post', url: '/api-sourcing/ui/enquiryService/v1/enquiryOwners', desc: '采购员列表' },
  submitQuotation: { method: 'post', url: '/api-sourcing/ui/quotationService/v1/quotation', desc: '提交报价' },
  exportFile: { method: 'post', url: '/api-sourcing/ui/enquiryService/v1/supplierEnquiry/download', desc: '导出'},
  getCurrencies: { method: 'get', url: '/api-form/ui/currencyRateService/v1/currencies', desc: '币种列表' }, // params eg: conversionDate=2021-06
  downloadBatchQuotationList: { method: 'post', url: '/api-sourcing/ui/quotationService/v1/downloadBatchQuotationList', desc: '批量报价-模版下载'},
  downloadBatchQuotationList2: { method: 'post', url: '/api-sourcing/ui/quotationService/v1/downloadBatchQuotationList2', desc: '批量报价-模版下载'},
  uploadBatchQuotationList: { method: 'form-data', url: '/api-sourcing/ui/quotationService/v1/uploadBatchQuotationList', desc: '批量报价'},
}

