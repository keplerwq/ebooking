import { actions } from '.';
import api from 'src/api';

const getCurrentSupplier = () => JSON.parse(localStorage.getItem('USER_META_INFO'))?.supplierInfoDO;

export const getSupplierRoleList = () => dispatch => {
  // 后台请求
  return api.getSupplierRoleList({supplierId: getCurrentSupplier()?.id}).then((res) => {
    // 执行 action 存入 reducer
    dispatch(actions.setFilterRoleList(res.data));
  });
};

export const getSupplierContactsList = () => (dispatch, getState) => {

  const {contactsManage: state} = getState();

  const roleName = state.filterRoleList.find(
    ({roleId}) => state.finalFilterValues.role === roleId
  )?.roleName;

  const params = {
    supplierId: getCurrentSupplier()?.id,
    orderItemList: [
      {
        orderDirection: 'desc',
        orderField: 'create_time',
      },
    ],
    pageNo: state.contactsListData.pageNo,
    pageSize: state.contactsListData.pageSize,
    userName: state.finalFilterValues.name,
    roleName,
  };

  api.getSupplierContactsList(params).then((res) => {
    dispatch(actions.setContactsListData(res.data));
  });
};


const updateContactsRequest = (values, request, dispatch, getState) => {
  const {roleId, duties, email, gender, phoneNo, userName, userId, originRoleId } = values;
  const {contactsManage: state} = getState();

  const {privilegeType, roleName} =
      state.filterRoleList.find((item) => item.roleId === roleId) || {};

  const {companyName, id} = getCurrentSupplier();

  const params = {
    companyName,
    duties,
    email,
    gender,
    phoneNo,
    roleId,
    roleName,
    supplierId: id,
    userId,
    userName,
    privilegeType,
    originRoleId
  }

  return request(params).then((res) => {
    dispatch(getSupplierContactsList());
    return res;
  });
}


export const createSupplierContacts = (values) => (dispatch, getState) => {
  return updateContactsRequest(values, api.createSupplierContacts, dispatch, getState)
};

export const modifySupplierContacts = (values) => (dispatch, getState) => {
  return updateContactsRequest(values, api.modifySupplierContacts, dispatch, getState)
};

export const deleteSupplierContacts = (values) => (dispatch, getState) => {
  return updateContactsRequest(values, api.deleteSupplierContacts, dispatch, getState)
};


export const findUserByEmail = (email) => () => {
  return api.findUserByEmail({email}, {normalErrorHandling: false}).then((res) => {
    const {data, code} = res;
    if (code === '0')
      return data;
  });
};