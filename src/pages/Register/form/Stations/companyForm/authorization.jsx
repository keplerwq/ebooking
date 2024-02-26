// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Card, DatePicker, Upload, Empty } from "antd";
import { FormEx2, message } from "src/components";
import _ from "lodash";
import "./authorization.scss";

const { Item } = FormEx2;
const { RangePicker } = DatePicker;

class Authorization extends Component {
  
  componentWillReceiveProps(props) {
    const { registerForm } = props;
    if (registerForm) {
      this.form && this.form.setValues(registerForm);
    }
  }

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  onBeforeUpload = (file, fileList) => {
    if (file & (file.size > 50 * 1024)) {
      message.error(`上传文件大小不得超过50M`, 3);
      return false;
    }
    if (fileList.length >= 2) {
      message.error(`最多上传单份`, 3);
      return false;
    }
  };

  onUploadChange = (index, name, info) => {
    let fileList = info.fileList.slice(-1);

    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.errorCode === 0;
      }
      return true;
    });

    this.form.setValue(
      `credentialsInfoList[${index}].qualificationFileData`,
      fileList
    );

    if (info.file.status === "done") {
      const responseData =
        (fileList[0] && fileList[0].response && fileList[0].response.data) ||
        {};
      this.form.setValue(name, responseData);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === "removed") {
      this.form.setValue(name, "");
    }
  };

  onFormChange = (values) => {
    console.log(values);
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  addAuthItem = () => {
    let { authKeys, authUuid } = this.props;
    const { saveAuthKeys } = this.props.actions;
    const nextKeys = authKeys.concat(authUuid);
    authUuid++;
    saveAuthKeys(nextKeys, authUuid);
  };

  removeAuthItem = (k, index) => {
    let { authKeys, authUuid } = this.props;
    const { saveAuthKeys } = this.props.actions;
    if (saveAuthKeys.length === 1) {
      return;
    }
    saveAuthKeys(authKeys.filter((key) => key !== k), authUuid, () => {});
    if (this.form && this.form.getValue("credentialsInfoList")) {
      let auth = _.cloneDeep(this.form.getValue("credentialsInfoList"));
      auth.splice(index, 1);
      this.form.setValue("credentialsInfoList", auth);
    }
  };

  render() {
    const { registerForm = {}, uploadProps = {}, authKeys = [] } = this.props;
    const { credentialsInfoList = [] } = registerForm;
    return (
      <div className="m-sation-authorization">
        <Card
          className="u-card"
          title="授权及特定资质证明"
          extra={
            <Button
              onClick={() => this.addAuthItem()}
              type="primary"
              size="small"
              ghost
              style={{ height: 30 }}
            >
              <PlusOutlined />
              新增证明
            </Button>
          }
        >
          <FormEx2
            defaultValues={registerForm}
            onSubmit={(values) => {
              this.handleSubmit(values);
            }}
            onChange={(values) => {
              this.onFormChange(values);
            }}
            isTrim={true}
            ref={(f) => {
              this.form = f;
            }}
          >
            <table className="ant-table table-contact">
              <thead className="ant-table-thead">
                <tr>
                  <th>
                    <div className="ant-legacy-form-item-required">证明名称</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">证件编号</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">发件机构名称</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">证明有效时间</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">证书扫描件</div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {authKeys && authKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {authKeys.map((k, index) => (
                    <tr key={k}>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            isTrim={true}
                            dataIndex={`credentialsInfoList[${index}].qualificationName`}
                            rules={[
                              { required: true, message: "证明名称不得为空" },
                              { max: 100, message: "证明名称不得超过100个字" },
                            ]}
                            decorator={
                              <Input
                                placeholder="请输入"
                                style={{ width: 185 }}
                              />
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            isTrim={true}
                            dataIndex={`credentialsInfoList[${index}].qualificationNo`}
                            rules={[
                              { required: true, message: "证明编号不得为空" },
                              {
                                max: 100,
                                message: "证明编号不得超过100个字符",
                              },
                            ]}
                            decorator={
                              <Input
                                placeholder="请输入"
                                style={{ width: 120 }}
                              />
                            }
                          />
                        }
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          isTrim={true}
                          dataIndex={`credentialsInfoList[${index}].organizationName`}
                          rules={[
                            { required: true, message: "发件机构名称不得为空" },
                            {
                              max: 100,
                              message: "发件结构名称不得超过100个字",
                            },
                          ]}
                          decorator={
                            <Input
                              placeholder="请输入"
                              style={{ width: 185 }}
                            />
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`credentialsInfoList[${index}].expireDate`}
                          rules={[
                            { required: true, message: "证明有效时间不得为空" },
                          ]}
                          decorator={
                            <RangePicker
                              style={{ width: 225 }}
                              placeholder={["证明开始日期", "证明截止日期"]}
                            />
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`credentialsInfoList[${index}].qualificationFile`}
                          rules={[
                            { required: true, message: "证书扫描件不得为空" },
                          ]}
                          decorator={
                            <div className="upload-body">
                              <div
                                className={
                                  credentialsInfoList[index] &&
                                  credentialsInfoList[index]
                                    .qualificationFileData &&
                                  credentialsInfoList[index]
                                    .qualificationFileData.length >= 1
                                    ? "m-upload-wrapper m-upload-has-control"
                                    : "m-upload-wrapper"
                                }
                              >
                                <Upload
                                  {...uploadProps}
                                  fileList={
                                    (credentialsInfoList[index] &&
                                      credentialsInfoList[index]
                                        .qualificationFileData) ||
                                    []
                                  }
                                  onChange={(...args) => {
                                    this.onUploadChange(
                                      index,
                                      `credentialsInfoList[${index}].qualificationFile`,
                                      ...args
                                    );
                                  }}
                                  accept=".jpg, .png"
                                  beforeUpload={this.onBeforeUpload}
                                >
                                  <Button
                                    type="primary"
                                    size="small"
                                    ghost
                                    style={{ height: 30 }}
                                  >
                                    上传文件
                                  </Button>
                                  <div
                                    className="u-upload-desc"
                                    style={{ width: 210 }}
                                  >
                                    <p>&nbsp;支持jpg/png文件，不得大于50M</p>
                                  </div>
                                </Upload>
                              </div>
                            </div>
                          }
                        />
                      </td>
                      <td>
                        <a
                          className="u-form-link"
                          onClick={() => this.removeAuthItem(k, index)}
                        >
                          删除
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
            {!(authKeys && authKeys.length >= 1) && (
              <Empty
                style={{ marginTop: "10px" }}
                description={<span>暂无数据 ，点击右上角按钮新增</span>}
              ></Empty>
            )}
          </FormEx2>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    uploadProps: state.app.uploadProps,
    authKeys: state.register.authKeys,
    authUuid: state.register.authUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register"),
  null,
  { forwardRef: true }
)(Authorization)