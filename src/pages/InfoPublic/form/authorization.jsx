// 授权及特定资质证明
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Upload, Button, DatePicker, Empty} from 'antd';
import { message, FormEx2 } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';

const { Item } = FormEx2;
const { RangePicker } = DatePicker;

const maxLength = 50;
const bankLength = 30;

class Authorization extends Component {
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
    setEditStatus('authorization', true);
  }

  addAuthorItem = () => {
    let { authorKeys, authorUuid } = this.props;
    const { saveAuthorKeys } = this.props.actions;
    const nextKeys = authorKeys.concat(authorUuid);
    authorUuid++;
    saveAuthorKeys(nextKeys, authorUuid);
  }

  removeAuthorItem = (k, index) => {
    const { authorKeys, authorUuid } = this.props;
    const { saveAuthorKeys } = this.props.actions;
    // if (bankKeys.length === 1) {
    //   return;
    // }
    saveAuthorKeys(authorKeys.filter(key => key !== k), authorUuid, () => {});

    let authorization = _.cloneDeep(this.form.getValue('credentialsInfoList'));
    authorization.splice(index, 1);
    this.form.setValue('credentialsInfoList', authorization);
  }

  onBeforeUpload = (file) => {
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
    this.form.setValue(`credentialsInfoList[${index}].qualificationFileData`, fileList);
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
    const { updateForm = {}, isEditing = false, authorKeys = [],uploadProps } = this.props;
    const { status } = updateForm;
    const {credentialsInfoList=[]}=updateForm;
    const canEdit = status !== 0;

    return (
      <div id="sation-authorization">
        <FormEx2
          defaultValues={updateForm}
          onSubmit={(values) => { this.handleSubmit(values); }}
          onChange={(values) => { this.onFormChange(values) }}
          ref={(f) => { this.form = f }}
        >
          <OpHeader
            name="授权及特定资质证明"
            canEdit={canEdit && authorKeys.length < 10}
            isEditing={isEditing}
            clickMethod={() => this.addAuthorItem()}
            buttonTitle="新增授权及资质证明"
          />
          <table className="ant-table table-bank" >
            <thead className="ant-table-thead">
              <tr>
                <th><div>证明名称<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>证件编号<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>发件机构名称<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>证明有效时间<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>证书扫描件<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                {
                  isEditing && <th><div>操作</div></th>
                }
              </tr>
            </thead>
            {authorKeys&&authorKeys.length>= 1 &&(
              <tbody className="ant-table-tbody">
                {
                  authorKeys.map((k, index) => (
                    <tr key={index}>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`credentialsInfoList[${index}].qualificationName`}
                            rules={[{ required: true, message: '证明名称不得为空' },{type:'string',max:100,message:'证明名称不得超过100个字'}]}
                            decorator={
                              isEditing ?
                                <Input maxLength={maxLength} placeholder="请输入" />
                                : <span>{_.get(updateForm, `credentialsInfoList[${index}].qualificationName`, '')}</span>
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`credentialsInfoList[${index}].qualificationNo`}
                            rules={[{ required: true, message: '证明编号不得为空' },{type:'string',max:100,message:'证件编号不得超过100个字符'}]}
                            decorator={
                              isEditing ?
                                <Input maxLength={maxLength} placeholder="请输入" />
                                : <span>{_.get(updateForm, `credentialsInfoList[${index}].qualificationNo`, '')}</span>
                            }
                          />
                        }
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`credentialsInfoList[${index}].organizationName`}
                          rules={[{ required: true, message: '发件机构名称不得为空' },{type:'string',max:100,message:'发件结构名称不得超过100个字'}]}
                          decorator={
                            isEditing ?
                              <Input maxLength={bankLength} placeholder="请输入" />
                              : <span>{_.get(updateForm, `credentialsInfoList[${index}].organizationName`, '')}</span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          label=""
                          dataIndex={`credentialsInfoList[${index}].expireDate`}
                          rules={[{ required: true, message: '证明有效时间不得为空' }]}
                          decorator={
                            isEditing ?
                              <RangePicker />
                              : <span>{_.get(updateForm, `credentialsInfoList[${index}].expireTime`, '')}</span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          label=""
                          dataIndex={`credentialsInfoList[${index}].qualificationFile`}
                          rules={[{ required: true, message: '请上传' }]}
                        >
                          {
                            isEditing ?
                              <div className={
                                credentialsInfoList[index] &&
                                credentialsInfoList[index].qualificationFileData &&
                                credentialsInfoList[index].qualificationFileData.length >= 1
                                  ? "m-upload-wrapper m-upload-has-control"
                                  : "m-upload-wrapper"}>
                                <Upload
                                  {...uploadProps}
                                  fileList={(credentialsInfoList[index]&&credentialsInfoList[index].qualificationFileData)||[]}
                                  onChange={(...args) => { this.onUploadChange(index,`credentialsInfoList[${index}].qualificationFile`, ...args) }}
                                  beforeUpload={this.onBeforeUpload}>
                                  <Button className="u-uploader">
                                    {/* <Icon type="cloud-upload" style={{ fontSize: '32px' }} /> */}
                                    <img src={uploadIcon} alt=""/>
                                  </Button>
                                </Upload>
                                <div className="u-upload-desc" style={{ top: 17 }}>
                                  <p>请上传授权及特定资质证明扫描件</p>
                                </div>
                              </div>
                              :
                              <span>
                                {_.get(updateForm, `credentialsInfoList[${index}].qualificationFile`, '') ?
                                  <a href={_.get(updateForm, `credentialsInfoList[${index}].qualificationFile`, '')} target="_blank" download="资质证书"> <img src={downloadIcon} alt='' /> 下载附件 </a> : <span>未上传</span>
                                }
                              </span>
                          }
                        </Item>
                      </td>
                      {
                        isEditing &&
                    <td>
                      <a onClick={() => this.removeAuthorItem(k, index)}>删除</a>
                    </td>
                      }
                    </tr>
                  ))
                }
              </tbody>
            )}
          </table>
          {!(authorKeys && authorKeys.length >= 1) && (
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
    authorKeys: state.infoPublic.authorKeys,
    authorUuid: state.infoPublic.authorUuid
  };
}

export default connect(
  mapStateToProps, dispatchs('app', 'infoPublic'), null, { forwardRef: true }
)(Authorization)

