import React, { Component } from 'react';
import { Button, Input, Select } from 'antd';
import { ModalEx, message, ControlledForm } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import './EditEOrder.scss'

const FormItem = ControlledForm.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class EditEOrder extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;
    this.state = {
      loading: false,
      data,
      addData: {
        operate: 'edit',
        settleStatus: data.settleStatus,
        price: data.purchasePrice,
        id: data.id,
        sid: data.sid
      },
    }
  }

  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
    let editInfo = JSON.parse(localStorage.getItem('editInfo'));
    if (editInfo && values && editInfo.settleStatus === values.settleStatus && editInfo.price === parseFloat(values.price)) {
      localStorage.removeItem('editInfo');
      return this.onClose();
    };
    const { callback } = this.props;
    api.mergeAccountOrder(values).then(res => {
      if (res.code === 0) {
        callback && callback();
        this.onClose();
      } else {
        message.error(res.msg);
      }
    }).catch(() => {
      this.setState({ loading: false });
    });
    localStorage.removeItem('editInfo');
  }

  onFormChange = (values, key, v) => {
    this.setState({ addData: values });
  }

  render() {
    const { addData, loading, } = this.state;
    const { data } = this.props;
    
    // addData.settleStatus = settleStatusMap[addData.settleStatus]
    // const settleStatus = settleStatusMap[addData.settleStatus]

    return (
      <ConfigProvider locale={zhCN}>
        <ControlledForm
          ref={(f) => { this.form = f }}
          onSubmit={this.onSubmit}
          itemProps={formItemLayout}
          value={addData}
          onChange={this.onFormChange}
          className="m-add-remark"
        >
          <div className="m-remark-add">

            <FormItem
              label="结算状态"
              dataIndex='settleStatus'
              className="u-label-show"
              decorator={
                <Select>
                  <Option key={"1"} title="1">已结算</Option>
                  {/* <Option key={"2"} title="2" disabled>待结算</Option> */}
                  <Option key={"3"} title="3">结算中</Option>
                </Select>
              }
            />
            <div style={{margin: '0 0 24px 107px'}}>谨慎操作：更改为已结算状态后，将不会出现在该账期中</div>

            <FormItem
              label="采购单价"
              dataIndex='price'
              className="u-label-show"
              required
              decorator={
                <Input />
              }
            />
            <span style={{position: 'absolute', right: '100px', top: '183px'}}>(元)</span>

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


export default function editEOrder(data = {}, callback) {
  const title = `修改订单`;
  ModalEx.confirm({
    title,
    content: <EditEOrder data={data} callback={callback} />,
    width: 560,
    footer: null,
  });
}