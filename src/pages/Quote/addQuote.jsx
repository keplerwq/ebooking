/**
 * @file  新增报价
 * @author hzwanglintao@corp.netease.com
 * 
 */

import React, { Component } from 'react';
import { Select, Button, Input, DatePicker, Row, Col } from 'antd';
import { ModalEx, message, ControlledForm } from 'src/components';
import api from 'src/api';
import { InputNumber } from 'antd';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';


const FormItem = ControlledForm.Item;
const Option = Select.Option;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class AddQuote extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;

    this.state = {
      formValidate: false,
      loading: false,
      data,
      addData: {
        taxRate: data.taxRate
      },
      taxRateList: [],   //税率列表
      guaranteeList: [], //保修信息
      arrivalCycleDeal: {
        unit: '天',
      },
    }
  }


  componentDidMount() {
    api.getTaxRate().then((res) => {
      const { list = [] } = res.msg;
      this.setState({
        taxRateList: list || []
      });
    });
    api.getGuarantee().then(res => {
      const { list = [] } = res.msg;
      this.setState({
        guaranteeList: list || []
      });
    })
  }


  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
    const { callback, data } = this.props;
    this.setState({ loading: true });
    const { arrivalCycleDeal } = this.state;
    let params = {
      ...values,
      arrivalCycle: `${arrivalCycleDeal.value}${arrivalCycleDeal.unit}`,
      id: data.id,
      effectSt: values.effectDate[0],
      effectEt: values.effectDate[1],
      effectDate: undefined,
      untaxPrice: undefined
    };
    // delete params.untaxPrice
    api.priceQuote(params).then(res => {
      this.setState({ loading: false });
      callback && callback();
      this.onClose();
      message.success('报价成功');
    }).catch(() => {
      this.setState({ loading: false });
    })
  }

  onFormChange = (values, key, v) => {
    const { addData, arrivalCycleDeal } = this.state;
    if (key === 'taxRate' || key === 'price') {
      const { price, taxRate } = Object.assign(addData, values);
      if (price !== undefined && taxRate) {
        const untaxPrice = (parseFloat(price) / parseFloat(taxRate)).toFixed(2);
        this.setState({
          addData: Object.assign(addData, values, { untaxPrice })
        });
      }
      else {
        this.setState({ addData: Object.assign(addData, values) });
      }
    }
    else if (key === 'arrivalCycle') {
      this.setState({ arrivalCycleDeal: Object.assign(arrivalCycleDeal, values) }, () => {
        if (arrivalCycleDeal.value) {
          const arrivalCycle = `${arrivalCycleDeal.value || ''}${arrivalCycleDeal.unit || ''}`
          this.setState({ addData: Object.assign(addData, { arrivalCycle }) });
        }
      });
    }
    else {
      this.setState({ addData: values });
    }
  }

  render() {

    const { addData, loading, taxRateList, guaranteeList, arrivalCycleDeal } = this.state;
    const { data } = this.props;
    const arrivalCycleUnitList = ['天', '周', '月'];

    return (
      <ConfigProvider locale={zhCN}>
        <ControlledForm
          ref={(f) => { this.form = f }}
          onSubmit={this.onSubmit}
          itemProps={formItemLayout}
          value={addData}
          onChange={this.onFormChange}
          className="m-add-quote"
        >
          <div id="m-quote-add">
            <FormItem
              label={'商品品牌'}
              dataIndex="brand"
              className="u-label-show"
              decorator={
                <span>{data.brand}</span>
              }
            />
            <FormItem
              label={'商品名称'}
              dataIndex="name"
              className="u-label-show"
              decorator={
                <span>{data.name}</span>
              }
            />
            <FormItem
              label={'属性'}
              dataIndex="property"
              className="u-label-show"
              decorator={
                <span>{data.property}</span>
              }
            />
            <FormItem
              label={'数量'}
              dataIndex="num"
              className="u-label-show"
              decorator={
                <span>{data.num}</span>
              }
            />
            <Row>
              <Col span={11} offset={0}>
                <FormItem
                  label={'含税单价'}
                  dataIndex="price"
                  required
                  labelCol={{ span: 6 }}
                  decorator={
                    <div style={{marginLeft: 60}}>
                      <InputNumber
                        precision={2}
                        min={0}
                        onChange={(val) => this.onFormChange({ price: val }, 'price', val)}
                      /> <span>{data.unit}</span>
                    </div>
                  }
                />
              </Col>
              <Col span={10} offset={1}>
                <FormItem
                  label={'未税单价'}
                  dataIndex="untaxPrice"
                  labelCol={{ span: 6 }}
                  decorator={
                    <div>
                      <span>{addData.untaxPrice} </span>
                      <span>{data.unit}</span>
                    </div>
                  }
                />
              </Col>
            </Row>
            <FormItem
              label={'税率'}
              dataIndex="taxRate"
              required
              decorator={
                <Select
                  placeholder="请选择"
                  allowClear
                  showSearch
                  getPopupContainer={() => document.getElementById('m-quote-add')}
                >
                  {
                    taxRateList.map(item => (
                      <Option key={item} title={item}>{item}</Option>
                    ))
                  }
                </Select>
              }
            />
            <FormItem
              label={'报价有效期'}
              dataIndex="effectDate"
              required
              decorator={
                <RangePicker
                  allowClear
                  format={`YYYY-MM-DD`}
                  placeholder={['请选择', '']}
                />
              }
            />
            <FormItem
              label={'保修信息'}
              dataIndex="guarantee"
              required
              decorator={
                <Select
                  placeholder="请选择"
                  allowClear
                  showSearch
                  getPopupContainer={() => document.getElementById('m-quote-add')}
                >
                  {
                    guaranteeList.map(item => (
                      <Option key={item} title={item}>{item}</Option>
                    ))
                  }
                </Select>
              }
            />
            <FormItem
              label={'到货周期'}
              dataIndex="arrivalCycle"
              required
              decorator={
                <div className="u-wrapper-container">
                  <InputNumber
                    className="u-wrapper-container-input"
                    min={1}
                    precision={0}
                    onChange={(val) => this.onFormChange({ value: val }, 'arrivalCycle', val)}
                  />
                  <Select
                    className="u-wrapper-container-select"
                    value={arrivalCycleDeal.unit}
                    onChange={(val) => this.onFormChange({ unit: val }, 'arrivalCycle', val)}
                  >
                    {
                      arrivalCycleUnitList.map(item => (
                        <Option key={item} title={item}>{item}</Option>
                      ))
                    }
                  </Select>
                </div>
              }
            />
            <FormItem
              label={'备注'}
              dataIndex="remark"
              decorator={
                <TextArea />
              }
            />
            <div className="ant-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
              <Button onClick={this.onClose}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>确定</Button>
            </div>
          </div>
        </ControlledForm>
      </ConfigProvider>
    )
  }
}


export default function addQuote(data = {}, callback) {
  const title = `报价`;
  ModalEx.confirm({
    title,
    content: <AddQuote data={data} callback={callback} />,
    width: 700,
    footer: null,
  });
}