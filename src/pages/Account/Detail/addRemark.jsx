/**
 * @file  添加备注
 * @author yangfan03@corp.netease.com
 * 
 */

import React, { Component } from 'react';
import { Button, Input } from 'antd';
import { ModalEx, message, ControlledForm } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';


const FormItem = ControlledForm.Item;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class AddRemark extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;

    this.state = {
      formValidate: false,
      loading: false,
      data,
      addData: {
        supplierRemark: data.supplierRemark
      },
    }
  }

  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
    const { callback, data } = this.props;
    this.setState({ loading: true });
    let params = {
      ...values,
      id: data.id,
    };

    api.addAccountRemark(params).then(res => {
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
          className="m-add-remark"
        >
          <div id="m-remark-add">
            <FormItem
              label={'填写备注'}
              dataIndex="supplierRemark"
              required
              rules={[
                { max: 50, message: '最多输入50个字' },
              ]}
              decorator={
                <TextArea placeholder="请输入" autoSize={{ minRows: 4, maxRows: 6 }} />
              }
            />
            <div className="u-span" style={{ margin: '0 0 20px 80px' }}>将同步此备注信息给网易采购</div>
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


export default function addRemark(data = {}, callback) {
  const title = `备注`;
  ModalEx.confirm({
    title,
    content: <AddRemark data={data} callback={callback} />,
    width: 428,
    footer: null,
  });
}