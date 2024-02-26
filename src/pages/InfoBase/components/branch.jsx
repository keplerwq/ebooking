// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { FormEx2, message } from "src/components";
import { descriptor } from "src/libs";
import { Button, Empty, Upload, Input } from "antd";
import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";

const { Item } = FormEx2;
const telLength = 11;

class Branch extends Component {
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

    this.form.setValue(`subCompanyList[${index}].subLicenseFileData`, fileList);

    if (info.file.status === "done") {
      const responseData =
        (fileList[0] && fileList[0].response && fileList[0].response.data) ||
        {};
      this.form.setValue(name, responseData);
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

  addBranchItem = () => {
    let { branchKeys, branchUuid } = this.props;
    if (branchKeys && branchKeys.length >= 20) {
      return message.error("分公司信息到达上限", 3);
    }
    const { saveBranchKeys } = this.props.actions;
    const nextKeys = branchKeys.concat(branchUuid);
    branchUuid++;
    saveBranchKeys(nextKeys, branchUuid);
  };

  removeBranchItem = (k, index) => {
    let { branchKeys, branchUuid } = this.props;
    const { saveBranchKeys } = this.props.actions;
    if (saveBranchKeys.length === 1) {
      return;
    }
    saveBranchKeys(branchKeys.filter((key) => key !== k), branchUuid, () => {});
    if (this.form && this.form.getValue("subCompanyList")) {
      let branch = _.cloneDeep(this.form.getValue("subCompanyList"));
      branch.splice(index, 1);
      this.form.setValue("subCompanyList", branch);
    }
  };

  render() {
    const {
      updateForm = {},
      uploadProps = {},
      branchKeys = [],
      isEditing = false,
    } = this.props;
    const { subCompanyList = [] } = updateForm;
    return (
      <div id="sation-branch" className="ant-affix-content">
        <OpHeader
          clickMethod={() => this.addBranchItem()}
          name="分公司信息"
          isEditing={isEditing}
          buttonTitle="新增分公司"
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
            <table className="ant-table table-contact g-panel">
              <thead className="ant-table-thead">
                <tr>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      分公司名称
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      经营范围
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      详细地址
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      联系人姓名
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      联系人电话
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      联系人邮箱
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      营业执照扫描件
                    </div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {branchKeys && branchKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {branchKeys.map((k, index) =>
                    !isEditing ? (
                      <tr key={`${k}_${index}`}>
                        <td>
                          {_.get(subCompanyList[index], "subCompanyName", "")}
                        </td>
                        <td>
                          {_.get(subCompanyList[index], "subBizScope", "")}
                        </td>
                        <td>
                          {_.get(
                            subCompanyList[index],
                            "subCompanyAddress",
                            ""
                          )}
                        </td>
                        <td>
                          {_.get(subCompanyList[index], "subContactName", "")}
                        </td>
                        <td>{_.get(subCompanyList[index], "subMobile", "")}</td>
                        <td>
                          {_.get(subCompanyList[index], "subContactEmail", "")}
                        </td>
                        <td>
                          {_.get(
                            subCompanyList[index],
                            "subLicenseFile",
                            ""
                          ) ? (
                              <a
                                href={_.get(
                                  subCompanyList[index],
                                  "subLicenseFile",
                                  ""
                                )}
                                target="_blank"
                                download="营业执照扫描件"
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
                              dataIndex={`subCompanyList[${index}].subCompanyName`}
                              rules={[
                                {
                                  required: true,
                                  message: "分公司名称不得为空",
                                },
                              ]}
                              isTrim={true}
                              decorator={
                                <Input
                                  placeholder="请输入"
                                  // style={{ width: 230 }}
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
                              dataIndex={`subCompanyList[${index}].subBizScope`}
                              rules={[
                                { required: true, message: "经营范围不得为空" },
                              ]}
                              isTrim={true}
                              decorator={
                                <Input
                                  placeholder="请输入"
                                  // style={{ width: 230 }}
                                />
                              }
                            />
                          }
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`subCompanyList[${index}].subCompanyAddress`}
                            rules={[
                              { required: true, message: "详细地址不得为空" },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                placeholder="请输入"
                                // style={{ width: 230 }}
                              />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`subCompanyList[${index}].subContactName`}
                            rules={[
                              { required: true, message: "联系人姓名不得为空" },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                placeholder="请输入"
                                // style={{ width: 120 }}
                              />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`subCompanyList[${index}].subMobile`}
                            rules={[
                              { required: true, message: "联系人电话不得为空" },
                              descriptor.telephone,
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                maxLength={telLength}
                                placeholder="请输入"
                                // style={{ width: 120 }}
                              />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`subCompanyList[${index}].subContactEmail`}
                            rules={[
                              { required: true, message: "联系人邮箱不得为空" },
                              descriptor.email,
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                placeholder="请输入"
                                // style={{ width: 155 }}
                              />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`subCompanyList[${index}].subLicenseFile`}
                            rules={[
                              { required: true, message: "营业执照不得为空" },
                            ]}
                            decorator={
                              <div className="upload-body">
                                <div
                                  className={
                                    subCompanyList[index] &&
                                    subCompanyList[index].subLicenseFileData &&
                                    subCompanyList[index].subLicenseFileData
                                      .length >= 1
                                      ? "m-upload-wrapper m-upload-has-control"
                                      : "m-upload-wrapper"
                                  }
                                >
                                  <Upload
                                    {...uploadProps}
                                    fileList={
                                      (subCompanyList[index] &&
                                        subCompanyList[index]
                                          .subLicenseFileData) ||
                                      []
                                    }
                                    onChange={(...args) => {
                                      this.onUploadChange(
                                        index,
                                        `subCompanyList[${index}].subLicenseFile`,
                                        ...args
                                      );
                                    }}
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
                                  </Upload>
                                </div>
                              </div>
                            }
                          />
                        </td>
                        <td>
                          <a
                            className="u-form-link"
                            onClick={() => this.removeBranchItem(k, index)}
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
            {!(branchKeys && branchKeys.length >= 1) && (
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
    subLicenseFile: state.infoBase.subLicenseFile,
    branchKeys: state.infoBase.branchKeys,
    branchUuid: state.infoBase.branchUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Branch)