// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { Select } from "antd";
import { FormEx2, message } from "src/components";
import { Button, Empty, InputNumber, Upload } from "antd";
import OpHeader from "../baseComponents/OpHeader";
import moment from "moment";
import "../infoBase.scss";

const { Item } = FormEx2;
const { Option } = Select;

class Finance extends Component {
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
    if (file & (file.size > 100 * 1024)) {
      message.error(`上传文件大小不得超过100M`, 3);
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

    this.form.setValue(`financialList[${index}].auditReportFileData`, fileList);
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

  addFinanceItem = () => {
    console.log(111);
    let { financeKeys, financeUuid } = this.props;
    const { saveFinanceKeys } = this.props.actions;
    const nextKeys = financeKeys.concat(financeUuid);
    financeUuid++;
    saveFinanceKeys(nextKeys, financeUuid);
  };

  removeFinanceItem = (k, index) => {
    let { financeKeys, financeUuid } = this.props;
    const { saveFinanceKeys } = this.props.actions;
    if (financeKeys.length === 1) {
      return;
    }
    saveFinanceKeys(
      financeKeys.filter((key) => key !== k),
      financeUuid,
      () => {}
    );
    if (this.form && this.form.getValue("financialList")) {
      let financialList = _.cloneDeep(this.form.getValue("financialList"));
      financialList.splice(index, 1);
      this.form.setValue("financialList", financialList);
    }
  };
  render() {
    const {
      updateForm = {},
      isEditing = false,
      uploadProps = {},
      financeKeys = [],
    } = this.props;
    const { financialList = [] } = updateForm;
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
      <div className="ant-affix-content" id="sation-finance">
        <OpHeader
          clickMethod={() => this.addFinanceItem()}
          name="近3年财务信息"
          isEditing={isEditing}
          buttonTitle="新增财务信息"
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
            layout="inline"
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
                      报表年度
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      营业收入
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      实收资本
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      利润总额
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      所得税
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      资产合计
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      负债合计
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      所有者权益合计
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      年度财务审计报告
                    </div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {financeKeys && financeKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {financeKeys.map((k, index) =>
                    !isEditing ? (
                      <tr key={`${k}_${index}`}>
                        <td>{_.get(financialList[index], "reportYear", "")}</td>
                        <td>{_.get(financialList[index], "bizIncome", "")}</td>
                        <td>
                          {_.get(financialList[index], "actualPaidIn", "")}
                        </td>
                        <td>
                          {_.get(financialList[index], "totalProfit", "")}
                        </td>
                        <td>{_.get(financialList[index], "incomeTax", "")}</td>
                        <td>{_.get(financialList[index], "totalAsset", "")}</td>
                        <td>
                          {_.get(financialList[index], "totalLiability", "")}
                        </td>
                        <td>
                          {_.get(financialList[index], "totalOwnerEquity", "")}
                        </td>
                        <td>
                          {_.get(
                            financialList[index],
                            "auditReportFile",
                            ""
                          ) ? (
                              <a
                                href={_.get(
                                  financialList[index],
                                  "auditReportFile",
                                  ""
                                )}
                                target="_blank"
                                download="年度财务审计报告"
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
                              defaultValue={yearList[1]}
                              required
                              dataIndex={`financialList[${index}].reportYear`}
                              rules={[{ required: true, message: "不得为空" }]}
                              decorator={
                                <Select style={{ width: "110px" }}>
                                  {yearList.map((value) => (
                                    <Option value={value} key={value}>
                                      {value}
                                    </Option>
                                  ))}
                                </Select>
                              }
                            />
                          }
                        </td>
                        <td>
                          {
                            <span className="ant-input-affix-wrapper">
                              <Item
                                label=""
                                required
                                dataIndex={`financialList[${index}].bizIncome`}
                                rules={[
                                  { required: true, message: "不得为空" },
                                  {
                                    max: 99999999,
                                    type: "number",
                                    message: "不得超过8位",
                                  },
                                ]}
                                decorator={
                                  <InputNumber
                                    // style={{ width: "150px" }}
                                    placeholder="请输入"
                                  />
                                }
                              >
                                <span className="ant-input-suffix">万元</span>
                              </Item>
                            </span>
                          }
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`financialList[${index}].actualPaidIn`}
                              rules={[
                                { required: true, message: "不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  // style={{ width: "150px" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">万元</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`financialList[${index}].totalProfit`}
                              rules={[
                                { required: true, message: "不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  // style={{ width: "150px" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">万元</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`financialList[${index}].incomeTax`}
                              rules={[
                                { required: true, message: "不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  // style={{ width: "150px" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">万元</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`financialList[${index}].totalAsset`}
                              rules={[
                                { required: true, message: "不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  // style={{ width: "150px" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">万元</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`financialList[${index}].totalLiability`}
                              rules={[
                                { required: true, message: "不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  // style={{ width: "150px" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">万元</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`financialList[${index}].totalOwnerEquity`}
                              rules={[
                                { required: true, message: "不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  // style={{ width: "150px" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">万元</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            rules={[{ required: true, message: "不得为空" }]}
                            dataIndex={`financialList[${index}].auditReportFile`}
                            decorator={
                              <div className="upload-body">
                                <div
                                  className={
                                    financialList[index] &&
                                    financialList[index].auditReportFileData &&
                                    financialList[index].auditReportFileData
                                      .length >= 1
                                      ? "m-upload-wrapper m-upload-has-control"
                                      : "m-upload-wrapper"
                                  }
                                >
                                  <Upload
                                    {...uploadProps}
                                    fileList={
                                      (financialList[index] &&
                                        financialList[index]
                                          .auditReportFileData) ||
                                      []
                                    }
                                    onChange={(...args) => {
                                      this.onUploadChange(
                                        index,
                                        `financialList[${index}].auditReportFile`,
                                        ...args
                                      );
                                    }}
                                    accept=".zip,.rar,.pdf"
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
                            onClick={() => this.removeFinanceItem(k, index)}
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
            {!(financeKeys && financeKeys.length >= 1) && (
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
    financeKeys: state.infoBase.financeKeys,
    financeUuid: state.infoBase.financeUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Finance)