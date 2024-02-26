/**
 * @file  新增报价
 * @author hzwanglintao@corp.netease.com
 * 
 */

import React, { Component } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import { ModalEx, ControlledForm } from 'src/components';
import './Quote.scss';
import axios from 'axios';
import apiConfig from 'src/api/api-config';


const FormItem = ControlledForm.Item;

class AddBatchQuote extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;

    this.state = {
      formValidate: false,
      loading: false,
      addData: Object.assign({}, data, { file: '' }),
      fileList: []
    }
  }


  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
    const { callback } = this.props;
    const { addData } = this.state;
    this.setState({ loading: true });
    let data = new FormData();
    data.append('file', addData.file.file);
    axios.post(apiConfig.batchPriceQuote.url, data).then(res => {
      this.setState({ loading: false });
      callback && callback();
      this.onClose();
      const { msg = {} } = res.data;
      ModalEx.confirm({
        title: '批量报价结果',
        content: <div>
          <p>{`成功订单:  ${msg.success}单`}</p>
          <p>{`失败订单:  ${msg.fail}单`}</p>
          <p>{`导入失败ID:  ${msg.importResult}`}</p>
        </div>,
        width: 400,
        okText: '确定',
        cancelText: '关闭',
        onOk: function (callback) { callback(); },
      });
    }).catch(() => {
      this.setState({ loading: false });
    });
  }


  onFormChange = (values, key, v) => {
    this.setState({ addData: values });
  }


  //根据id下载报价附件
  onDownloadQuote = () => {
    const { addData } = this.state;
    window.open(`/supplier/price/exportByIds.do?ids=${addData.list.join('*')}`, '_blank');
  }


  render() {

    const { addData, loading, fileList } = this.state;
    const uploadProps = {
      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        return false;
      },
      fileList
    };

    return (
      <div>
        <ControlledForm
          onValidate={(status) => {
            this.setState({ formValidate: status });
          }}
          ref={(f) => { this.form = f }}
          onSubmit={this.onSubmit}
          // itemProps={formItemLayout}
          value={addData}
          onChange={this.onFormChange}
          className="m-batch-quote"
        >
          <div>
            <div style={{ marginBottom: 20 }}>批量报价说明：</div>
            <div style={{ marginBottom: 13 }}>1. 单次不能超过1000条</div>
            <div style={{ marginBottom: 13 }}>2. 请下载需
              {
                // eslint-disable-next-line
                <a onClick={this.onDownloadQuote}>报价列表</a>
              }
              填写报价信息后上传（请不要修改表格的ID列）</div>
            <div style={{ marginBottom: 20 }}>3. 备注不能超过500字</div>
          </div>
          <FormItem
            label={'上传文件'}
            dataIndex="file"
            rules={[{ required: true, message: '请上传文件' }]}
            decorator={
              <Upload {...uploadProps}>
                <Button type="primary" ghost>
                  <UploadOutlined /> 上传
                </Button>
              </Upload>
            }
          />
          <div className="ant-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
            <Button onClick={this.onClose}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>确定</Button>
          </div>
        </ControlledForm>
      </div>
    );
  }
}


export default function addBatchQuote(data = {}, callback) {
  const title = `批量报价`;
  ModalEx.confirm({
    title,
    content: <AddBatchQuote data={data} callback={callback} />,
    width: 700,
    footer: null,
  });
}