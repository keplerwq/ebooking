import React, { Component } from 'react';
import { Button, Input } from 'antd';
import { ModalEx, ControlledForm } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { message } from 'src/components';

const FormItem = ControlledForm.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class AddEOrder extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;
    this.state = {
      loading: false,
      data,
      addData: {
        operate: 'add',
        sid: '',
        accountTime: data.accountTime
      },
    }
  }

  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
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
    })
  }

  onFormChange = (values, key, v) => {
    this.setState({ addData: values });
  }

  render() {
    const { addData, loading, } = this.state;
    const { data } = this.props;

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
              label="子订单id:"
              dataIndex='sid'
              className="u-label-show"
              decorator={
                <Input />
              }
            />

            <div style={{textAlign: 'center', marginBottom: '20px'}}>仅能添加待结算订单</div>

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

export default function addEOrder (data = {}, callback) {
  const title = `新增订单`;
  ModalEx.confirm({
    title,
    content: <AddEOrder data={data} callback={callback} />,
    width: 560,
    footer: null,
  });
}