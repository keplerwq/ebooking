// 资质信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import moment from 'moment';
import { Button, Row, Col, Upload } from 'antd';
import { FormEx2, message, } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../Info.scss';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';

const { Item } = FormEx2;

class Credentials extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    }
  }


  componentWillReceiveProps(props) {
    const { updateForm } = props;
    // console.log(updateForm);
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
    this.setState({
      isEditing: false
    })

    this.props.hasSave && this.props.hasSave(true);

  }

  onEdit = () => {
    this.setState({
      isEditing: true
    });
    const { setEditStatus } = this.props.actions;
    setEditStatus('credentials', true);
  }

  viewFile = (filePath = '') => {
    var suffix = filePath.substring(filePath.lastIndexOf('.'), filePath.length);
    if (suffix.toLowerCase === 'pdf') {
      console.log('pdf')
    }
  }

  onBeforeUpload = () => {
    const {
      licenceFileList
    } = this.props;
    if (licenceFileList.length >= 5) {
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
      this.form.setValue(name, name === 'licenceFileList' ? value : fileList[0].response.data);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, name === 'licenceFileList' ? value : '');
    }
  }


  /**
   * @function 使用iframe下载
   * @params url {String}
   */
  downloadFile = (url) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none"; // 防止影响页面
    iframe.style.height = 0; // 防止影响页面
    iframe.src = url;
    document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
    // 5分钟之后删除（onload方法对于下载链接不起作用，就先抠脚一下吧）
    setTimeout(() => {
      iframe.remove();
    }, 5 * 60 * 1000);
  }


  /**
   * @function 下载营业执照
   */
  onDownloadLicence = () => {
    const { updateForm } = this.props;
    const licenceList = _.get(updateForm, 'qualification.licenceFileList', []);
    for (let i = 0; i < licenceList.length; i++) {
      this.downloadFile(licenceList[i]);
    }
  }



  render() {

    const colLeft = {
      span: 11,
    }
    const colRight = {
      span: 11,
      offset: 1,
    }
    const formItemLayout = {
      labelCol: {
        sm: { span: 11 },
        xl: { span: 11 },
        xxl: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 13 },
        xl: { span: 13 },
        xxl: { span: 16 },
      },
    };

    const { updateForm, licenceFileList, businessLicense, otherLicense, bankLicense, uploadProps, isEditing = false } = this.props;
    console.log(businessLicense);
    const { status } = updateForm;
    const canEdit = status !== 0;

    const time = _.get(updateForm, 'qualification.licenceValidity', moment());

    return (
      <FormEx2
        defaultValues={updateForm}
        onSubmit={(values) => { this.handleSubmit(values); }}
        onChange={(values) => { this.onFormChange(values) }}
        ref={(f) => { this.form = f }}
      >

        <OpHeader name="资质信息" isEditing={isEditing} onEdit={this.onEdit} canEdit={canEdit} />

        <section className={`g-wrapper ${!isEditing ? 's-edit' : ''}`}>
          <Row className="u-ct" >
            <Col {...colLeft}>
              <Item
                {...formItemLayout}
                label="营业执照扫描件"
                required
                dataIndex="licenceFileList"
                rules={[{ required: true, message: '请上传营业执照扫描件' }]}
              >
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload
                        {...uploadProps}
                        fileList={licenceFileList}
                        onChange={(...args) => { this.onUploadChange('licenceFileList', ...args) }}
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
                    :
                    <span>
                      {_.get(updateForm, 'qualification.licenceFileList', '') ?
                        <a onClick={this.onDownloadLicence} target="_blank" download="营业执照"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                      }

                    </span>
                }
              </Item>
            </Col>

            <Col {...colRight}>
              <Item
                {...formItemLayout}
                label="增值电信业务经营许可证"
                dataIndex="businessLicense"
              >
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload {...uploadProps} fileList={businessLicense} onChange={(...args) => { this.onUploadChange('businessLicense', ...args) }}>
                        <Button className="u-uploader">
                          {/* <Icon type="cloud-upload" style={{fontSize: '32px'}}/> */}
                          <img src={uploadIcon} alt="" />
                        </Button>
                      </Upload>
                      <div className="u-upload-desc">
                        <p>请上传增值电信业务经营许可证</p>
                      </div>
                    </div>
                    :
                    <span>
                      {_.get(updateForm, 'qualification.businessLicense', '') ?
                        <a href={_.get(updateForm, 'qualification.businessLicense', '')} target="_blank" download="经营许可证"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                      }
                    </span>
                }
              </Item>
            </Col>
          </Row>

          <Row className="u-ct">
            <Col {...colLeft}>
              <Item
                {...formItemLayout}
                label="其他资质证明"
                dataIndex="otherLicense"
              >
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload {...uploadProps} fileList={otherLicense} onChange={(...args) => { this.onUploadChange('otherLicense', ...args) }}>
                        <Button className="u-uploader">
                          <img src={uploadIcon} alt="" />
                        </Button>
                      </Upload>
                      <div className="u-upload-desc">
                        <p>请上传其他资质证明</p>
                        <p>(若有多个文件，需压缩后上传)</p>
                      </div>
                    </div>
                    :
                    <span>
                      {_.get(updateForm, 'qualification.otherLicense', '') ?
                        <a href={_.get(updateForm, 'qualification.otherLicense', '')} target="_blank" download="经营许可证"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                      }
                    </span>
                }
              </Item>
            </Col>
            <Col {...colRight} >
              <Item
                {...formItemLayout}
                label="开户银行许可证或公司账户声明"
                required
                dataIndex="bankLicense"
                rules={[{ required: true, message: '请上传开户银行许可证或公司账户声明' }]}
              >
                
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload {...uploadProps} fileList={bankLicense} onChange={(...args) => { this.onUploadChange('bankLicense', ...args) }}>
                        <Button className="u-uploader">
                          <img src={uploadIcon} alt="" />
                        </Button>
                      </Upload>
                      <div className="u-upload-desc">
                        <p>请上传开户银行许可证或公司账户声明</p>
                      </div>
                    </div>
                    :
                    <span>
                      {_.get(updateForm, 'qualification.bankLicense', '') ?
                        <a href={_.get(updateForm, 'qualification.bankLicense', '')} target="_blank" download="开户银行许可证或公司账户声明"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                      }
                    </span>
                }
              </Item>
            </Col>
          </Row>
        </section>
      </FormEx2>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoResources.updateForm,
    licenceFileList: state.infoResources.licenceFileList,
    businessLicense: state.infoResources.businessLicense,
    otherLicense: state.infoResources.otherLicense,
    bankLicense: state.infoResources.bankLicense,
    uploadProps: state.app.uploadProps,
  };
}


export default connect(mapStateToProps, dispatchs('app', 'infoResources'), null, { forwardRef: true })(Credentials)
