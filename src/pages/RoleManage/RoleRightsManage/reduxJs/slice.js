import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // 权限类型
  privilegeType: void 0,
  // 角色名称
  roleName: '',
  // 供应商实体 tree
  supplierBizEntities: [],
  // 供应商菜单授权数据
  supplierMenuListGrant: [],
  // 事实更新的供应商菜单授权数据
  activeSupplierMenuListGrant: [],
  // 供应商数据授权项(这里每一项都要提交给后台)
  supplierDataGrantItem: {},
  // 当前激活的 supplierDataGrantItem
  activeSupplierDataGrantItem: [],
  // 当前激活的 supplierDataGrantItemKey
  activeSupplierDataGrantItemKey: '',
  // 菜单权限左侧初始化 checked 状态
  checkedMenuLeafs: {}
};

export const slice = createSlice({
  // namespace for action type
  name: 'roleRightsManage',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    setRoleName: (state, action) => {
      state.roleName = action.payload;
    },
    setPrivilegeType: (state, action) => {
      state.privilegeType = action.payload;
    },
    setSupplierBizEntities: (state, action) => {
      state.supplierBizEntities = action.payload;
    },
    setSupplierDataGrantItem: (state, action) => {
      const {data, bizCode = state.activeSupplierDataGrantItemKey}
        = action.payload;
      state.supplierDataGrantItem[bizCode] = data;
    },
    setActiveSupplierDataGrantItem: (state, action) => {
      state.activeSupplierDataGrantItem =
        state.supplierDataGrantItem[action.payload];
      state.activeSupplierDataGrantItemKey = action.payload;
    },
    setSupplierMenuListLeftChecked: (state, action) => {
      state.checkedMenuLeafs = action.payload;
    },
    setSupplierMenuListGrant: (state, action) => {
      state.supplierMenuListGrant = action.payload;
    },
    setActiveSupplierMenuListGrant: (state, action) => {
      state.activeSupplierMenuListGrant = action.payload;
    },
  },
});


export const actions = slice.actions;

export default slice.reducer;