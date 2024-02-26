import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // 筛选器的角色列表
  filterRoleList: [],
  // 筛选器中选中的角色
  selectedRoleInFilter: void 0,
  // 筛选器中 input 的用户名
  usernameInFilter: '',
  // 点击搜索后，才会将值存入这里
  finalFilterValues: {
    name: '',
    role: void 0,
  },
  // 联系人列表
  contactsListData: {
    // 总页数
    count: 1,
    // 当前页数
    pageNo: 1,
    // 每页条数
    pageSize: 10,
    // 总条数
    total: 0,
    // 联系人列表
    data: [],
  },
};

export const slice = createSlice({
  // namespace for action type
  name: 'contactsManage',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    initFilterState: (state, action) => {
      state.selectedRoleInFilter = action.payload;
      state.finalFilterValues.role = action.payload;
    },
    setFilterRoleList: (state, action) => {
      state.filterRoleList = action.payload;
    },
    selectRoleInFilter: (state, action) => {
      state.selectedRoleInFilter = action.payload;
    },
    setUsernameInFilter: (state, action) => {
      state.usernameInFilter = action.payload;
    },
    setFinalForFilter: (state, action) => {

      if (action.payload === 'search') {
        state.finalFilterValues = { 
          name: state.usernameInFilter, 
          role: state.selectedRoleInFilter
        };
      }
      
      if (action.payload === 'reset') {
        state.usernameInFilter = '';
        state.selectedRoleInFilter = void 0;
        state.finalFilterValues = { name: '', role: void 0 };
      }
    },
    setContactsListData: (state, action) => {
      Object.assign(state.contactsListData, action.payload);
    },
  },
});


export const actions = slice.actions;

export default slice.reducer;