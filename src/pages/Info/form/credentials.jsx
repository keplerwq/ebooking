// 资质信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Button, Row, Col,  Upload } from 'antd';
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
    if(updateForm){
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
    var suffix  = filePath.substring( filePath.lastIndexOf('.'), filePath.length );
    if (suffix.toLowerCase === 'pdf') {
      console.log('pdf')
    }
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
    setTimeout(()=>{
      iframe.remove();
    }, 5 * 60 * 1000);
  }


  /**
   * @function 下载营业执照
   */
  onDownloadLicence = () => {
    const { updateForm } = this.props;
    const licenceList = _.get(updateForm, 'qualification.licenceFileList', []);
    for(let i = 0; i < licenceList.length; i++) {
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
        sm: { span: 8 },
        xl: { span: 8},
        xxl: { span : 5},
      },
      wrapperCol: {
        sm: { span: 16 },
        xl: { span: 16},
        xxl: { span : 19},
      },
    };

    const { updateForm, licenceFileList, authorizationFile, uploadProps, isEditing=false } = this.props;
    const { status } = updateForm;
    const canEdit = status !== 0;

    return (
      <FormEx2
        defaultValues={updateForm}
        onSubmit={(values)=>{  this.handleSubmit(values);} }
        onChange={ (values) => { this.onFormChange(values) } }
        ref={(f) => { this.form = f}}
      >

        <OpHeader name="资质信息" isEditing={isEditing} onEdit={this.onEdit} canEdit={canEdit}/>

        <section className={`g-wrapper ${ !isEditing ? 's-edit' : '' }`}>
          <Row className="u-ct">
            <Col {...colLeft} >
              <Item
                {...formItemLayout}
                label="注册资金"
                dataIndex="qualification.registerMoney"
                decorator={
                  <span>{ _.get(updateForm, 'qualification.registerMoney', '') + '万元'}</span>
                }
              />
            </Col>
            <Col {...colRight} >
              <Item
                {...formItemLayout}
                label="工商注册地址"
                dataIndex="qualification.registerAddress"
                decorator={
                  <span>{ _.get(updateForm, 'qualification.registerAddress', '') }</span>
                }
              />
            </Col>
          </Row>
          <Row className="u-ct" >
            <Col {...colLeft}>
              <Item
                {...formItemLayout}
                label="营业执照扫描件"
                required
                dataIndex="licenceFileList"
                rules={[{ required: true, message: '请上传' }]}
              >
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload
                        {...uploadProps}
                        fileList={licenceFileList}
                        onChange={ (...args) => { this.onUploadChange('licenceFileList', ...args)  }}
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
                    :
                    <span>
                      { _.get(updateForm, 'qualification.licenceFileList', '') ?
                        <a onClick={this.onDownloadLicence} target="_blank" download="营业执照"> <img src={downloadIcon} alt=''/>下载附件 </a>  : <span>未上传</span>
                      }

                    </span>
                }
              </Item>
            </Col>
            <Col {...colRight}>

              <Item
                {...formItemLayout}
                label="授权证明扫描件"
                required
                dataIndex="authorizationFile"
                rules={[{ required: true, message: '请上传' },]}
              >
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload {...uploadProps} fileList={authorizationFile} onChange={ (...args) => { this.onUploadChange('authorizationFile', ...args)  } }>
                        <Button className="u-uploader">
                          {/* <Icon type="cloud-upload" style={{fontSize: '32px'}}/> */}
                          <img src={uploadIcon} alt=""/>
                        </Button>
                      </Upload>
                      <div className="u-upload-desc">
                        <p>请上传授权证明(仅用于证明贵公司与品牌方的合作)</p>
                        <p>多张授权证明:上传RAR、ZIP格式的压缩包均可</p>
                      </div>
                    </div>
                    :
                    <span>
                      { _.get(updateForm, 'qualification.authorizationFile', '') ?
                        <a href={ _.get(updateForm, 'qualification.authorizationFile', '') } target="_blank" download="授权证明"> <img src={downloadIcon} alt=''/>下载附件 </a>  : <span>未上传</span>
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
    updateForm: state.info.updateForm,
    licenceFileList: state.info.licenceFileList,
    invoiceFile: state.info.invoiceFile,
    authorizationFile: state.info.authorizationFile,
    uploadProps: state.app.uploadProps,
  };
}

export default connect(mapStateToProps, dispatchs('app', 'info'), null, {forwardRef: true})(Credentials)