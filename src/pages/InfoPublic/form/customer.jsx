// 主要客户信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Select,Upload,Button,DatePicker,Empty,message} from 'antd';
import { FormEx2 } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';
import moment from "moment";

const { Item } = FormEx2;
const { Option } = Select;

const maxLength = 50;

class Customer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    }
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
    setEditStatus('customer', true);
  }

  addCustomerItem = () => {
    let { customerKeys, customerUuid } = this.props;
    const { saveCustomerKeys } = this.props.actions;
    const nextKeys = customerKeys.concat(customerUuid);
    customerUuid++;
    saveCustomerKeys(nextKeys, customerUuid);
  }

  removeCustomerItem = (k, index) => {
    const { customerKeys, customerUuid } = this.props;
    const { saveCustomerKeys } = this.props.actions;
    // if (bankKeys.length === 1) {
    //   return;
    // }
    saveCustomerKeys(customerKeys.filter(key => key !== k), customerUuid, () => {});

    let customer = _.cloneDeep(this.form.getValue('customerList'));
    customer.splice(index, 1);
    this.form.setValue('customerList', customer);
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
      message.error(`上传文件大小不得超过50M`);
      return false;
    }
  }
  onUploadChange = (index,name, info) => {

    const { saveFile } = this.props.actions;

    let fileList = info.fileList;
    fileList = fileList.slice(-1);

    fileList = fileList.filter((file) => {
      if (file.response) {
        // return file.response.errorCode === 0;
        return file.response.code == 0;
      }
      return true;
    });

    saveFile(name, fileList);
    this.form.setValue(`customerList[${index}].introduceFileData`, fileList);
    if (info.file.status === 'done') {
      const url = fileList[0].response.data;
      this.form.setValue(name, url);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, '');
    }
  }
  render() {
    const { updateForm = {}, isEditing = false, customerKeys = [],uploadProps } = this.props;
    const { status } = updateForm;
    const {customerList=[]}=updateForm;
    const canEdit = status !== 0;


    return (
      <div id="sation-customer">
        <FormEx2
          defaultValues={updateForm}
          onSubmit={(values) => { this.handleSubmit(values); }}
          onChange={(values) => { this.onFormChange(values) }}
          ref={(f) => { this.form = f }}
        >
          <OpHeader
            name="主要客户信息"
            canEdit={canEdit }
            isEditing={isEditing}
            clickMethod={() => this.addCustomerItem()}
            buttonTitle="新增客户信息"
          />
          <table className="ant-table table-bank">
            <thead className="ant-table-thead">
              <tr>
                <th><div>客户名称<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>客户服务开始时间<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>目前是否服务<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>客户服务介绍文案<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                {
                  isEditing && <th><div>操作</div></th>
                }
              </tr>
            </thead>
            {customerKeys&&customerKeys.length>=1&&(
              <tbody className="ant-table-tbody">
                {
                  customerKeys.map((k, index) => (
                    <tr key={index}>
                      <td style={{width:400}}>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`customerList[${index}].customerName`}
                            rules={[{ required: true, message: '请输入客户名称' }]}
                            decorator={
                              isEditing ?
                                <Input maxLength={maxLength} placeholder="请输入客户名称" style={{width:200}}/>
                                : <span>{_.get(updateForm, `customerList[${index}].customerName`, '')}</span>
                            }
                          />
                        }
                      </td>
                      <td style={{width:400}}>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`customerList[${index}].serveStart`}
                            rules={[{ required: true, message: '请选择客户服务开始时间' }]}
                            decorator={
                              isEditing ?
                                <DatePicker  format={"YYYY-MM-DD"} placeholder="请选择客户服务开始时间" style={{width:200}}/>
                                : <span>{moment(_.get(updateForm, `customerList[${index}].serveStart`, '')).format("YYYY-MM-DD")}</span>
                            }
                          />
                        }
                      </td>
                      <td style={{width:350}}>
                        {isEditing ?(
                          <Item
                            required
                            label=""
                            dataIndex={`customerList[${index}].onServe`}
                            rules={[{ required: true, message: '请选择' }]}
                            decorator={
                              <Select placeholder="请选择" style={{width:200}}>
                                <Option value={true}>是</Option>
                                <Option value={false}>否</Option>
                              </Select>
                            }
                          />)
                          :(
                            <span>{(_.get(updateForm, `customerList[${index}].onServe`, ''))?"是":"否"}</span>
                          )}

                      </td>


                      <td style={{width:400}}>
                        <Item
                          required
                          label=""
                          rules={[{ required: true, message: '请上传客户服务介绍文案' }]}
                          dataIndex={`customerList[${index}].introduceFile`}
                        >
                          {
                            isEditing ?
                              <div className={
                                customerList[index] &&
                                customerList[index].introduceFileData &&
                                customerList[index].introduceFileData.length >= 1
                                  ? "m-upload-wrapper m-upload-has-control"
                                  : "m-upload-wrapper"}>
                                <Upload
                                  {...uploadProps}
                                  fileList={(customerList[index]&&customerList[index].introduceFileData)||[]}
                                  onChange={(...args) => { this.onUploadChange(index,`customerList[${index}].introduceFile`, ...args) }}
                                  beforeUpload={this.onBeforeUpload}>
                                  <Button className="u-uploader">
                                    {/* <Icon type="cloud-upload" style={{ fontSize: '32px' }} /> */}
                                    <img src={uploadIcon} alt=""/>
                                  </Button>
                                </Upload>
                                <div className="u-upload-desc" style={{ top: 17 }}>
                                  <p>请上传客户服务介绍文案</p>
                                </div>
                              </div>
                              :
                              <span>
                                {_.get(updateForm, `customerList[${index}].introduceFile`, '') ?
                                  <a href={_.get(updateForm, `customerList[${index}].introduceFile`, '')} target="_blank" download="资质证书">  <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                                }
                              </span>
                          }
                        </Item>
                      </td>
                      {
                        isEditing &&
                    <td>
                      <a onClick={() => this.removeCustomerItem(k, index)}>删除</a>
                    </td>
                      }
                    </tr>
                  ))
                }
              </tbody>
            )}
          </table>
          {!(customerKeys && customerKeys.length >= 1) && (
            <Empty
              style={{ marginTop: "10px" }}
              description={<span >暂无数据 </span>}
            ></Empty>
          )}
        </FormEx2>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoPublic.updateForm,
    uploadProps: state.app.uploadProps,
    customerKeys: state.infoPublic.customerKeys,
    customerUuid: state.infoPublic.customerUuid
  };
}

export default connect(mapStateToProps, dispatchs('app', 'infoPublic'), null, { forwardRef: true })(Customer);
