// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Select, Card, Upload, InputNumber, Empty } from "antd";
import moment from "moment";
import _ from "lodash";
import { FormEx2, message } from "src/components";
import "./finance.scss";

const { Item } = FormEx2;
const { Option } = Select;

class Finance extends Component {
  
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

    const type = file.name && file.name.split('.').pop() || ""
    if (!type.includes('zip') && !type.includes('rar') && !type.includes('pdf')) {
      message.error(`上传文件只支持zip、rar、pdf文件`, 3);
      return false
    }
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
    let { financeKeys, financeUuid } = this.props;
    const { saveFinanceKeys } = this.props.actions;
    const nextKeys = financeKeys.concat(financeUuid);
    financeUuid++;
    saveFinanceKeys(nextKeys, financeUuid);
  };

  removeFinanceItem = (k, index) => {
    let { financeKeys, financeUuid } = this.props;
    const { saveFinanceKeys } = this.props.actions;
    if (saveFinanceKeys.length === 1) {
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
      registerForm = {},
      uploadProps = {},
      financeKeys = [],
    } = this.props;
    const { financialList = [] } = registerForm;
    const yearList = [
      moment().format("YYYY"),
      moment()
        .subtract(1, "years")
        .format("YYYY"),
      moment()
        .subtract(2, "years")
        .format("YYYY"),
      moment()
        .subtract(3, "years")
        .format("YYYY"),
    ];
    console.log(yearList);
    return (
      <div className="m-company-authorization">
        <Card
          className="u-card"
          title="近3年财务信息"
          extra={
            <Button
              onClick={() => this.addFinanceItem()}
              type="primary"
              size="small"
              ghost
              style={{ height: 30 }}
            >
              <PlusOutlined />
              新增财务信息
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
                    <div className="ant-legacy-form-item-required">报表年度</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">营业收入</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">实收资本</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">利润总额</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">所得税</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">资产合计</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">负债合计</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">所有者权益合计</div>
                  </th>
                  <th>
                    <div>
                      <p>年度财务</p>
                      <p className="ant-legacy-form-item-required">审计报告</p>
                    </div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {financeKeys && financeKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {financeKeys.map((k, index) => (
                    <tr key={k}>
                      <td>
                        {
                          <Item
                            label=""
                            defaultValue={yearList[1]}
                            required
                            dataIndex={`financialList[${index}].reportYear`}
                            rules={[{ required: true, message: "不得为空" }]}
                            decorator={
                              <Select>
                                {yearList.map((value) => (
                                  <Option value={value} key={value}>
                                    {value}年
                                  </Option>
                                ))}
                              </Select>
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`financialList[${index}].bizIncome`}
                            rules={[
                              { required: true, message: "不得为空" },
                              { max: 8, message: "不得超过8位" },
                            ]}
                            decorator={
                              <span className="ant-input-affix-wrapper">
                                <InputNumber
                                  style={{ width: "110px" }}
                                  placeholder="请输入"
                                />
                                <span className="ant-input-suffix">万元</span>
                              </span>
                            }
                          />
                        }
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`financialList[${index}].actualPaidIn`}
                          rules={[
                            { required: true, message: "不得为空" },
                            { max: 8, message: "不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "110px" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">万元</span>
                            </span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`financialList[${index}].totalProfit`}
                          rules={[
                            { required: true, message: "不得为空" },
                            { max: 8, message: "不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "110px" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">万元</span>
                            </span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`financialList[${index}].incomeTax`}
                          rules={[
                            { required: true, message: "不得为空" },
                            { max: 8, message: "不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "110px" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">万元</span>
                            </span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`financialList[${index}].totalAsset`}
                          rules={[
                            { required: true, message: "不得为空" },
                            { max: 8, message: "不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "110px" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">万元</span>
                            </span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`financialList[${index}].totalLiability`}
                          rules={[
                            { required: true, message: "不得为空" },
                            { max: 8, message: "不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "110px" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">万元</span>
                            </span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`financialList[${index}].totalOwnerEquity`}
                          rules={[
                            { required: true, message: "不得为空" },
                            { max: 8, message: "不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "110px" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">万元</span>
                            </span>
                          }
                        />
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
                  ))}
                </tbody>
              )}
            </table>
            {!(financeKeys && financeKeys.length >= 1) && (
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
    financeKeys: state.register.financeKeys,
    financeUuid: state.register.financeUuid,
  };
};

export default connect(mapStateToProps, dispatchs("app", "register"), null, { forwardRef: true })(Finance)