// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { Input } from "antd";
import { FormEx2, message } from "src/components";
import { Button, Empty, DatePicker, Upload } from "antd";
import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";

const { RangePicker } = DatePicker;
const { Item } = FormEx2;

class Authorization extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
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
    
    const {
      updateForm = {},
      uploadProps = {},
      authKeys,
      isEditing = false,
    } = this.props;
    const { credentialsInfoList = [] } = updateForm;

    return (
      <div id="sation-auth" className="ant-affix-content">
        <OpHeader
          clickMethod={() => this.addAuthItem()}
          name="授权及特定资质证明"
          isEditing={isEditing}
          buttonTitle="新增授权及资质证明"
        />
        <div className="g-panel">
          <FormEx2
            defaultValues={updateForm}
            onSubmit={(values) => {
              this.handleSubmit(values);
            }}
            onChange={(values) => {
              this.onFormChange(values);
            }}
            ref={(f) => {
              this.form = f;
            }}
          >
            <table className="ant-table table-contact">
              <thead className="ant-table-thead">
                <tr>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      证明名称
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      证件编号
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      发件机构名称
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      证明有效时间
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      证书扫描件
                    </div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {authKeys && authKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {authKeys.map((k, index) =>
                    !isEditing ? (
                      <tr key={`${k}_${index}`}>
                        <td>
                          {_.get(
                            credentialsInfoList[index],
                            "qualificationName",
                            ""
                          )}
                        </td>
                        <td>
                          {_.get(
                            credentialsInfoList[index],
                            "qualificationNo",
                            ""
                          )}
                        </td>
                        <td>
                          {_.get(
                            credentialsInfoList[index],
                            "organizationName",
                            ""
                          )}
                        </td>
                        <td>
                          {_.get(credentialsInfoList[index], "expireTime", "")}
                        </td>

                        <td>
                          {_.get(
                            credentialsInfoList[index],
                            "qualificationFile",
                            ""
                          ) ? (
                              <a
                                href={_.get(
                                  credentialsInfoList[index],
                                  "qualificationFile",
                                  ""
                                )}
                                target="_blank"
                                download="资质证书扫描件"
                              >
                                {/* <img src={downloadIcon} alt="" /> */}
                              下载附件
                              </a>
                            ) : (
                              <span>未上传</span>
                            )}
                        </td>
                        <td></td>
                      </tr>
                    ) : (
                      <tr key={`${k}_${index}`}>
                        <td>
                          {
                            <Item
                              label=""
                              required
                              dataIndex={`credentialsInfoList[${index}].qualificationName`}
                              rules={[
                                { required: true, message: "证明名称不得为空" },
                                {
                                  max: 100,
                                  message: "证明名称不得超过100个字",
                                },
                              ]}
                              isTrim={true}
                              // style={{ width: 195 }}
                              decorator={<Input placeholder="请输入" />}
                            />
                          }
                        </td>
                        <td>
                          {
                            <Item
                              label=""
                              required
                              dataIndex={`credentialsInfoList[${index}].qualificationNo`}
                              rules={[
                                { required: true, message: "证明编号不得为空" },
                                {
                                  max: 100,
                                  message: "证明编号不得超过100个字符",
                                },
                              ]}
                              // style={{ width: 195 }}
                              isTrim={true}
                              decorator={<Input placeholder="请输入" />}
                            />
                          }
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`credentialsInfoList[${index}].organizationName`}
                            rules={[
                              {
                                required: true,
                                message: "发件机构名称不得为空",
                              },
                              {
                                max: 100,
                                message: "发件结构名称不得超过100个字",
                              },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                placeholder="请输入"
                                // style={{ width: 195 }}
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
                              {
                                required: true,
                                message: "证明有效时间不得为空",
                              },
                            ]}
                            decorator={
                              <RangePicker
                                // style={{ width: 245 }}
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
                                      // style={{ width: 210 }}
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
                    )
                  )}
                </tbody>
              )}
            </table>
            {!(authKeys && authKeys.length >= 1) && (
              <Empty
                style={{ marginTop: "10px" }}
                description={<span>暂无数据</span>}
              ></Empty>
            )}
          </FormEx2>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoBase.updateForm,
    uploadProps: state.app.uploadProps,
    authKeys: state.infoBase.authKeys,
    authUuid: state.infoBase.authUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Authorization);
