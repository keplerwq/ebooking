import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // 筛选器中 input 的用户名
  roleNameInFilter: '',
  // 点击搜索后，才会将值存入这里
  finalFilterValues: {
    roleName: '',
  },
  // 角色列表
  roleListData: {
    // 总页数
    count: 1,
    // 当前页数
    pageNo: 1,
    // 每页条数
    pageSize: 10,
    // 总条数
    total: 0,
    // 角色列表
    data: [],
  },
};

export const slice = createSlice({
  // namespace for action type
  name: 'roleManage',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    setRoleNameInFilter: (state, action) => {
      state.roleNameInFilter = action.payload;
    },
    setFinalForFilter: (state, action) => {

      if (action.payload === 'search') {
        state.finalFilterValues = { 
          roleName: state.roleNameInFilter, 
        };
      }
      
      if (action.payload === 'reset') {
        state.roleNameInFilter = '';
        state.finalFilterValues = { roleName: '' };
      }
    },
    setRoleListData: (state, action) => {
      Object.assign(state.roleListData, action.payload);
    },
  },
});


export const actions = slice.actions;

export default slice.reducer;