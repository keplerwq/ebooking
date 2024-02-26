// 近3年财务信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Select,Upload,Button,Empty,InputNumber,message} from 'antd';
import { FormEx2 } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';
import moment from 'moment';

const { Item } = FormEx2;
const { Option } = Select;

class Financial extends Component {
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
    setEditStatus('financial', true);
  }

  addFinancialItem = () => {
    let { financialKeys,financialUuid } = this.props;
    const { saveFinancialKeys } = this.props.actions;
    const nextKeys = financialKeys.concat(financialUuid);
    financialUuid++;
    saveFinancialKeys(nextKeys, financialUuid);
  }

  removeFinancialItem = (k, index) => {
    const { financialKeys,financialUuid } = this.props;
    const { saveFinancialKeys } = this.props.actions;
    // if (bankKeys.length === 1) {
    //   return;
    // }
    saveFinancialKeys(financialKeys.filter(key => key !== k), financialUuid, () => {});

    let financial = _.cloneDeep(this.form.getValue('financialList'));
    financial.splice(index, 1);
    this.form.setValue('financialList', financial);
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
    this.form.setValue(`financialList[${index}].auditReportFileData`, fileList);
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
    const { updateForm = {}, isEditing = false, financialKeys = [],uploadProps } = this.props;
    const { status } = updateForm;
    const {financialList=[]}=updateForm;
    const canEdit = status !== 0;
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

    return (
      <div id="sation-financial">
        <FormEx2
          defaultValues={updateForm}
          onSubmit={(values) => { this.handleSubmit(values); }}
          onChange={(values) => { this.onFormChange(values) }}
          ref={(f) => { this.form = f }}
        >
          <OpHeader
            name="近3年财务信息"
            canEdit={canEdit&& financialKeys.length < 10}
            isEditing={isEditing}
            clickMethod={() => this.addFinancialItem()}
            buttonTitle="新增财务信息"
          />
          <table className="ant-table table-bank">
            <thead className="ant-table-thead">
              <tr>
                <th><div>报表年度<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>营业收入<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>实收资本<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>利润总额<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>年度财务审计报告<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                {
                  isEditing && <th><div>操作</div></th>
                }
              </tr>
            </thead>
            {financialKeys&&financialKeys.length>=1&&(
              <tbody className="ant-table-tbody">
                {
                  financialKeys.map((k, index) => (
                    <tr key={index}>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`financialList[${index}].reportYear`}
                            rules={[{ required: true, message: '请选择' }]}
                            decorator={
                              isEditing ?
                                <Select placeholder="请选择报表年度" style={{width:120}}>
                                  {yearList.map((value) => <Option key={value} value={value}>{value}</Option>)}
                                </Select>
                                : <span>{_.get(updateForm, `financialList[${index}].reportYear`, '')}</span>
                            }
                          />
                        }
                      </td>
                      <td>
                        {isEditing?(
                          <Item
                            label=""
                            rules={[{ required: true, message:'营业收入不得为空' },{min:0,max:99999999,type:"number",message:'营业收入不得超过8位'}]}
                            dataIndex={`financialList[${index}].bizIncome`}
                            decorator={
                              <InputNumber  style={{width:150}}  />}
                          >
                            <span style={{marginLeft:5}}>万元</span>
                          </Item>):(
                          <Item
                            label=""
                            decorator={
                              <span>{ _.get(updateForm, `financialList[${index}].bizIncome`, '') + '万元'}</span>
                            }
                          />)}
                      </td>
                      <td>

                        {isEditing?(
                          <Item

                            label=""
                            rules={[{ required: true, message:'企业实缴资本不得为空' },{min:0,max:99999999,type:"number",message:'实缴资本不得超过8位'}]}
                            dataIndex={`financialList[${index}].paidInCapital`}
                            decorator={
                              <InputNumber  style={{width:150}}  />}
                          >
                            <span style={{marginLeft:5}}>万元</span>
                          </Item>):(
                          <Item
                            label=""
                            decorator={
                              <span>{ _.get(updateForm, `financialList[${index}].paidInCapital`, '') + '万元'}</span>
                            }
                          />)}
                      </td>
                      <td>
                        {isEditing?(
                          <Item
                            label=""
                            rules={[{ required: true, message:'利润总额不得为空' },{min:0,max:99999999,type:"number",message:'利润总额不得超过8位'}]}
                            dataIndex={`financialList[${index}].totalProfit`}
                            decorator={
                              <InputNumber  style={{width:150}}  />}
                          >
                            <span style={{marginLeft:5}}>万元</span>
                          </Item>):(
                          <Item
                            label=""
                            decorator={
                              <span>{ _.get(updateForm, `financialList[${index}].totalProfit`, '') + '万元'}</span>
                            }
                          />)}

                      </td>

                      <td>
                        <Item
                          required
                          rules={[{ required: true, message: '请上传年度财务审计报告' }]}
                          label=""
                          dataIndex={`financialList[${index}].auditReportFile`}
                        >
                          {
                            isEditing ?
                              <div className={
                                financialList[index] &&
                                financialList[index].auditReportFileData &&
                                  financialList[index].auditReportFileData.length >= 1
                                  ? "m-upload-wrapper m-upload-has-control"
                                  : "m-upload-wrapper"
                              }>
                                <Upload
                                  {...uploadProps}
                                  fileList={(financialList[index]&&financialList[index].auditReportFileData)||[]}
                                  onChange={(...args) => { this.onUploadChange(index,`financialList[${index}].auditReportFile`, ...args) }}
                                  beforeUpload={this.onBeforeUpload}>
                                  <Button className="u-uploader">
                                    {/* <Icon type="cloud-upload" style={{ fontSize: '32px' }} /> */}
                                    <img src={uploadIcon} alt=""/>
                                  </Button>
                                </Upload>
                                <div className="u-upload-desc" style={{ top: 17 }}>
                                  <p>请上传年度财务审计报告</p>
                                </div>
                              </div>
                              :
                              <span>
                                {_.get(updateForm, `financialList[${index}].auditReportFile`, '') ?
                                  <a href={_.get(updateForm, `financialList[${index}].auditReportFile`, '')} target="_blank" download="资质证书">  <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                                }
                              </span>
                          }
                        </Item>
                      </td>
                      {
                        isEditing &&
                    <td>
                      <a onClick={() => this.removeFinancialItem(k, index)}>删除</a>
                    </td>
                      }
                    </tr>
                  ))
                }
              </tbody>
            )}
          </table>
          {!(financialKeys && financialKeys.length >= 1) && (
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
    financialKeys: state.infoPublic.financialKeys,
    financialUuid: state.infoPublic.financialUuid
  };
}

export default connect(mapStateToProps, dispatchs('app', 'infoPublic'), null, { forwardRef: true })(Financial)