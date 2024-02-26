/**
 * @file  批量发货
 * @author yangfan03@corp.netease.com
 * 
 */

import React, { Component } from 'react';
import { DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Upload, message } from 'antd';
import { ModalEx, ControlledForm } from 'src/components';
import './Order.scss';
import axios from 'axios';
import apiConfig from 'src/api/api-config';

const FormItem = ControlledForm.Item;
class ExcelBatchDeliver extends Component {
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
    axios.post(apiConfig.excelBatchDeliver.url, data).then(res => {
      this.setState({ loading: false });
      if (res.data.code === 0) {
        callback && callback();
        this.onClose();
        message.success('发货成功!');
      } else {
        message.error(res.data.msg); 
      }
    }).catch(() => {
      this.setState({ loading: false });
    });
  }


  onFormChange = (values, key, v) => {
    this.setState({ addData: values });
  }


  //根据id下载报价附件
  onDownloadDelivery = () => {
    const { addData } = this.state;
    window.open(`/supplier/order/exportDeliverExcel?sids=${addData.list.join(',')}`, '_blank');
  }


  render() {

    const { addData, loading, fileList } = this.state;
    const uploadProps = {
      beforeUpload: (file) => {
        this.setState({
          fileList: [file]
        });
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
          className="m-batch-delivery"
        >
          <FormItem
            dataIndex="file"
            rules={[{ required: true, message: '请上传文件' }]}
            decorator={
              <Upload {...uploadProps}>
                <div
                  className="u-upload-block"
                >
                  <Button type="primary">上传文件</Button>
                  <p>选择或拖拽文件到上传文件区域</p>
                </div>
              </Upload>
            }
          />
          <div className="u-download-template">
            <span
              onClick={this.onDownloadDelivery}
            >
              <DownloadOutlined />
              下载模板
            </span>
            <p>
              <ExclamationCircleOutlined className="s-icon" />
              注意:勾选订单后下载模板,模板中会自带订单信息,发货更方便
            </p>
          </div>
          <div className="f-select-button">
            <Button onClick={this.onClose}>取消</Button>
            <Button htmlType="submit" loading={loading} className="s-submit-buttom">批量发货</Button>
          </div>
        </ControlledForm>
      </div>
    );
  }
}


export default function addExcelBatchDeliver(data = {}, callback) {
  const title = `批量发货`;
  const footer = <div className="m-batch-delivery u-footer-text">
    <div>1. 单次不能超过1000条</div>
    <div>2. 如需填写物流信息,请下载订单模板修改后上传</div>
    <div>3. 备注不能超过500字</div>
  </div>;
  ModalEx.confirm({
    title,
    content: <ExcelBatchDeliver data={data} callback={callback} />,
    width: 400,
    footer,
  });
}