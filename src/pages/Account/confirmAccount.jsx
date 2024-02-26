/**
 * @file  确认账单
 * @author yangfan03@corp.netease.com
 * 
 */

import React, { Component } from 'react';
import { Button, Input, Radio } from 'antd';
import { ModalEx, ControlledForm } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';


const FormItem = ControlledForm.Item;
const RadioGroup = Radio.Group;
// const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class ConfirmAccount extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;
    console.log(props);
    this.state = {
      formValidate: false,
      loading: false,
      data,
      addData: {
        pass: data.auth.indexOf('refuse') ? 0 : 1,
        accountTime: data.accountTime,
      },
    }
  }

  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
    this.setState({ loading: true });
    console.log(values);
    api.confirmAccount(values).then(res => {
      this.setState({ loading: false });
      if (res.code === 0) {
        callback && callback();
        this.onClose();

      } else {
        message.error(res.msg);
      }
    }).catch(() => {
      this.setState({ loading: false });
    })
  }

  onFormChange = (values, key, v) => {
    this.setState({ addData: values });
  }

  render() {
    const { addData, formValidate, loading, } = this.state;

    return (
      <ConfigProvider locale={zhCN}>
        <ControlledForm
          ref={(f) => { this.form = f }}
          onSubmit={this.onSubmit}
          itemProps={formItemLayout}
          value={addData}
          onChange={this.onFormChange}
          className="m-confirm-account"
        >
          <div >
            <FormItem
              label={'账单确认'}
              dataIndex="pass"
              decorator={
                <RadioGroup>
                  <Radio value={1}>同意</Radio>
                  <Radio value={0}>拒绝</Radio>
                </RadioGroup>
              }
            />
            {/* {addData.pass === '0' ? <FormItem
              label={'拒绝理由'}
              dataIndex="refuseReason"
              required
              rules={[
                { max: 50, message: '最多输入50个字' },
              ]}
              decorator={
                <TextArea placeholder="请输入" autoSize={{ minRows: 4, maxRows: 6 }} maxLength={50} />
              }
            /> : ''} */}

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


export default function confirmAccount(data = {}, callback) {
  const title = `账单确认`;
  ModalEx.confirm({
    title: '退回修正',
    content: <ConfirmAccount data={data} callback={callback} />,
    width: 540,
    footer: null,
  });
}