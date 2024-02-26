
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Select, Row, Col, Upload, Button, Cascader, Table } from 'antd';
import { FormEx2, Address, message, } from 'src/components';
import OpHeader from '../components/OpHeader';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';
import '../Info.scss';

const { Option } = Select;
const { Item } = FormEx2;
const { TextArea } = Input;

const maxLength = 50;

const textareaSize = {
  minRows: 2,
  maxRows: 4
};

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    }
  }

  componentDidMount() {
    
  }

  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  onFormChange = (values) => {

    const { freshForm } = this.props.actions;
    freshForm(values);
  }


  onEdit = () => {
    this.setState({
      isEditing: true
    });
    const { setEditStatus } = this.props.actions;
    setEditStatus('company', true);
  }

  areaFilter = (obj) => {
    if (obj && obj !== 'null') return obj;
    return '';
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
      const responseData = fileList[0] && fileList[0].response  && fileList[0].response.data;
      this.form.setValue(name, name === 'licenceFileList' ? value : responseData);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      this.form.setValue(name, fileList);
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, name === 'licenceFileList' ? value : '');
    } else {
      this.form.setValue(name, fileList);
    }
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

  onBeforeUpload = () => {
    const {
      licenceFileList
    } = this.props;
    if (licenceFileList.length >= 5) {
      message.error(`最多上传5份`, 3);
      return false;
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
        sm: { span: 9 },
        xl: { span: 9 },
        xxl: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 15 },
        xl: { span: 15 },
        xxl: { span: 18 },
      },
    };

    const { updateForm = {}, isEditing = false, uploadProps, licenceFileList,
      businessLicense, bankLicense, otherLicense, authorizationFile } = this.props;
    const province = this.areaFilter(_.get(updateForm, 'company.areaArray[0]', ''));
    const city = this.areaFilter(_.get(updateForm, 'company.areaArray[1]', ''));
    const county = this.areaFilter(_.get(updateForm, 'company.areaArray[2]', ''));
    const companyAddress = _.get(updateForm, 'company.companyAddress', '');
    const country = _.get(updateForm, 'company.area.country', '');
    const addressFullName = country === 'china' ? `${province}${city}${county}${companyAddress}` : `${companyAddress}`;
    const supplierTypeMap = [ '通用', '资源类', '服务器及网络设备相关' ];
    const accountType = _.get(updateForm, 'accountType', 0);
    const supplierType = supplierTypeMap[_.get(updateForm, 'accountType', 0)];
    const companyTypeMap = [ '其他', '原厂商', '代理商'];
    const companyType = companyTypeMap[_.get(updateForm, 'company.companyType', 0)];
    const secondNameList = _.get(updateForm, 'secondNameList', []);
    // 隐藏默认生成的二级信息记录
    const dataSource = secondNameList.filter(ele => ele.secondName && ele.secondName !== '');
   
    const columns = [
      {
        title: '企业二级简称',
        dataIndex: 'secondName',
        key: 'secondName',
        render: (text, record) => {
          const secondName = _.get(record, 'secondName', '');
          const supplierType = _.get(record, 'supplierType', '')
          console.log()
          const value = (secondName === '') ? '' : ((supplierType === '' || accountType === 2) ? secondName : `${secondName}-${supplierType}` )

          return <span>{value}</span>
        }
      },
      { title: '业务类型', dataIndex: 'supplierType', key: 'supplierType' },
      { title: '二级简称联系人', dataIndex: 'contactNames', key: 'contactNames' },
      { title: '职务', dataIndex: 'contactPositions', key: 'contactPositions' },
      { title: '对接采购人员', dataIndex: 'dockingName', key: 'dockingName' },
    ]

    return (
      <FormEx2
        defaultValues={updateForm}
        onChange={(values) => { this.onFormChange(values) }}
        ref={(f) => { this.form = f }}
        layout="inline"
      >

        <OpHeader name="公司信息" />

        <section className={`g-wrapper ${!isEditing ? 's-edit' : ''}`}>
          <Row className="u-ct" >
            <Col {...colLeft} >
              <Item
                {...formItemLayout}
                required
                label="企业名称"
                dataIndex="company.companyName"
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请输入企业名称" />
                    : <span>{_.get(updateForm, 'company.companyName', '')}</span>
                }
              />

              {
                !isEditing ?
                  <Item
                    {...formItemLayout}
                    label="公司注册地址"
                    required
                    decorator={
                      <span>{addressFullName}</span>
                    }
                  /> :
                  <Col>
                    {
                      country === 'china' && <Item
                        {...formItemLayout}
                        label="注册地址"
                        required
                        dataIndex="company.areaArray"
                        rules={[{ required: true, message: '请选择省市区' },]}
                        decorator={
                          isEditing ? <Cascader options={Address} placeholder="省市区" /> : null
                        }
                      />
                    }
                    <Item
                      {...formItemLayout}
                      required
                      label="详细地址"
                      dataIndex="company.companyAddress"
                      rules={[{ required: true, message: '请填写详细地址' },]}
                      decorator={
                        <TextArea maxLength={maxLength} autoSize={textareaSize} placeholder="请填写详细地址，例如所在某某小区某某楼层等" />
                      }
                    />
                  </Col>
              }
              {/*非资源类*/}
              <Item
                {...formItemLayout}
                label="法定代表人"
                dataIndex="qualification.legalRepresentative"
                required
                rules={[{ required: true, message: '请输入法定代表人' },]}
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请输入法定代表人" /> : <span>{_.get(updateForm, 'qualification.legalRepresentative', '')}</span>
                }
              />

              <Item
                {...formItemLayout}
                label="营业执照扫描件"
                dataIndex="licenceFileList"
                // required
                // rules={[{ required: true, message: '请上传营业执照' },]}
                decorator={
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload
                        {...uploadProps}
                        fileList={licenceFileList}
                        onChange={(...args) => { this.onUploadChange('licenceFileList', ...args) }}
                        beforeUpload={this.onBeforeUpload}
                      >
                        <Button className="u-uploader">
                          <img src={uploadIcon} alt="" />
                        </Button>
                      </Upload>
                      <div className="u-upload-desc">
                        <p>请上传营业执照扫描件</p>
                        <p>(非三证合一,可上传多个附件,最多5个)</p>
                      </div>
                    </div> :
                    <span>
                      {_.get(updateForm, 'qualification.licenceFileList', []).length !== 0 ?
                        <a onClick={this.onDownloadLicence} target="_blank" download="营业执照"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                      }
                    </span>
                }
              />
              {
                <Item
                  {...formItemLayout}
                  label="其他资质证明"
                  dataIndex="otherLicense"
                  decorator={
                    isEditing ?
                      <div className="m-upload-wrapper">
                        <Upload
                          {...uploadProps}
                          fileList={otherLicense}
                          onChange={(...args) => { this.onUploadChange('otherLicense', ...args) }}>
                          <Button className="u-uploader">
                            <img src={uploadIcon} alt="" />
                          </Button>
                        </Upload>
                        <div className="u-upload-desc">
                          <p>请上传其他资质证明</p>
                          <p>(若有多个文件，需压缩后上传)</p>
                        </div>
                      </div> :
                      <span>
                        {_.get(updateForm, 'qualification.otherLicense', '') ?
                          <a href={_.get(updateForm, 'qualification.otherLicense', '')} target="_blank" download="其他资质证明"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                        }
                      </span>
                  }
                />
              }
            </Col>
            <Col {...colRight}>
              <Item
                {...formItemLayout}
                label="业务范围"
                dataIndex="accountType"
                rules={[{ required: true, message: '请选择业务范围' },]}
                decorator={<span>{supplierType}</span>}
              />

              <Item
                {...formItemLayout}
                label="供应级别"
                required
                rules={[{ required: true, message: '请选择供应级别' }]}
                dataIndex="company.companyType"
                decorator={
                  isEditing ?
                    <Select placeholder="请选择供应级别" >
                      {companyTypeMap.map((value, index) => <Option key={index} value={index}>{value}</Option>)}
                    </Select>                  
                    : <span>{companyType}</span>
                }
              />

              <Item
                {...formItemLayout}
                label="营业执照号"
                required
                dataIndex="qualification.licenceId"
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请输入营业执照号" />
                    : <span>{_.get(updateForm, 'qualification.licenceId', '')}</span>
                }
              />

              {
                supplierType === '资源类' ?
                  <Item
                    {...formItemLayout}
                    label="开户银行/公司账户声明"
                    dataIndex="bankLicense"
                    decorator={
                      isEditing ?
                        <div className="m-upload-wrapper">
                          <Upload {...uploadProps} fileList={bankLicense} onChange={(...args) => { this.onUploadChange('bankLicense', ...args) }}>
                            <Button className="u-uploader">
                              <img src={uploadIcon} alt="" />
                            </Button>
                          </Upload>
                          <div className="u-upload-desc">
                            <p>请上传开户银行许可证/公司账户声明</p>
                            <p>(若有多个文件，需压缩后上传)</p>
                          </div>
                        </div>
                        :
                        <span>
                          {_.get(updateForm, 'qualification.bankLicense', '') ?
                            <a href={_.get(updateForm, 'qualification.bankLicense', '')} target="_blank" download="授权证明扫描件"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                          }
                        </span>
                    }
                  />
                  :
                  <Item
                    {...formItemLayout}
                    label="授权证明扫描件"
                    dataIndex="authorizationFile"
                    decorator={
                      isEditing ?
                        <div className="m-upload-wrapper">
                          <Upload {...uploadProps} fileList={authorizationFile} onChange={(...args) => { this.onUploadChange('authorizationFile', ...args) }}>
                            <Button className="u-uploader">
                              <img src={uploadIcon} alt="" />
                            </Button>
                          </Upload>
                          <div className="u-upload-desc">
                            <p>请上传授权证明扫描件</p>
                            <p>(若有多个文件，需压缩后上传)</p>
                          </div>
                        </div>
                        :
                        <span>
                          {_.get(updateForm, 'qualification.authorizationFile', '') ?
                            <a href={_.get(updateForm, 'qualification.authorizationFile', '')} target="_blank" download="授权证明扫描件"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                          }
                        </span>
                    }
                  />
              }
              {
                supplierType === '资源类' &&
                <Item
                  {...formItemLayout}
                  label="增值电信业务经营许可证"
                  dataIndex="businessLicense"
                  decorator={
                    isEditing ?
                      <div className="m-upload-wrapper">
                        <Upload {...uploadProps} fileList={businessLicense} onChange={(...args) => { this.onUploadChange('businessLicense', ...args) }}>
                          <Button className="u-uploader">
                            <img src={uploadIcon} alt="" />
                          </Button>
                        </Upload>
                        <div className="u-upload-desc">
                          <p>请上传开户银行许可证/公司账户声明</p>
                          <p>(若有多个文件，需压缩后上传)</p>
                        </div>
                      </div>
                      :
                      <span>
                        {_.get(updateForm, 'qualification.businessLicense', '') ?
                          <a href={_.get(updateForm, 'qualification.businessLicense', '')} target="_blank" download="授权证明扫描件"> <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                        }
                      </span>
                  }
                />
              }
              {/* {
                country !== 'china' &&
                <Item
                  {...formItemLayout}
                  label="结算货币"
                  required
                  dataIndex="qualification.settCurrency"
                  rules={[{ required: true, message: '请选择结算货币' },]}
                  decorator={
                    isEditing ?
                      <Select placeholder="请选择结算货币" >
                        {currencyList.map((value) => <Option key={value} value={value}>{value}</Option>)}
                      </Select>
                      : <span>{_.get(updateForm, 'qualification.settCurrency', '')}</span>
                  }
                />
              } */}
            </Col>
          </Row>
        </section>
        {
          dataSource.length > 0 &&
          <section className="g-wrapper second-table" >
            <Table
              rowKey={record => record.id}
              columns={columns}
              dataSource={dataSource}
              pagination={false}
            />
          </section>
        }
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
    authorizationFile: state.infoResources.authorizationFile,
    uploadProps: state.app.uploadProps,
  };
}


export default connect(mapStateToProps, dispatchs('app', 'infoResources'), null, { forwardRef: true })(Company);