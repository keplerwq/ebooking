import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeTab: 'waiting_quotation',
  // 筛选-关键字
  keywords: null,
  // 筛选-紧急状态
  urge: null,
  // 筛选-采购员
  ownerEmail: null,
  ownerList: [],
  brandList: [],
  currencyList: [],
  waitHandleTotal: null,
  // 询价列表
  quoteList: {
    // 总页数
    count: 1,
    // 当前页数
    pageNo: 1,
    // 每页条数
    pageSize: 10,
    // 总条数
    total: 0,
    // 询价列表数据
    data: [],
    sort: 'asc',
    orderByQ: '',
  },
  // 询价详情
  quoteDetails: {}
};

export const slice = createSlice({
  // namespace for action type
  name: 'quoteCommon',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(
        state,
        initialState,
        { waitHandleTotal: state.waitHandleTotal }
      );
    },
    updateQuoteCommon: (state, {payload}) => {
      Object.assign(state, {
       ...payload
      });
    },
    resetFilter: (state) => {
      Object.assign(state, {
        keywords: null,
        // 筛选-紧急状态
        urge: null,
        // 筛选-采购员
        ownerEmail: null,
      });
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setOwnerList: (state, action) => {
      state.ownerList = action.payload
    },
    setBrandList: (state, action) => {
      state.brandList = action.payload
    },
    setCurrencyList: (state, action) => {
      state.currencyList = action.payload
    },
    setSearchKeywords: (state, action) => {
      state.keywords = action.payload
    },
    setUrge: (state, action) => {
      state.urge = typeof action.payload === 'string' ?
        action.payload === '1' :
        action.payload
    },
    setOwnerEmail: (state, action) => {
      state.ownerEmail = action.payload
    },
    setQuoteList: (state, action) => {
      if (state.activeTab === 'waiting_quotation') state.waitHandleTotal = action.payload.total
      state.quoteList = action.payload
    },
    setQuoteDetails: (state, action) => {
      state.quoteDetails = action.payload
    },
  },
});


export const actions = slice.actions;

export default slice.reducer;