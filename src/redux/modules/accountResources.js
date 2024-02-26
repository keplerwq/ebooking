import api from 'src/api';

const UPDATEBILLING = Symbol('UPDATEBILLING');

const initialState = {
  billingTotal: 0
};

export default function accountResources(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATEBILLING:
      return {
        ...state,
        billingTotal: action.billingTotal
      };
    default:
      return state;
  }
}

export const getBillingTotal = data => ({
  type: UPDATEBILLING,
  ...data
})

export function setBillingTotal(data) {
  return dispatch => {
    if (data) {
      return dispatch(getBillingTotal(data))
    }
    api.getIDCAccountList({
      type: '',
      status: '待复核',
      startTime: '',
      endTime: '',
      pageNum: 1,
      pageSize: 10
    }).then(({ code, msg }) => {
      if (code === 0) {
        const { total: billingTotal } = msg
        dispatch(getBillingTotal({
          billingTotal
        }))
      }
    })
  }
}

