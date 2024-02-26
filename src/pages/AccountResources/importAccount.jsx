/**
 * @file  导入账单
 * @author olgaWu
 *
 */

import React, { Component } from 'react';
import { PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Input, Select, Upload, Radio, Checkbox, Modal } from 'antd';
import { ModalEx, ControlledForm,message } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import axios from 'axios';
import apiConfig from 'src/api/api-config';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

const FormItem = ControlledForm.Item;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class ImportAccount extends Component {
  constructor(props) {
    super(props)
    const { data = {} } = props;

    this.state = {
      formValidate: false,
      loading: false,
      data,
      ImportData: {
        orderType: '',
        file: '',
        billType: '',
        billTypeSubs: ''
      },
      orderType: [],
      fileList: [],
    }
  }
  componentDidMount() {
    this.getOrderType();
  }
    getOrderType = () => { //获取账单类型
      api.getIDCAccountType().then((res) => {
        if (res.code === 0) {
          let list = res.msg.list.map(item => {
            return item
          })
          this.setState({ orderType: list },
            () => { console.log(list, this.state.orderType) })

        } else {
          this.setState({ orderType: [] })
        }
      });
    }
    onClose = () => {
      this.props.modal.close();
    }
    onFormChange = (values, key, v) => {
      this.setState({ ImportData: values });
    }
    handleTypeChange = (name, value) => {
      const { ImportData } = this.state;
      if (name === 'checkbox') {
        this.setState({
          ImportData: {
            ...ImportData,
            billTypeSubs: value
          }
        });
        return
      }
      if (name === 'radio') {
        this.setState({
          ImportData: {
            ...ImportData,
            billType: value,

          },
          flag: true
        },
        //   ()=> this.getDetail()
        );
      }
    }
    onSubmit = (values) => { //导入账单
      const { ImportData } = this.state;
      this.setState({ loading: true });
      let data = new FormData();
      data.append('file', ImportData.file.file);
      data.append('type',ImportData.billType);
      data.append('typeSubs',ImportData.billTypeSubs?ImportData.billTypeSubs.join(',') :'');
      axios.post(apiConfig.getIDCUploadAccount.url, data).then(res => {
        console.log(res);
        // this.setState({ loading: false });

        if (res.data.code == 0) {
          // location.reload()
          this.onClose()
          console.log('test');
          this.props.callback();
          this.props.data.skip('草稿');
        } else {
          console.log(res.data);

          message.error(res.data.msg);
        }
      }).catch(() => {
        this.setState({ loading: false });
      })
    }
    onDownloadAccount = () => {
      const { ImportData } = this.state;
      window.open(`/supplier/Account/idc/getBillingTemplate.do?type=${ImportData.billType}&typeSubs=${ImportData.billTypeSubs}`, '_blank');
    }

    //获取账单模板
    getAccountModel() {
      const { ImportData } = this.state;
      api.getIDCAccountTemplate().then(res => {
        this.setState({
          fileList: res.msg.file
        })

      })
    }
    render() {
      const { ImportData, formValidate, loading, orderType, fileList } = this.state;
      const uploadProps = {
        beforeUpload: (file) => {
          this.setState({
            fileList: [file]
          });
          return false;
        },
        fileList
      };
      const IDC = orderType.find(item => item.name === 'IDC');
      const plainOptions = [];
      if (IDC) {
        IDC.child.map(item => {
          plainOptions.push(item.name)
        })
      }
      return (
        <ConfigProvider locale={zhCN}>
          <ControlledForm
            onValidate={(status) => {
              this.setState({ formValidate: status });
            }}
            ref={(f) => { this.form = f }}
            onSubmit={this.onSubmit}
            itemProps={formItemLayout}
            value={ImportData}
            onChange={this.onFormChange}
            className="m-add-remark"
          >
            <div className="search-item" style={{ margin: '20px 0' }}>
              <label>账单类型:</label>
              <div style={{ margin: '10px' }}>
                <Radio.Group value={ImportData.billType} onChange={(e) => this.handleTypeChange('radio', e.target.value)} >
                  {orderType.map((item, index) => (
                    <Radio value={item.name} key={index} >{item.name}</Radio>
                  ))}
                </Radio.Group>
              </div>
              {
                plainOptions.length > 0 && ImportData.billType === 'IDC' ?
                  <div style={{ margin: '10px' }}>
                    <Checkbox.Group value={ImportData.billTypeSubs} options={plainOptions} onChange={(value) => this.handleTypeChange('checkbox', value)} />
                  </div>
                  :
                  null
              }
            </div>
            <div>
              <div style={{ margin: '15px 0' }}>账单模板：</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F5F5F5' }}>
                <div className="u-download-template"><PaperClipOutlined />账单模板</div>
                <div><a onClick={this.onDownloadAccount}>点击下载</a> </div>
              </div>
            </div>
            <div style={{ margin: '15px 0' }}>
              <label>导入账单：</label>
              <div style={{ margin: '10px', paddingLeft: '80px' }}>
                <FormItem
                  dataIndex="file"
                  rules={[{ required: true, message: '请上传文件' }]}
                  decorator={
                    <Upload {...uploadProps} style={{ textAlign: 'center' }}>
                      <div className="u-upload-block">
                        <Button type="primary"><UploadOutlined /> 上传文件</Button>
                        <p style={{ fontSize: '10px' }}>只能上传xlsx文件,且不大于1M</p>
                      </div>
                    </Upload>
                  }
                />
              </div>
            </div>
            <div id="m-remark-add">
              <div className="ant-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <Button onClick={this.onClose}>取消</Button>
                <Button type="primary" htmlType="submit" loading={loading}>确定</Button>
              </div>
            </div>

          </ControlledForm>
        </ConfigProvider>
      );
    }

}

export default function addRemark(data = {}, callback) {
  const title = `批量导入`;
  ModalEx.confirm({
    title,
    content: <ImportAccount data={data} callback={callback} />,
    width: 428,
    footer: null,
  });
}
