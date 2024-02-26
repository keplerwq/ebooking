// 资质信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import moment from 'moment';
import { Button, Input, Row, Col,  Upload, DatePicker, InputNumber,Checkbox } from 'antd';
import { FormEx2, message, } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';

const { Item } = FormEx2;

const maxLength = 50;

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
    if(updateForm){
      this.form && this.form.setValues(updateForm);
    }
  }

  disabledDate2=(current)=>{
    return current && current < moment().endOf('day');
  }
  onFormChange = (values) => {
    // const { freshForm } = this.props.actions;
    // freshForm(values);
    const { freshForm } = this.props.actions;
    if(values.qualification.check){
      values.qualification.licenseExpireTime=moment("9999-12-31");
      freshForm(values);
    }else{
      freshForm(values);
    }
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


  onBeforeUpload = (file) => {
    if(file&(file.size > 50 * 1024)){
      message.error(`上传文件大小不得超过50M`);
      return false;
    }
  }

  onUploadChange = (name, info) => {
    const { saveFile } = this.props.actions;
    let fileList =  info.fileList.slice(-1);
    fileList = fileList.filter((file) => {
      if (file.response) {
        // return file.response.errorCode === 0;
        return file.response.code == 0;
      }
      return true;
    });

    saveFile(name, fileList);
    if (info.file.status !== 'uploading') {
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      const url =fileList[0].response.data;
      this.form.setValue(name, url);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name,  '');
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

    const { updateForm, licenseFile, uploadProps, isEditing=false } = this.props;
    const { status } = updateForm;
    const canEdit = status !== 0;

    return (
      <div id="sation-credentials">
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
                  label="营业执照"
                  rules={[{ required: true, message: '请填写营业执照号' }]}
                  dataIndex="qualification.licenseId"
                  decorator={
                    isEditing?
                      <Input maxLength={maxLength} placeholder="请输入营业执照号" />:
                      <span>{ _.get(updateForm, 'qualification.licenseId', '') }</span>
                  }
                />
              </Col>
              <Col {...colRight} >
                <Item
                  {...formItemLayout}
                  label="纳税人识别号"
                  dataIndex="qualification.taxerId"
                  rules={[{ required: true, message: '纳税人识别号不得为空'},{max:20,message:'纳税人识别号不得超过20位'}]}
                  decorator={
                    isEditing?
                      (
                        <Input placeholder="填写企业纳税人识别号" style={{width:310}}/>
                      )
                      :
                      <span>{ _.get(updateForm, 'qualification.taxerId', '') }</span>
                  }
                />
              </Col>
            </Row>
            <Row className="u-ct">
              <Col {...colLeft} >
                <Item
                  {...formItemLayout}
                  label="法定代表人"
                  dataIndex="qualification.legalRepresentative"
                  rules={[{ required: true, message: '请输入企业法定代表人姓名' }]}
                  decorator={
                    isEditing?
                      <Input maxLength={maxLength} placeholder="请输入法定代表人" />:
                      <span>{ _.get(updateForm, 'qualification.legalRepresentative', '') }</span>
                  }
                />
              </Col>
              <Col {...colRight} >
                <Item
                  {...formItemLayout}
                  label="公司注册日期"
                  rules={[{ required: true, message: '企业注册时间不得为空' }]}
                  dataIndex="qualification.companyRegisterTime"
                  decorator={
                    isEditing?
                      <DatePicker
                        format={"YYYY-MM-DD"}
                        placeholder="请选择公司注册日期" />:
                      <span>{moment(_.get(updateForm, 'qualification.companyRegisterTime'), '').format("YYYY-MM-DD")}</span>
                  }
                />
              </Col>
            </Row>
            <Row className="u-ct">
              <Col {...colLeft} >
                <Item
                  {...formItemLayout}
                  label="营业执照有效截止日期"
                >
                  <Item
                    // {...formItemLayout}
                    colon={false}
                    label=""
                    required
                    rules={[{ required: true, message: '营业执照有效截止日期不得为空' },]}
                    style={{
                      display:"inline-block",
                      width:"calc(100%-90px)",
                      marginRight:"10px"
                    }}
                    dataIndex="qualification.licenseExpireTime"
                    decorator={
                      isEditing?

                        <DatePicker
                          style={{width:200}}
                          placeholder="请选择截止日期"
                          format={"YYYY-MM-DD"}
                          disabledDate={this.disabledDate2}
                          disabled={
                            _.get(updateForm,"qualification.check",false) === true
                          }
                        />
                        :
                        <span style={{marginLeft:10}}>{ moment(_.get(updateForm, 'qualification.licenseExpireTime', '')).format("YYYY-MM-DD")}</span>
                    }
                  />
                  <Item
                    colon={false}
                    label=""
                    dataIndex="qualification.check"
                    style={{
                      display: "inline-block",
                      width: "90px",
                      height: "36px"
                    }}
                    decorator={
                      isEditing?
                        <Checkbox onChange={this.onChangecheck}>长期有效</Checkbox>:
                        <div></div>}
                  />
                </Item>
              </Col>
              <Col {...colRight} >
                {isEditing?(
                  <span>
                    <Item
                      {...formItemLayout}
                      label="注册资本"
                      rules={[{ required: true, message:'企业注册资本不得为空' },
                        {min:0,max:9999999999,type:"number",message:'注册资本不得超过10位'}]}
                      dataIndex="qualification.registerMoney"
                      decorator={
                        <InputNumber  style={{width:200}}  />}
                    >
                      <span style={{marginLeft:20}}>万元</span>
                    </Item>
                  </span>
                ):(
                  <Item
                    {...formItemLayout}
                    label="注册资本"
                    dataIndex="qualification.registerMoney"
                    decorator={
                      <span>{ _.get(updateForm, 'qualification.registerMoney', '') + '万元'}</span>
                    }
                  />)}
              </Col>
            </Row>
            <Row className="u-ct" >
              <Col {...colLeft}>
                <Item
                  {...formItemLayout}
                  label="营业执照扫描件"
                  dataIndex="licenseFile"
                  rules={[{ required: true, message: '请上传营业执照扫描件' }]}
                >
                  {
                    isEditing ?
                      <div className={licenseFile&&licenseFile.length>=1?"m-upload-wrapper m-upload-has-control"
                        : "m-upload-wrapper"}>
                        <Upload
                          {...uploadProps}
                          fileList={licenseFile}
                          onChange={ (...args) => { this.onUploadChange('licenseFile', ...args)  }}
                          accept=".jpg, .png"
                          beforeUpload={this.onBeforeUpload}
                        >
                          <Button className="u-uploader">
                            {/* <Icon type="cloud-upload" style={{fontSize: '32px'}}/> */}
                            <img src={uploadIcon} alt=""/>
                          </Button>
                        </Upload>
                        <div className="u-upload-desc">
                          <p style={{lineHeight:3}}>请上传营业执照扫描件</p>
                          {/* <p>(非三证合一,可上传多个附件,最多5个)</p> */}
                        </div>
                      </div>
                      :
                      <span>
                        { _.get(updateForm, 'licenseFile', '') ?
                          <a  href={_.get(updateForm, 'licenseFile', '')} target="_blank" download="营业执照"> <img src={downloadIcon} alt=''/>下载附件 </a>  : <span>未上传</span>
                        }

                      </span>
                  }
                </Item>
              </Col>
            </Row>
          </section>
        </FormEx2>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    updateForm: state.infoPublic.updateForm,
    licenseFile: state.infoPublic.licenseFile,
    uploadProps: state.app.uploadProps
  };
}


export default connect(
  mapStateToProps, dispatchs('app', 'infoPublic'), null, {forwardRef: true}
)(Credentials)