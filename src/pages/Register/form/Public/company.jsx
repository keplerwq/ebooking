// 公司信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Select, message, Cascader, Row, Col,Empty,Upload,Card,DatePicker, Checkbox, InputNumber} from 'antd';
import { FormEx2, Address } from 'src/components';
import moment from 'moment';
import _ from 'lodash';
import './company.scss';


const { Item } = FormEx2;
const { Option } = Select;

const { RangePicker } = DatePicker;


const maxLength = 50;
const proveLength =100;

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false
    }
  }

  componentDidMount() {
    const { credentialsKeys=[] } = this.props;
    // '授权及特定资质证明' 至少有一条记录
    if (credentialsKeys.length === 0) {
      this.addCredentialsItem();
    }
  }

  componentWillReceiveProps(props) {
    const { registerForm } = props;
    if (registerForm) {
      this.form && this.form.setValues(registerForm);
    }
  }

  onBeforeUpload = (file) => {
    const fileType =  file.type === 'image/jpeg' || file.type === 'image/png';
    if (!fileType) {
      message.error('仅支持jpg/png文件!');
      return false;
    }
    if(file&(file.size > 50 * 1024)){
      message.error(`上传文件大小不得超过50M`);
      return false;
    }
  }
 onUploadChange1=(name,info)=>{
   const { saveFile } = this.props.actions;
   let fileList = info.fileList.slice(-1);
   fileList = fileList.filter((file) => {
     if (file.response) {
       return file.response.errorCode === 0 || file.response.code === '0';
     }
     return true;
   });
   saveFile(name, fileList);
   if (info.file.status !== 'uploading') {
     console.log(info.file, info.fileList);
   }
   if (info.file.status === 'done') {
     const url = fileList[0] && fileList[0].response && fileList[0].response.data;
     this.form.setValue(name, url);
     message.success(`${info.file.name} 上传成功`, 3);
   } else if (info.file.status === 'error') {
     message.error(`${info.file.name} 上传失败`, 3);
   } else if (info.file.status === 'removed') {
     this.form.setValue(name,  '');
   }
 }

  onUploadChange = (index,name, info) => {
    const { saveFile } = this.props.actions;
    let fileList = info.fileList.slice(-1);
    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.errorCode === 0 || file.response.code === '0';
      }
      return true;
    });
    saveFile(name, fileList);
    this.form.setValue(`credentialsInfoList[${index}].qualificationData`, fileList);

    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      // const url =fileList[0].response.data;
      const url = fileList[0] && fileList[0].response && fileList[0].response.data;
      this.form.setValue(name, url);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name,  '');
    }
  }

  addCredentialsItem = () => {
    let { credentialsKeys, credentialsUuid } = this.props;
    const { saveCredentialsKeys } = this.props.actions;
    const nextKeys = credentialsKeys.concat(credentialsUuid);
    credentialsUuid++;
    saveCredentialsKeys(nextKeys, credentialsUuid);
  }

  removeCredentialsItem = (k, index) => {
    const { credentialsKeys, credentialsUuid } = this.props;
    const { saveCredentialsKeys } = this.props.actions;
    saveCredentialsKeys(credentialsKeys.filter(key => key !== k), credentialsUuid, () => {});

    let credentials = _.cloneDeep(this.form.getValue('credentialsInfoList'));
    // eslint-disable-next-line
    credentials?credentials.splice(index, 1):[];
    this.form.setValue('credentialsInfoList', credentials);
  }


  disabledDate1=(current)=>{
    return current && current > moment().endOf('day');
  }
  disabledDate2=(current)=>{
    return current && current < moment().endOf('day');
  }


  handleSubmit = () => {
    const { changeStep } = this.props.actions;
    changeStep(24);

  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    if(values.qualification.check){
      values.qualification.licenseExpireTime=moment("9999-12-31");
      // const value1 = moment("9999-12-31");
      freshForm(values);
      // this.form.setValue('qualification.licenseExpireTime',value1);
    }else{
      freshForm(values);
    }
  }

  onChangecheck=(e)=>{
    const { freshForm } = this.props.actions;
    console.log(`checked = ${e.target.checked}`);
    if(e.target.checked){
      // eslint-disable-next-line
      values.qualification.licenseExpireTime=moment("9999-12-31");
      // eslint-disable-next-line
      freshForm(values);
    }
  }
  render() {

    const { registerForm, publiclicenseFile=[] , uploadProps,credentialsKeys=[] } = this.props;
    const {credentialsInfoList=[]}=registerForm;
    const credentialsKeysLength = credentialsKeys.length;
    const formItemLayout = {
      wrapperCol: { span: 22, offset: 0 },
    };


    return (

      <div className="m-public-company">

        <header>
          <h1 className="u-tt">公司信息</h1>
          <div className="u-subtt">请填写准确的公司及资质信息，方便我们进行信息审核</div>
        </header>

        <div className="u-form">
          <FormEx2
            layout="vertical"
            // labelAlign="left"
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
            <Card title="基本信息" extra={<div>标记<span style={{ color: "#ff4d4f" }}> * </span>的信息为必填项</div>}>

              <Row>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    label="公司名称"
                    isTrim={true}
                    required
                    colon={false}
                    dataIndex="company.companyName"
                    rules={[{ required: true, message: '请填写公司营业执照上名称' },]}
                    decorator={
                      <Input maxLength={maxLength} placeholder="请填写公司营业执照上名称" />
                    }
                  /></Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    label="业务范围"
                    required
                    colon={false}
                    dataIndex="company.bizScopes"
                    rules={[{required:true,message:"请选择公司经营业务范围"}]}
                    decorator={
                      <Select   mode="multiple" placeholder="请选择公司经营业务范围">
                        <Option value="办公用品">办公用品</Option>
                        <Option value="餐厅物资">餐厅物资</Option>
                        <Option value="工程物品">工程物品</Option>
                        <Option value="广告物料">广告物料</Option>
                        <Option value="行政服务">行政服务</Option>
                        <Option value="严选用品">严选用品</Option>
                      </Select>
                    }/>
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    label="公司地址"
                    required
                    colon={false}
                    dataIndex="company.areaArray"
                    rules={[{ required: true, message: '请选择省市区' }]}
                    decorator={
                      <Cascader options={Address} placeholder="省/市/区" />
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    label="详细地址"
                    required
                    colon={false}
                    isTrim={true}
                    dataIndex="company.companyAddress"
                    rules={[{ required: true, message: '请填写详细地址' },]}
                    decorator={
                      <Input maxLength={maxLength}  placeholder="详细地址：如道路、门牌号、单元室等" />
                    }
                  />
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    label="结算币种"
                    required
                    colon={false}
                    defaultValue="人民币"
                    dataIndex="company.settCurrency"
                    rules={[{required:true,message:"请选择结算币种"}]}
                    decorator={
                      <Select >
                        <Option value="人民币">人民币</Option>
                        <Option value="美元">美元</Option>
                        <Option value="港币">港币</Option>
                        <Option value="日元">日元</Option>
                        <Option value="欧元">欧元</Option>
                      </Select>
                    }>
                  </Item>
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="开户行"
                    required
                    isTrim={true}
                    rules={[{ required: true, message: '请输入公司开户银行名称' },]}
                    dataIndex="company.bankName"
                    decorator={
                      <Input maxLength={maxLength} placeholder="请输入公司开户银行名称" />
                    }
                  />
                </Col>

              </Row>
              <Row>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="户名"
                    required
                    isTrim={true}
                    rules={[{ required: true, message: '请输入公司银行户名' },]}
                    dataIndex="company.bankAccountName"
                    decorator={
                      <Input maxLength={maxLength} placeholder="请输入公司银行户名" />
                    }
                  />
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="银行账号"
                    required
                    isTrim={true}
                    rules={[{ required: true, message: '请输入公司银行账号' },]}
                    dataIndex="company.bankAccountId"
                    decorator={
                      <Input maxLength={maxLength} placeholder="请输入公司银行账号" />
                    }
                  />
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    label="供应级别"
                    required
                    colon={false}
                    dataIndex="company.companyType"
                    rules={[{required:true,message:"请选择供应级别"}]}
                    decorator={
                      <Select  placeholder="请选择供应级别">
                        <Option value={1}>原厂商</Option>
                        <Option value={2}>代理商</Option>
                        <Option value={0}>其他</Option>
                      </Select>
                    }>
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  {
                    _.get(registerForm, 'company.settCurrency', '') !== '人民币' &&
             (
               <Item
                 {...formItemLayout}
                 label="Bank Address"
                 required
                 colon={false}
                 dataIndex="company.bankAddress"
                 rules={[{ required: true, message: '请输入Bank Address' },]}
                 decorator={
                   <Input maxLength={maxLength} placeholder="请输入Bank Address" />
                 }
               />


             )
                  }
                </Col>
                {
                  _.get(registerForm, 'company.settCurrency', '') !== '人民币' &&
                (
                  <Col span={8}>
                    <Item
                      {...formItemLayout}
                      label="Swift Code"
                      required
                      colon={false}
                      dataIndex="company.swiftCode"
                      rules={[{ required: true, message: '请输入Swift Code' },]}
                      decorator={
                        <Input maxLength={maxLength} placeholder="请输入Swift Code" />
                      }
                    />
                  </Col>
                )
                }
              </Row>
            </Card>

            <Card title="营业执照信息"  style={{ width: 800,marginTop:20 }}>
              <Row>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="营业执照号"
                    required
                    isTrim={true}
                    rules={[{ required: true, message: '请填写营业执照号' },]}
                    dataIndex="qualification.licenseId"
                    decorator={
                      <Input maxLength={maxLength} placeholder="请填写营业执照号" />
                    }
                  />
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    isTrim={true}
                    label="纳税人识别号"
                    required
                    rules={[{ required: true, message: '纳税人识别号不得为空'},
                      {max:20,message:'纳税人识别号不得超过20位'}]}
                    dataIndex="qualification.taxerId"
                    decorator={
                      <Input placeholder="请输入企业纳税人识别号" style={{width:300}}/>
                    }
                  />


                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="法定代表人"
                    required
                    isTrim={true}
                    rules={[{ required: true, message: '请输入企业法定代表人姓名' },]}
                    dataIndex="qualification.legalRepresentative"
                    decorator={
                      <Input maxLength={maxLength} placeholder="请输入企业法定代表人姓名" />
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="公司注册日期"
                    required
                    rules={[{ required: true, message: '企业注册时间不得为空' },]}
                    dataIndex="qualification.companyRegisterTime"
                    decorator={
                      <DatePicker placeholder="请选择公司营业执照注册日期"  disabledDate={this.disabledDate1}  style={{width:270}} />
                    }
                  />
                </Col>
                <Col span={8}>
                  <Item

                    label="营业执照有效截止日期"
                    required>
                    <Item
                      // {...formItemLayout}
                      colon={false}
                      label=""
                      required
                      rules={[{ required: true, message: '营业执照有效截止日期不得为空' },]}
                      style={{
                        display:"inline-block",
                        width:"calc(100%-90px)",
                        marginRight:"5px"
                      }}
                      dataIndex="qualification.licenseExpireTime"
                      decorator={

                        <DatePicker
                          placeholder="请选择截止日期"
                          format={"YYYY-MM-DD"}
                          disabledDate={this.disabledDate2}
                          disabled={
                            _.get(registerForm,"qualification.check",false) === true
                          }
                        />

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
                        <Checkbox onChange={this.onChangecheck}>长期有效</Checkbox>
                      }
                    />
                  </Item>
                </Col>
                <Col span={8}>
                  <Item
                    {...formItemLayout}
                    colon={false}
                    label="注册资本"
                    required
                    isTrim={true}
                    rules={[{ required: true, message:'企业注册资本不得为空' },{min:0,max:9999999999,type:"number",message:'注册资本不得超过10位数字'}]}
                    dataIndex="qualification.registerMoney"
                    decorator={

                      <InputNumber  placeholder="请填写公司注册资本" style={{ width: 200 }} />
                    }>
                    <span style={{marginLeft:10}}>万元</span>
                  </Item>

                </Col>
              </Row>
              <Row>
                {/* <Col span={8}>
             <Item
              {...formItemLayout}
              colon={false}
              label="实缴资本"
              required
              rules={[{ required: true, message: '企业实缴资本不得为空' },{max:10,message:'注册资本不得超过10位'}]}
              dataIndex="qualification.paidInCapital"
              decorator={
                <div>
                <InputNumber  placeholder="请输入企业注册资本" style={{ width: 200 }} />
                <span style={{marginLeft:10}}>万元</span>
               </div>
              }>

            </Item>
             </Col> */}
                <Col span={8}>

                  <Item
                    {...formItemLayout}
                    label="营业执照扫描件"
                    required
                    colon={false}
                    dataIndex="publiclicenseFile"
                    rules={[{ required: true, message: '请上传营业执照扫描件' },]}
                    decorator={
                      <div className="upload-body">
                        <div className={
                          publiclicenseFile && publiclicenseFile.length >= 1
                            ? "m-upload-wrapper m-upload-has-control"
                            : "m-upload-wrapper"
                        }>
                          <Upload
                            {...uploadProps}
                            fileList={publiclicenseFile}
                            onChange={ (...args) => { this.onUploadChange1('publiclicenseFile', ...args) } }
                            accept=".jpg, .png"
                            beforeUpload={this.onBeforeUpload}
                          >
                            <Button type="primary" size="small" ghost style={{height:35}}>
                      上传文件
                            </Button>
                          </Upload>

                        </div>
                        <div className="u-upload-desc">
                          <p style={{lineHeight:3}}>支持jpg/png文件，不得大于50M</p>
                        </div>
                      </div>
                    }
                  />
                </Col>
              </Row>
            </Card>

            <Card title="授权及特定资质证明" extra={<Button type="primary" ghost onClick={() => this.addCredentialsItem()} >+新增证明</Button>} style={{ width: 800,marginTop:20  }}   >

              <table className="ant-table table-bank" style={{display:credentialsKeysLength?"block":"none"}}>

                <thead className="ant-table-thead" >
                  <tr style={{width:"100%"}}>
                    <th >证明名称<span style={{ color: "#ff4d4f" }}> *</span></th>
                    <th >证件编号<span style={{ color: "#ff4d4f" }}> *</span></th>
                    <th >发件机构名称<span style={{ color: "#ff4d4f" }}> *</span></th>
                    <th >证件有效时间<span style={{ color: "#ff4d4f" }}> *</span></th>
                    <th >证件扫描件<span style={{ color: "#ff4d4f" }}> *</span></th>
                    <th >操作</th>
                  </tr>
                </thead>
                {credentialsKeys && credentialsKeys.length >= 1 && (
                  <tbody className="ant-table-tbody">
                    {credentialsKeys.map((k,index)=>(
                      <tr  key={index}>
                        <td style={{width:250}}>
                          <Item
                            label=""
                            isTrim={true}
                            dataIndex={`credentialsInfoList[${index}].qualificationName`}
                            rules={[{ required: true, message: '证明名称不得为空' },{max:100,message:'证明名称不得超过100个字'}]}
                            decorator={

                              <Input maxLength={proveLength} placeholder="请输入" />

                            }
                          />
                        </td>
                        <td style={{width:250}}>
                          {
                            <Item
                              label=""
                              isTrim={true}
                              dataIndex={`credentialsInfoList[${index}].qualificationNo`}
                              rules={[{ required: true, message: '证明编号不得为空' },{max:100,message:'证件编号不得超过100个字符'}]}
                              decorator={

                                <Input maxLength={proveLength} placeholder="请输入" />

                              }
                            />
                          }
                        </td>
                        <td style={{width:250}}>
                          <Item
                            label=""
                            isTrim={true}
                            dataIndex={`credentialsInfoList[${index}].organizationName`}
                            rules={[{ required: true, message: '发件机构名称不得为空' },{type:'string',max:100,message:'发件结构名称不得超过100个字'}]}
                            decorator={

                              <Input maxLength={proveLength} placeholder="请输入" />

                            }
                          />
                        </td>

                        <td style={{width:350}}>
                          <Item
                            label=""
                            dataIndex={`credentialsInfoList[${index}].expireDate`}
                            rules={[{ required: true, message: '证明有效时间不得为空' }]}
                            decorator={
                              <RangePicker />
                            }
                          />
                        </td>
                        <td  style={{width:200}}>
                          <Item
                            label=""
                            dataIndex={`credentialsInfoList[${index}].qualificationFile`}
                            rules={[{ required: true, message: '证书扫描件不得为空' }]}
                            decorator={
                              <div className="upload-body1">
                                <div className={credentialsInfoList[index]&&credentialsInfoList[index].qualificationData&&
                credentialsInfoList[index].qualificationData.length>=1?"m-upload-wrapper m-upload-has-control":"m-upload-wrapper1"}>
                                  <Upload
                                    {...uploadProps}
                                    fileList={(credentialsInfoList[index]&&credentialsInfoList[index].qualificationData)||[]}
                                    onChange={ (...args) => { this.onUploadChange(index,`credentialsInfoList[${index}].qualificationFile`, ...args) } }
                                    accept=".jpg,.png"
                                    beforeUpload={this.onBeforeUpload}
                                  >
                                    <Button type="primary" size="small" ghost >
                          上传文件
                                    </Button>
                                  </Upload>

                                </div>
                                <div className="u-upload-desc1">
                                  <p style={{fontSize:10,lineHeight:2,color:"#ccc"}}>支持jpg/png文件，不得大于50M</p>
                                </div>
                              </div>
                            }
                          />
                        </td>

                        <td style={{width:150}} >
                          <div style={{marginBottom:25}}>
                            {index !== 0 && <a onClick={()=>this.removeCredentialsItem(k,index)} >删除</a>}
                          </div>
                        </td>
                      </tr>
                    ))
                    }
                  </tbody>
                )}
              </table>
              {!(credentialsKeys && credentialsKeys.length >= 1) && (
                <Empty
                  style={{ marginTop: "10px" }}
                  description={<span>暂无数据 ，点击右上角按钮新增</span>}
                ></Empty>
              )}

            </Card>

            <div className="u-next">
              <Button type="primary" htmlType="submit" >下一步</Button>
              {/* <Button  type="primary" htmlType="submit" >保存</Button>  */}
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
    publiclicenseFile: state.register.publiclicenseFile,
    uploadProps: state.app.uploadProps,
    credentialsKeys: state.register.credentialsKeys,
    credentialsUuid: state.register.credentialsUuid
  };
}


export default connect(mapStateToProps, dispatchs('app', 'register'))(Company)
