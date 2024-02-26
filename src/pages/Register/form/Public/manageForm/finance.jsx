// 近三年财务
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button,  Empty, Upload, message,Select,Card,InputNumber } from 'antd';
import { FormEx2 } from 'src/components';
import _ from 'lodash';
import '../management.scss';
import moment from 'moment';

const { Item } = FormEx2;
const { Option } = Select;

class Finance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
    }
  }

  componentDidMount() {
    const { financialKeys=[] } = this.props;
    // 至少有一条记录
    if (financialKeys.length === 0) {
      this.addFinanceItem();
    }
  }

  componentWillReceiveProps(props) {
    const { registerForm } = props;
    if (registerForm) {
      this.form && this.form.setValues(registerForm);
    }
  }

  onBeforeUpload = (file) => {
    console.log('file.type',file);
    const name = ((file.name).split(".")[1]) ==="rar" ||((file.name).split(".")[1]) ==="docx";
    console.log(name);
    const fileType =  file.type ==='application/pdf' || file.type==='application/x-zip-compressed'||file.type==='application/msword'||file.type ==='application/zip'||name;
    if (!fileType) {
      message.error('仅支持word/pdf/zip/rar文件!');
      return false;
    }
    if(file&(file.size > 50 * 1024)){
      message.error(`上传文件大小不得超过50M`,3);
      return false;
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
    console.log('fileList',fileList);

    this.form.setValue(`financialList[${index}].auditReportFileData`, fileList);

    saveFile(name, fileList);
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
      this.form.setValue(name, '');
    }
  }

  addFinanceItem=()=>{
    let { financialKeys, financialUuid } = this.props;
    const { saveFinancialKeys } = this.props.actions;
    const nextKeys = financialKeys.concat(financialUuid);
    financialUuid++;
    saveFinancialKeys(nextKeys, financialUuid);
  }

  removeFinanceItem = (k, index) => {
    const { financialKeys, financialUuid } = this.props;
    const { saveFinancialKeys } = this.props.actions;
    // if (credentialsKeys.length === 1) {
    //   return;
    // }
    saveFinancialKeys(financialKeys.filter(key => key !== k), financialUuid, () => {});

    let financial = _.cloneDeep(this.form.getValue('financialList'));
    // eslint-disable-next-line
    financial?financial.splice(index, 1):[];
    this.form.setValue('financialList', financial);
  }


  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  onFormChange = (values) => {
    console.log(values);
    const { freshForm } = this.props.actions;
    freshForm(values);
  }


  render() {

    const {
      registerForm,
      uploadProps,
      financialKeys=[],
    } = this.props;
    const {financialList=[]} = registerForm;
    const financialKeysLength = financialKeys.length;
    const yearList = [
      moment().format("YYYY年"),
      moment()
        .subtract(1, "years")
        .format("YYYY年"),
      moment()
        .subtract(2, "years")
        .format("YYYY年"),
      moment()
        .subtract(3, "years")
        .format("YYYY年"),
    ];
    console.log('yearList',yearList);

    return (

      <div className="u-form">
        <FormEx2

          defaultValues={registerForm}
          onSubmit={(values)=>{
            this.handleSubmit(values);
          }}
          onChange={(values)=>this.onFormChange(values)}
          ref={(f) => { this.form = f}}
        >

          <Card title="近3年财务信息" extra={<Button type="primary" ghost onClick={() => this.addFinanceItem()} >+新增财务信息</Button>} style={{width:1000}}   >

            <table className="ant-table table-bank" style={{display:financialKeysLength?"block":"none"}}>

              <thead className="ant-table-thead" >
                <tr style={{width:"100%"}}>
                  <th >报表年度<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >营业收入<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >实收资本<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >利润总额<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >年度财务审计报告<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >操作</th>
                </tr>
              </thead>
              {financialKeys&&financialKeys.length>=1 && (
                <tbody className="ant-table-tbody">
                  {financialKeys.map((k,index)=>(
                    <tr  key={index}>
                      <td style={{width:200}}>
                        {
                          <Item
                            label=""
                            dataIndex={`financialList[${index}].reportYear`}
                            rules={[{ required: true, message: '请选择' }]}
                            decorator={
                              <Select   placeholder="请选择">
                                {
                                  yearList.map((item,index)=>
                                    <Option value={item} key={index}>
                                      {item}
                                    </Option>
                                  )
                                }
                              </Select>
                            }
                          />
                        }
                      </td>
                      <td style={{width:220}}>
                        {
                          <Item
                            label=""
                            isTrim={true}
                            dataIndex={`financialList[${index}].bizIncome`}
                            rules={[{ required: true, message: '营业收入不得为空' },{min:0,max:99999999,type:"number",message:'注册资本不得超过8位'}]}
                            decorator={
                              <InputNumber  placeholder="请输入" style={{ width: 110 }} />

                            }
                          >
                            <span style={{marginLeft:10}} >万元</span>
                          </Item>
                        }
                      </td>
                      <td style={{width:220}}>
                        {
                          <Item
                            label=""
                            isTrim={true}
                            dataIndex={`financialList[${index}].paidInCapital`}
                            rules={[{ required: true, message: '实收资本不得为空' },{min:0,max:99999999,type:"number",message:'实收资本不得超过8位'}]}
                            decorator={
                              <InputNumber  placeholder="请输入" style={{ width: 110 }} />


                            }
                          >
                            <span style={{marginLeft:10}} >万元</span>
                          </Item>
                        }
                      </td>
                      <td style={{width:220}}>
                        <Item
                          label=""
                          isTrim={true}
                          dataIndex={`financialList[${index}].totalProfit`}
                          rules={[{ required: true, message: '利润总额不得为空' },{min:0,max:99999999,type:"number",message:'利润总额不得超过8位'}]}
                          decorator={
                            <InputNumber  placeholder="请输入" style={{ width: 110 }} />
                          }
                        >
                          <span style={{marginLeft:10}}>万元</span>
                        </Item>
                      </td>
                      <td  style={{width:250}}>
                        <Item
                          label=""
                          dataIndex={`financialList[${index}].auditReportFile`}
                          rules={[{ required: true, message: '财务审计报告不得为空' }]}
                          decorator={
                            <div className="upload-body">
                              <div className={
                                financialList[index]&&financialList[index].auditReportFileData&&
                financialList[index].auditReportFileData.length>=1?"m-upload-wrapper m-upload-has-control":"m-upload-wrapper"
                              }>
                                <Upload
                                  {...uploadProps}
                                  fileList={(financialList[index]&&financialList[index].auditReportFileData)||[]}
                                  onChange={ (...args) => { this.onUploadChange(index,`financialList[${index}].auditReportFile`, ...args) } }
                                  beforeUpload={this.onBeforeUpload}
                                  // accept=".zip"
                                >
                                  <Button type="primary" size="small" ghost >
                                    上传文件
                                  </Button>
                                </Upload>

                              </div>
                              <div className="u-upload-desc">
                                <p style={{fontSize:10,lineHeight:2,color:"#ccc"}}>支持word/pdf/zip/rar文件，不得超过50M</p>
                              </div>
                            </div>
                          }
                        />
                      </td>
                      <td style={{width:150}} >
                        <div style={{marginBottom:25}}>
                          { index !== 0 && <a onClick={()=>this.removeFinanceItem(k,index)} >删除</a> }
                        </div>
                      </td>
                    </tr>
                  ))
                  }
                </tbody>
              )}
            </table>
            {!(financialKeys && financialKeys.length >= 1) && (
              <Empty
                style={{ marginTop: "10px" }}
                description={<span>暂无数据 ，点击右上角按钮新增</span>}
              ></Empty>
            )}
          </Card>
        </FormEx2>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    uploadProps: state.app.uploadProps,
    financialKeys: state.register.financialKeys,
    financialUuid: state.register.financialUuid
  };
}


export default connect(mapStateToProps, dispatchs('app', 'register'), null, { forwardRef: true })(Finance)
