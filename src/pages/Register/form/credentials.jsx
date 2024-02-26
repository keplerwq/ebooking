// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Upload } from 'antd';
import { FormEx2, message } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import { regFormSubmit } from 'src/helps/regFormSubmit'
import './credentials.scss';
import uploadIcon from 'src/resource/img/upload-icon.png';

const { Item } = FormEx2;

const maxLength = 50;

class Credentials extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
    }
  }

  handleSubmit = (values) => {
    const formData = _.cloneDeep(values)
    const form = regFormSubmit(formData);
    api.register(form).then((res) => {
      message.loading('注册成功，即将跳转到登录页', 3, null, false);
      setTimeout(() => {
        this.props.history.push('/login');
      }, 3000);
    });

  }

  onFormChange = (values, key) => {
    console.log(values);
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  onBeforeUpload = () => {
    const {
      licenceFileList
    } = this.props;
    if(licenceFileList.length >= 5 ) {
      message.error(`最多上传5份`, 3);
      return false;
    }
  }

  onUploadChange = (name, info) => {
    const { saveFile } = this.props.actions;
    let fileList = name === 'licenceFileList' ? info.fileList.slice(0, 5) : info.fileList.slice(-1);
    const value = [];
    fileList = fileList.filter((file) => {
      if (file.response) {
        if (file.response.errorCode === 0) {   //如果上传成功，则加到文件列表中，否则不加
          value.push(file.response.data);
        }
        return file.response.errorCode === 0;
      }
      return true;
    });

    saveFile(name, fileList);

    if (info.file.status === 'done') {
      // this.form.setValue(name, name === 'licenceFileList' ? value : fileList[0].response.data);
      this.form.setValue(name, name === 'licenceFileList' ? value : fileList[0] && fileList[0].response && fileList[0].response.data);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, name === 'licenceFileList' ? value : '');
    }
  }



  render() {
    const {
      registerForm,
      licenceFileList,
      authorizationFile,
      uploadProps
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 17, offset: 1 },
    };

    return (

      <div className="m-credentials">

        <header>
          <h1 className="u-tt">资质信息</h1>
          <div className="u-subtt">填写公司资质信息，为我们以后的工作提供便利</div>
        </header>

        <div className="u-form">
          <FormEx2

            defaultValues={registerForm}
            onValidate={(status)=> {
              this.setState({formValidate: status});
            }}
            onSubmit={(values)=>{
              this.handleSubmit(values);
            }}
            onChange={this.onFormChange}
            ref={(f) => { this.form = f}}
          >

            <Item
              {...formItemLayout}
              label="注册资金"
              required
              dataIndex="company.registerMoney"
              rules={[{ required: true, message: '请输入注册资金' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="注册资金" style={{ width: 180 }}/>
              }
            >
              <span style={{ marginLeft: 10 }}>万元</span>
            </Item>
            <Item
              {...formItemLayout}
              label="工商注册地址"
              required
              colon={false}
              dataIndex="qualification.registerAddress"
              rules={[{ required: true, message: '请输入工商注册地址' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="请填写工商注册地址" />
              }
            />


            <Item
              {...formItemLayout}
              label="营业执照扫描件"
              required
              colon={false}
              dataIndex="licenceFileList"
              rules={[{ required: true, message: '请上传营业执照扫描件' },]}
            >
              <div className="m-upload-wrapper">
                <Upload
                  {...uploadProps}
                  fileList={licenceFileList}
                  onChange={ (...args) => { this.onUploadChange('licenceFileList', ...args) } }
                  beforeUpload={this.onBeforeUpload}
                >
                  <Button className="u-uploader">
                    {/* <Icon type="cloud-upload" style={{fontSize: '32px'}}/> */}
                    <img src={uploadIcon} alt=""/>
                  </Button>
                </Upload>
                <div className="u-upload-desc">
                  <p>请上传营业执照扫描件</p>
                  <p>(非三证合一,可上传多个附件,最多5个)</p>
                </div>
              </div>
            </Item>


            <Item
              {...formItemLayout}
              label="授权证明扫描件"
              colon={false}
              dataIndex="authorizationFile"
              rules={[{ required: true, message: '请上传' },]}
              required
            >
              <div className="m-upload-wrapper">
                <Upload
                  {...uploadProps}
                  fileList={authorizationFile}
                  onChange={ (...args) => { this.onUploadChange('authorizationFile', ...args)  } }
                >
                  <Button className="u-uploader">
                    {/* <Icon type="cloud-upload" style={{fontSize: '32px', color: 'blue'}}/> */}
                    <img src={uploadIcon} alt=""/>
                  </Button>
                </Upload>
                <div className="u-upload-desc">
                  <p>请上传授权证明(仅用于证明贵公司与品牌方的合作)</p>
                  <p>多张授权证明:上传RAR、ZIP格式的压缩包均可</p>
                </div>
              </div>
            </Item>

            <div className="u-next">
              <Button  type="primary" htmlType="submit" >提交审核</Button>
            </div>
          </FormEx2>

        </div>

        <div className="m-intro">

          <p>注：填写过程中在点击提交资料审核前请勿关闭或刷新页面，否则已填写信息将会丢失。</p>

        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    licenceFileList: state.register.licenceFileList,
    authorizationFile: state.register.authorizationFile,
    uploadProps: state.app.uploadProps,
  };
}

export default connect(mapStateToProps, dispatchs('app', 'register'))(Credentials)
