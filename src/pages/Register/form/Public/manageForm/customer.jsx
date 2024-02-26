// 客户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Empty, Upload, message,DatePicker,Select,Card} from 'antd';
import { FormEx2 } from 'src/components';
import _ from 'lodash';
import '../management.scss';
import moment from 'moment';

const { Item } = FormEx2;
const { Option } = Select;
const maxLength = 50;


class Customer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
    }
  }

  componentDidMount() {
    const { customerKeys=[] } = this.props;
    // 至少有一条记录
    if (customerKeys.length === 0) {
      this.addCustomerItem();
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

    this.form.setValue(`customerList[${index}].introduceFileData`, fileList);

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


  addCustomerItem=()=>{
    let { customerKeys,customerUuid } = this.props;
    const { saveCustomerKeys } = this.props.actions;
    const nextKeys = customerKeys.concat(customerUuid);
    customerUuid++;
    saveCustomerKeys(nextKeys, customerUuid);
  }

  removeCustomerItem = (k, index) => {
    const { customerKeys, customerUuid } = this.props;
    const { saveCustomerKeys } = this.props.actions;
    // if (credentialsKeys.length === 1) {
    //   return;
    // }
    saveCustomerKeys(customerKeys.filter(key => key !== k), customerUuid, () => {});

    let customer = _.cloneDeep(this.form.getValue('customerList'));
    // eslint-disable-next-line
    customer?customer.splice(index, 1):[];
    this.form.setValue('customerList', customer);
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
      customerKeys=[]
    } = this.props;
    const {customerList=[]} =registerForm;
    const customerKeysLength = customerKeys.length;
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
          <Card title="主要客户信息" extra={<Button type="primary" ghost onClick={() => this.addCustomerItem()} >+新增客户</Button>} style={{width:800,marginTop:20}}   >

            <table className="ant-table table-bank" style={{display:customerKeysLength?"block":"none"}}>

              <thead className="ant-table-thead" >
                <tr style={{width:"100%"}}>
                  <th >客户名称<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >客户服务开始时间<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >目前是否服务<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >客户服务介绍文件<span style={{ color: "#ff4d4f" }}> *</span></th>
                  <th >操作</th>
                </tr>
              </thead>
              {customerKeys&&customerKeys.length>=1 &&(
                <tbody className="ant-table-tbody">
                  {customerKeys.map((k,index)=>(
                    <tr  key={index}>
                      <td style={{width:250}}>
                        {
                          <Item
                            label=""
                            isTrim={true}
                            dataIndex={`customerList[${index}].customerName`}
                            rules={[{ required: true, message: '客户名称不得为空' },{type:'string',max:30,message:'客户名称不得超过30个字'}]}
                            decorator={
                              <Input maxLength={maxLength} placeholder="请输入客户名称" />
                            }
                          />
                        }
                      </td>
                      <td style={{width:250}}>
                        {
                          <Item
                            label=""
                            dataIndex={`customerList[${index}].serveStart`}
                            rules={[{ required: true, message: '客户服务开始时间不得为空' }]}
                            decorator={
                              <DatePicker format={"YYYY-MM-DD"} style={{width:200}} placeholder="请选择客户服务开始时间"/>
                            }
                          />
                        }
                      </td>


                      <td style={{width:200}}>
                        <Item
                          label=""
                          dataIndex={`customerList[${index}].onServe`}
                          rules={[{ required: true, message: '目前是否服务不得为空' }]}
                          decorator={
                            <Select   placeholder="请选择">
                              <Option value={1}>是</Option>
                              <Option value={0}>否</Option>
                            </Select>
                          }
                        />
                      </td>
                      <td  style={{width:300}}>
                        <Item
                          label=""
                          dataIndex={`customerList[${index}].introduceFile`}
                          rules={[{ required: true, message: '客户服务介绍文件不得为空' }]}
                          decorator={
                            <div className="upload-body">
                              <div className={customerList[index]?.introduceFileData?.length >= 1 ? "m-upload-wrapper m-upload-has-control" : "m-upload-wrapper"} >
                                <Upload
                                  {...uploadProps}
                                  fileList={(customerList[index]&&customerList[index].introduceFileData)||[]}
                                  onChange={ (...args) => { this.onUploadChange(index,`customerList[${index}].introduceFile`, ...args) } }
                                  beforeUpload={this.onBeforeUpload}
                                  // accept=".doc,.docx"
                                >
                                  <Button type="primary" size="small" ghost >
                                    上传文件
                                  </Button>
                                </Upload>

                              </div>
                              <div className="u-upload-desc1">
                                <p style={{fontSize:10,lineHeight:3,color:"#ccc"}}>支持word/pdf/zip/rar文件，不得超过50M</p>
                              </div>
                            </div>
                          }
                        />
                      </td>


                      <td style={{width:150}} >
                        <div style={{marginBottom:25}}>
                          {index !== 0 && <a onClick={()=>this.removeCustomerItem(k,index)} >删除</a>}
                        </div>

                      </td>

                    </tr>
                  ))
                  }
                </tbody>
              )}
            </table>
            {
              !(customerKeys&&customerKeys.length>=1)&&(
                <Empty
                  style={{ marginTop: "10px" }}
                  description={
                    <span>
          暂无数据 ，点击右上角按钮新增
                    </span>
                  }>

                </Empty>
              )
            }
          </Card>
        </FormEx2>
      </div>
    );
  }
}


const mapStateToProps = (state) => {

  return {
    registerForm: state.register.registerForm,
    uploadProps: state.app.uploadProps,
    customerKeys: state.register.customerKeys,
    customerUuid: state.register.customerUuid
  };
}


export default connect(
  mapStateToProps,
  dispatchs('app', 'register') ,
  null,
  { forwardRef: true }
)(Customer)
