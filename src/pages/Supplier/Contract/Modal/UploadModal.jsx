
import React, { Component } from 'react';
import { Button, Input } from 'antd';
import ControlledForm from 'src/libs/nasa-ui/ControlledForm';
import { ModalEx, message } from 'src/components';
import { DragUpload } from 'src/containers';
import api from 'src/api';
import _ from 'lodash';
import './UploadModal.scss';


const Item = ControlledForm.Item;

const maxLength = 50;

class ContractFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      formValidate: false,
      fileList: [],
    }
  }
  componentDidMount() {

  }

  onModalClose = () => {
    this.props.modal.close();
  }

  handleSubmit = (values) => {


    const {poPath, poName} = values;
    const { id } = this.props.data;
    const params = {
      id ,
      poPath,
      poName
    }

    api.supplyUploadPo(params).then(res => {
      if (res.code === '0') {
        message.success(res.message || '');
        this.props.callback();
        this.onModalClose();
      }else {
        message.warning(res.message ||'');
      }


    });
  }

  onUploadChange = (info) => {

    let fileList = info.fileList;
    fileList = fileList.slice(-1);
    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.code === '0';
      }
      return true;
    });

    const poPath = _.get(fileList, '[0].response.result.url');
    const formData = { ...this.state.formData, poPath };
    this.setState({
      formData,
      fileList,
    });

    const code = _.get(info, 'file.response.code', null);

    if (code === '0') {
      message.success(`${info.file.name} 上传成功`, 3);
    }
    if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    }
    if (code === '1') {
      message.error(`${_.get(info, 'file.response.message', '')}`, 3);
    }
  }


  render() {
    const isNewEdition = Boolean(localStorage.getItem('NEW_EDITION'));
    const defaultUploadProps = {
      name: 'file',
      action: isNewEdition ? api._config.uploadNew.url : api._config.upload.url,

    };

    const formItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 20 },
      },
      colon: false,
    };

    return (
      <div className="m-supply-contract-upload">
        <ControlledForm
          value={this.state.formData}
          onValidate={(status)=> {
            this.setState({formValidate: status});
          }}
          onSubmit={(values)=>{
            this.handleSubmit(values);
          }}
          onChange={(formData) => {
            this.setState({formData});
          }}
          ref={(f) => { this.form = f}}
        >

          <Item
            dataIndex="poPath"
            rules={[{ required: true, message: '请上传合同' },]}
          >
            <DragUpload {...defaultUploadProps} desc="点击上传或将合同拖到当前区域上传" onChange={this.onUploadChange} fileList={this.state.fileList}/>
          </Item>

          <Item
            {...formItemLayout}
            label="文件名"
            dataIndex="poName"
            rules={[{ required: true, message: '请输入文件名' },]}
            decorator={
              <Input maxLength={maxLength} placeholder="请输入文件名" />
            }
          />

          <div className="u-form-footer">
            <Button type="primary" ghost onClick={this.onModalClose}>取消</Button>
            <Button type="primary" htmlType="submit">提交</Button>
          </div>
        </ControlledForm>
      </div>
    )
  }
}

export default function upload(data = {}, callback) {
  const title = '上传合同';
  console.log('call',callback)
  ModalEx.confirm({
    title,
    content: <ContractFile data={data} callback={callback}></ContractFile>,
    width: 600,
    footer: null,
  });
}
