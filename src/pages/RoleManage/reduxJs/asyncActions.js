import { actions } from '.';
import api from 'src/api';

const getCurrentSupplier = () => JSON.parse(localStorage.getItem('USER_META_INFO'))?.supplierInfoDO;

export const getSupplierRoles = () => (dispatch, getState) => {

  const {roleManage: state} = getState();

  const params = {
    "orderItemList": [
      {
        orderDirection: 'desc',
        orderField: 'create_time',
      },
    ],
    "pageNo": state.roleListData.pageNo,
    "pageSize": state.roleListData.pageSize,
    "roleName": state.finalFilterValues.roleName,
    "supplierId": getCurrentSupplier()?.id,
  }

  api.getSupplierRoles(params).then((res) => {
    dispatch(actions.setRoleListData(res.data));
  });
};

export const deleteSupplierRole = (roleId) => (dispatch, getState) => {
  return api.deleteSupplierRole({roleId}).then((res) => {
    // ...
    dispatch(getSupplierRoles());
  });
}