/**
 * @file  导入账单
 * @author olgaWu
 *
 */

import React, { Component } from 'react';
import { Button, Input, Select, Upload, DatePicker, InputNumber, Popover } from 'antd';
import { ModalEx, ControlledForm ,message} from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import './Detail.scss';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

const FormItem = ControlledForm.Item;
const { TextArea } = Input;
const { Option, OptGroup } = Select;
const { MonthPicker, RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class EditAccountDetailComponent extends Component {
  constructor(props) {
    super(props)
    const { data = {} } = props;
    this.state = {
      loading: false,
      editData: {
        ...data,
        billMonth: data.billMonth ? moment(parseFloat(data.billMonth)) : moment(parseFloat(Date.parse(new Date())))
      },
      itemId: "",
      data,
      orderType: [],
      fileList: [],
      formValidate: false,
      flag: false
    }
  }
  componentDidMount() {
    const { editData, flag } = this.state;
    if (editData.applyAmount ===  editData.actualAmount) {
      this.setState({
        flag: false
      })
    } else {
      this.setState({
        flag: true
      })
    }

    if(this.props.data.billMonth === ''){
      const currentDay = moment(parseFloat(Date.parse(new Date()))).format("YYYY-MM")
      console.log(currentDay);

      const yearData = currentDay.split('-')[0]
      const monthData = currentDay.split('-')[1]
      console.log(yearData);
      const totalDay= new Date(yearData, monthData, 0).getDate()//获取月份天数
      this.setState({
        editData: {
          ...editData,
          totalDay: totalDay,
          actualDay: totalDay
        }
      })
    }


  }
    onClose = () => {
      this.props.modal.close();
    }
    onFormChange = (values, key, v) => {
      console.log(values);

      const { editData, flag } = this.state;

      if (values.applyAmount == values.actualAmount) {
        this.setState({
          flag: false
        })
      } else if(values.applyAmount !== values.actualAmount) {
        this.setState({
          flag: true
        })
      }
      //  debugger
      if (values.quantity != '' && values.totalDay != '' && values.actualDay != '') {
        // debugger
        if (key === 'quantity' || key === 'totalDay' || key === 'actualDay') {
          const params = {  //获取价格
            itemId: values.itemId || '',
            itemFlag: values.itemFlag,
            // quantity: parseInt(values.quantity),
            quantity:values.quantity*1,
            totalDay: values.totalDay*1,
            actualDay: parseFloat(values.actualDay).toFixed(2)*1
          }
          api.getIDCAccountFormula(params).then(res => {
            if (res.code == 0) {
              this.setState({
                editData: {
                  ...values,
                  applyAmount: res.msg._1,
                  actualAmount:res.msg._1
                }
              })
            }
          })
        } else {
          this.setState({ editData: values })
        }
      } else {
        this.setState({ editData: values })
      }
      //获取当月总天数
      if (key === 'billMonth') {
        const currentDay = values.billMonth.format("YYYY-MM")
        const yearData = currentDay.split('-')[0]
        const monthData = currentDay.split('-')[1]
        console.log(yearData);
        const totalDay= new Date(yearData, monthData, 0).getDate()//获取月份天数
        this.setState({
          editData: {
            ...values,
            totalDay: totalDay,
            actualDay: totalDay
          }
        })
      }

    }
    onSubmit = (values) => {  //提交修改
      // 实收金额不能大于应付金额
      if (values.actualAmount > values.applyAmount) {
        message.error('实收金额大于应收金额不可提交')
        return false
      }
      const { index, callback } = this.props;
      callback(values, index);
      this.onClose();
    }
    handleChange = (value) => {
      console.log(`selected ${value}`);
    }
    render() {
      const { editData, flag, loading, fileList, data } = this.state;

      return (
        <ConfigProvider locale={zhCN}>
          <ControlledForm
            ref={(f) => { this.form = f }}
            onSubmit={this.onSubmit}
            itemProps={formItemLayout}
            value={editData}
            onChange={this.onFormChange}
            className="m-account-r-eidt-remark"
          >
            <div className="search-item">
              <FormItem
                required
                className="u-search-item"
                dataIndex='billMonth'
                label={'使用月份：'}
                rules={[
                  { required: true, message: '请选择月份' },
                ]}
                decorator={
                  <MonthPicker
                    picker="month"
                    placeholder="请选择"
                    allowClear={false}
                  />
                }>
              </FormItem>
            </div>
            <div className="search-item">
              <FormItem
                required
                label={'数量：'}
                dataIndex='quantity'
                className="u-search-item"
                rules={[
                  { required: true, message: '请输入数字' },
                ]}
                decorator={
                  <InputNumber placeholder='请输入数字' />
                }>
              </FormItem>
            </div>
            <div className="search-item">
              <FormItem
                required
                label={'计费天数：'}
                dataIndex='actualDay'
                className="u-search-item"
                rules={[
                  { required: true, message: '请输入数字' }
                ]}
                decorator={

                  <InputNumber placeholder='请输入数字' />
                }>
              </FormItem>
            </div>
            <div className="search-item">
              <FormItem
                required
                label={'当月总天数:'}
                dataIndex='totalDay'
                className="u-search-item"
                rules={[
                  { required: true, message: '请输入数字' },
                ]}
                decorator={
                  <InputNumber placeholder='请输入数字' />
                }>
              </FormItem>
            </div>
            <div className="search-item">
              <FormItem
                label={'应收金额：'}
                dataIndex='applyAmount'
                className="u-search-item"
                decorator={

                  <InputNumber disabled placeholder='请输入数字' />
                }>
              </FormItem>
            </div>
            <div className="search-item">
              <FormItem
                required
                label={'实收金额：'}
                dataIndex='actualAmount'
                className="u-search-item"
                rules={[
                  { required: true, message: '请输入数字' },
                ]}
                decorator={
                  <InputNumber className="u-search-item" placeholder='请输入数字'/>

                }>
              </FormItem>
            </div>
            {
              flag === true ?
                <div className="search-item" key={1}>
                  <FormItem
                    required
                    label={'填写备注'}
                    dataIndex="remark"
                    rules={[
                      { max: 200, message: '最多输入200个字' },
                      // { required: flag, message: '请填写备注' },
                    ]}
                    decorator={
                      <TextArea placeholder="请输入" autoSize={{ minRows: 4, maxRows: 6 }} />

                    }
                  >
                  </FormItem>

                </div>
                :
                <div className="search-item" key={2}>
                  <FormItem
                    label={'填写备注'}
                    dataIndex="remark"
                    rules={[
                      { max: 200, message: '最多输入200个字' },
                      // { required: flag, message: '请填写备注' },
                    ]}
                    decorator={
                      <TextArea placeholder="请输入" autoSize={{ minRows: 4, maxRows: 6 }} />

                    }
                  >
                  </FormItem>

                </div>
            }

            <div id="m-remark-add">
              <div className="ant-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <Button onClick={this.onClose}>取消</Button>
                <Button type="primary" htmlType='submit' loading={loading}>确定</Button>
              </div>
            </div>

          </ControlledForm>
        </ConfigProvider>
      )
    }

}

export default function editAccountDetail(data = {}, index, callback) {
  const title = `填写账单信息`;
  ModalEx.confirm({
    title,
    content: <EditAccountDetailComponent data={data} index={index} callback={callback} />,
    width: 428,
    footer: null,
  });
}
