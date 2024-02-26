// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Card, DatePicker, Upload, Empty } from "antd";
import { FormEx2, message } from "src/components";
import _ from "lodash";
import "./case.scss";
import { realLength } from "src/libs/util";

const { Item } = FormEx2;
const { RangePicker } = DatePicker;

class Branch extends Component {
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

    this.form.setValue(`caseList[${index}].caseFileData`, fileList);
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

  addBranchItem = () => {
    let { caseKeys, caseUuid } = this.props;
    const { saveCaseKeys } = this.props.actions;
    const nextKeys = caseKeys.concat(caseUuid);
    caseUuid++;
    saveCaseKeys(nextKeys, caseUuid);
  };

  removeBranchItem = (k, index) => {
    let { caseKeys, caseUuid } = this.props;
    const { saveCaseKeys } = this.props.actions;
    if (saveCaseKeys.length === 1) {
      return;
    }
    saveCaseKeys(
      caseKeys.filter((key) => key !== k),
      caseUuid,
      () => {}
    );
    if (this.form && this.form.getValue("caseList")) {
      let branch = _.cloneDeep(this.form.getValue("caseList"));
      branch.splice(index, 1);
      this.form.setValue("caseList", branch);
    }
  };
  validLength = (rule, value, callback) => {
    if (value && realLength(value) > 60) {
      callback(false);
    } else {
      callback();
    }
  };
  render() {
    const { registerForm = {}, uploadProps = {}, caseKeys = [] } = this.props;
    const { caseList = [] } = registerForm;
    return (
      <div className="m-company-branch">
        <Card
          className="u-card"
          title="近3年案例情况"
          extra={
            <Button
              onClick={() => this.addBranchItem()}
              type="primary"
              size="small"
              ghost
              style={{ height: 30 }}
            >
              <PlusOutlined />
              新增案例
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
            ref={(f) => {
              this.form = f;
            }}
          >
            <table className="ant-table table-contact">
              <thead className="ant-table-thead">
                <tr>
                  <th>
                    <div className="ant-legacy-form-item-required">案例名称</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">案例时间</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">案例介绍文件</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">操作</div>
                  </th>
                </tr>
              </thead>

              {caseKeys && caseKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {caseKeys.map((k, index) => (
                    <tr key={k}>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`caseList[${index}].caseName`}
                            rules={[
                              { required: true, message: "案例名称不得为空" },
                              {
                                validator: this.validLength,
                                message: "案例名称不得为超过30个字",
                              },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                placeholder="请输入案例名称"
                                style={{ width: 313 }}
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
                            dataIndex={`caseList[${index}].caseDate`}
                            rules={[
                              { required: true, message: "案例日期不得为空" },
                            ]}
                            decorator={
                              <RangePicker
                                style={{ width: 282 }}
                                placeholder={["案例开始日期", "案例结束日期"]}
                              />
                            }
                          />
                        }
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`caseList[${index}].caseFile`}
                          rules={[{ required: true, message: "请输入" }]}
                          decorator={
                            <div className="upload-body">
                              <div
                                className={
                                  caseList[index] &&
                                  caseList[index].caseFileData &&
                                  caseList[index].caseFileData.length >= 1
                                    ? "m-upload-wrapper m-upload-has-control"
                                    : "m-upload-wrapper"
                                }
                              >
                                <Upload
                                  {...uploadProps}
                                  fileList={
                                    (caseList[index] &&
                                      caseList[index].caseFileData) ||
                                    []
                                  }
                                  onChange={(...args) => {
                                    this.onUploadChange(
                                      index,
                                      `caseList[${index}].caseFile`,
                                      ...args
                                    );
                                  }}
                                  accept=".docx, .pdf"
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
                                  <div className="u-upload-desc">
                                    <p>&nbsp;支持word、pdf文件，不得超过50M</p>
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
                          onClick={() => this.removeBranchItem(k, index)}
                        >
                          删除
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
            {!(caseKeys && caseKeys.length >= 1) && (
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
    caseKeys: state.register.caseKeys,
    caseUuid: state.register.caseUuid,
  };
};

export default connect(mapStateToProps, dispatchs("app", "register"), null, { forwardRef: true })(Branch)