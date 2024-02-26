import moment from 'moment';

export const defaultRanges = {
  '今日': [moment().hour(0).minute(0).seconds(0), moment()],
  '昨日': [moment().subtract(1, 'days').hour(0).minute(0).seconds(0), moment().subtract(1, 'days').hour(23).minute(59).seconds(59)],
  '最近七天': [moment().subtract(7, 'days').hour(0).minute(0).seconds(0), moment().subtract(1, 'days').hour(23).minute(59).seconds(59)],
};

export const disabledDate = (current) => (current.valueOf() >= moment().valueOf() || current.valueOf() < moment().subtract(90, 'days').valueOf());