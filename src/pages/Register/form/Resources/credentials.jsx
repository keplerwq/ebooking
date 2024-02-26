// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Upload } from 'antd';
import { FormEx2, message } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import { regFormSubmit } from 'src/helps/regFormSubmit'
import './credentials.scss';
import uploadIcon from 'src/resource/img/upload-icon.png';

const { Item } = FormEx2;

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
      resourcesLicenceFileList
    } = this.props;
    if (resourcesLicenceFileList.length >= 5) {
      message.error(`最多上传5份`, 3);
      return false;
    }
  }

  onUploadChange = (name, info) => {
    const { saveFile } = this.props.actions;
    let fileList = name === 'resourcesLicenceFileList' ? info.fileList.slice(0, 5) : info.fileList.slice(-1);
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
      // this.form.setValue(name, name === 'resourcesLicenceFileList' ? value : fileList[0].response.data);
      this.form.setValue(name, name === 'resourcesLicenceFileList' ? value : fileList[0] && fileList[0].response && fileList[0].response.data);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, name === 'resourcesLicenceFileList' ? value : '');
    }
  }



  render() {

    const {
      registerForm,
      resourcesLicenceFileList,
      businessLicense,
      otherLicense,
      uploadProps,
      bankLicense,
      authorizationFile
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 14, offset: 1 },
    };

    const supplierType = _.get(registerForm, 'emailAccount.accountType', 1);

    return (

      <div className="m-credentials">

        <header>
          <h1 className="u-tt">资质信息</h1>
          <div className="u-subtt">填写公司资质信息，为我们以后的工作提供便利</div>
        </header>

        <div className="u-form">
          <FormEx2

            defaultValues={registerForm}
            onValidate={(status) => {
              this.setState({ formValidate: status });
            }}
            onSubmit={(values) => {
              this.handleSubmit(values);
            }}
            onChange={this.onFormChange}
            ref={(f) => { this.form = f }}
          >

            <Item
              {...formItemLayout}
              label="营业执照扫描件"

              colon={false}
              dataIndex="resourcesLicenceFileList"
            >
              {/*required*/}
              {/*rules={[{ required: true, message: '请上传营业执照扫描件' },]}*/}
              <div className="m-upload-wrapper">
                <Upload
                  {...uploadProps}
                  fileList={resourcesLicenceFileList}
                  onChange={(...args) => { this.onUploadChange('resourcesLicenceFileList', ...args) }}
                  beforeUpload={this.onBeforeUpload}
                >
                  <Button className="u-uploader">
                    {/* <Icon type="cloud-upload" style={{fontSize: '32px'}}/> */}
                    <img src={uploadIcon} alt="" />
                  </Button>
                </Upload>
                <div className="u-upload-desc">
                  <p>请上传营业执照扫描件</p>
                  <p>(非三证合一,可上传多个附件,最多5个)</p>
                </div>
              </div>
            </Item>

            {
              supplierType === 1 &&
              <Item
                {...formItemLayout}
                label="增值电信业务经营许可证"
                colon={false}
                dataIndex="businessLicense"
              >
                <div className="m-upload-wrapper">
                  <Upload
                    {...uploadProps}
                    fileList={businessLicense}
                    onChange={(...args) => { this.onUploadChange('businessLicense', ...args) }}
                  >
                    <Button className="u-uploader">
                      {/* <Icon type="cloud-upload" style={{fontSize: '32px', color: 'blue'}}/> */}
                      <img src={uploadIcon} alt="" />
                    </Button>
                  </Upload>
                  <div className="u-upload-desc u-one">
                    <p>请上传增值电信业务经营许可证</p>
                  </div>
                </div>
              </Item>
            }
            {
              supplierType === 1 &&
              <Item
                {...formItemLayout}
                label="开户银行许可证或公司账户声明"

                colon={false}
                dataIndex="bankLicense"
              >
                {/*required*/}
                {/*rules={[{ required: true, message: '请上传开户银行许可证或公司账户声明' },]}*/}
                <div className="m-upload-wrapper">
                  <Upload
                    {...uploadProps}
                    fileList={bankLicense}
                    onChange={(...args) => { this.onUploadChange('bankLicense', ...args) }}
                  >
                    <Button className="u-uploader">
                      {/* <Icon type="cloud-upload" style={{fontSize: '32px', color: 'blue'}}/> */}
                      <img src={uploadIcon} alt="" />
                    </Button>
                  </Upload>
                  <div className="u-upload-desc u-one">
                    <p>请上传开户银行许可证或公司账户声明</p>
                  </div>
                </div>
              </Item>
            }
            {
              supplierType === 2 &&
              <Item
                {...formItemLayout}
                label="授权证明扫描件"

                colon={false}
                dataIndex="authorizationFile"
              >
                <div className="m-upload-wrapper">
                  <Upload
                    {...uploadProps}
                    fileList={authorizationFile}
                    onChange={(...args) => { this.onUploadChange('authorizationFile', ...args) }}
                  >
                    <Button className="u-uploader">
                      <img src={uploadIcon} alt="" />
                    </Button>
                  </Upload>
                  <div className="u-upload-desc u-one">
                    <p>请上传授权证明扫描件</p>
                  </div>
                </div>
              </Item>
            }

            <Item
              {...formItemLayout}
              label="其他资质证明"
              colon={false}
              dataIndex="otherLicense"
            >
              <div className="m-upload-wrapper">
                <Upload
                  {...uploadProps}
                  fileList={otherLicense}
                  onChange={(...args) => { this.onUploadChange('otherLicense', ...args) }}
                >
                  <Button className="u-uploader">
                    {/* <Icon type="cloud-upload" style={{fontSize: '32px', color: 'blue'}}/> */}
                    <img src={uploadIcon} alt="" />
                  </Button>
                </Upload>
                <div className="u-upload-desc u-one">
                  <p>请上传其他资质证明</p>
                  <p>(若有多个文件，需压缩后上传)</p>
                </div>
              </div>
            </Item>


            <div className="u-next">
              <Button type="primary" htmlType="submit" >提交审核</Button>
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
    resourcesLicenceFileList: state.register.resourcesLicenceFileList,
    businessLicense: state.register.businessLicense,
    bankLicense: state.register.bankLicense,
    otherLicense: state.register.otherLicense,
    uploadProps: state.app.uploadProps,
    authorizationFile: state.register.authorizationFile,
  };
}

export default connect(mapStateToProps, dispatchs('app', 'register'))(Credentials)
