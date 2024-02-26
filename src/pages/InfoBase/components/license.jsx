// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { FormEx2, Address, message } from "src/components";
import {
  Button,
  Input,
  Col,
  Row,
  Cascader,
  Upload,
  DatePicker,
  Checkbox,
  InputNumber,
} from "antd";
import downloadIcon from "src/resource/img/info/download.png";
import moment from "moment";
import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";
import { realLength } from "src/libs/util";

const { Item } = FormEx2;

class License extends Component {
  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

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

  onUploadChange = (name, info) => {
    const { saveFile } = this.props.actions;
    let fileList = info.fileList.slice(-1);

    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.errorCode === 0;
      }
      return true;
    });

    saveFile(name, fileList);

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
    values.qualification.check &&
      (values.qualification.licenseExpireTime = moment("9999-12-31"));
    freshForm(values);
  };

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };
  validLength = (rule, value, callback) => {
    if (value && realLength(value) > 40) {
      callback(new Error("登记机关不得超过20个汉字"));
    } else {
      callback();
    }
  };
  disabledAfterDate = (current) => {
    return current && current > moment().endOf("day");
  };
  disabledBeforeDate = (current) => {
    return current && current < moment().endOf("day");
  };
  render() {
    const colLeft = {
      span: 5,
    };
    const colRight = {
      span: 19,
    };
    const col = {
      span: 12,
    };
    const formItemLayout = {
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 17,
      },
    };
    const {
      isEditing = false,
      updateForm = {},
      uploadProps = {},
      licenseFile = [],
    } = this.props;
    const qualification = _.get(updateForm, "qualification", {});

    let licenseExpireTime = _.get(qualification, "licenseExpireTime", "");
    let registerTime = _.get(qualification, "registerTime", "");
    licenseExpireTime = moment(licenseExpireTime).format("YYYY-MM-DD") || "";
    registerTime = moment(registerTime).format("YYYY-MM-DD") || "";

    const registrationOrganAreaArray = _.get(
      qualification,
      "registrationOrganAreaArray",
      []
    );
    const registrationOrganArea =
      (registrationOrganAreaArray && registrationOrganAreaArray.join("")) || "";

    return (
      <div id="sation-license" className="ant-affix-content">
        <OpHeader name="营业执照信息" />
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
            <section className={`g-wrapper ${!isEditing ? "s-edit" : ""}`}>
              <Row className="u-ct g-wrapper">
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="统一社会信用代码"
                      required
                      colon={false}
                      dataIndex="qualification.creditCode"
                      rules={[
                        {
                          required: true,
                          message: "统一社会信用代码不得为空",
                        },
                        {
                          max: 50,
                          message: "统一社会信用代码不得超过50个字符",
                        },
                      ]}
                      isTrim={true}
                      decorator={<Input placeholder="请填写统一信用代码" />}
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>统一社会信用代码：</Col>
                      <Col {...colRight}>
                        {_.get(qualification, "creditCode", "")}
                      </Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="登记机关"
                      colon={false}
                      required
                      dataIndex="qualification.registrationOrgan"
                      rules={[
                        {
                          required: true,
                          message: "登记机关不得为空",
                        },
                        {
                          validator: this.validLength,
                          message: "登记机关不得超过20个汉字",
                        },
                      ]}
                      isTrim={true}
                      decorator={<Input placeholder="请填写登记机关" />}
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>登记机关：</Col>
                      <Col {...colRight}>
                        {_.get(qualification, "registrationOrgan", "")}
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>

              <Row className="u-ct g-wrapper">
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="营业执照登记机关所在地"
                      required
                      colon={false}
                      dataIndex="qualification.registrationOrganAreaArray"
                      rules={[{ required: true, message: "请选择省市区" }]}
                      decorator={
                        // style={{width: "477px"}}
                        <Cascader options={Address} placeholder="省/市/区" />
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>营业执照所在地：</Col>
                      <Col {...colRight}>{registrationOrganArea}</Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  <Row>
                    {isEditing ? (
                      <Item
                        {...formItemLayout}
                        className="u-data-item"
                        label="登记日期"
                        required
                        colon={false}
                        dataIndex="qualification.registerTime"
                        rules={[
                          { required: true, message: "登记日期不得为空" },
                        ]}
                        decorator={
                          <DatePicker
                            showToday={false}
                            format={"YYYY-MM-DD"}
                            disabledDate={this.disabledAfterDate}
                            placeholder="请选择公司营业执照登记日期"
                          />
                        }
                      />
                    ) : (
                      <Row>
                        <Col {...colLeft}>登记日期：</Col>
                        <Col {...colRight}>{registerTime}</Col>
                      </Row>
                    )}
                  </Row>
                </Col>
              </Row>

              <Row className="u-ct g-wrapper">
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      className="u-form-group"
                      style={{ marginBottom: 0 }}
                      required
                      label="营业执照有效截止日期"
                    >
                      <Col {...col}>
                        <Item
                          colon={false}
                          label=""
                          required
                          dataIndex="qualification.licenseExpireTime"
                          rules={[
                            {
                              required: true,
                              message: "营业执照有效截止日期不得为空",
                            },
                          ]}
                          style={{
                            display: "inline-block",
                            // width: "calc(100% - 106px)",
                            marginRight: "16px",
                          }}
                          decorator={
                            <DatePicker
                              style={{ width: "100%" }}
                              showToday={false}
                              disabledDate={this.disabledBeforeDate}
                              format={"YYYY-MM-DD"}
                              placeholder="请选择截止日期"
                              disabled={
                                _.get(
                                  updateForm,
                                  "qualification.check",
                                  false
                                ) === true
                              }
                            />
                          }
                        />
                        <Item
                          colon={false}
                          label=""
                          dataIndex="qualification.check"
                          style={{
                            display: "inline-block",
                            width: "90px",
                            height: "36px",
                          }}
                          // decorator={<Checkbox>长期有效</Checkbox>}
                          decorator={<Checkbox checked={qualification.check}>长期有效</Checkbox>}
                        />
                      </Col>
                    </Item>
                  ) : (
                    <Row>
                      <Col {...colLeft}>营业执照有效截止日期：</Col>
                      <Col {...colRight}>{licenseExpireTime}</Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  <Row>
                    {isEditing ? (
                      <span className="ant-input-affix-wrapper">
                        <Item
                          {...formItemLayout}
                          label="注册资本"
                          required
                          colon={false}
                          dataIndex="qualification.registerMoney"
                          rules={[
                            { required: true, message: "注册资本不得为空" },
                            {
                              max: 99999999,
                              type: "number",
                              message: "注册资本不得超过8位",
                            },
                          ]}
                          decorator={
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="请填写公司注册资本"
                            />
                          }
                        >
                          <span className="ant-input-suffix">万元</span>
                        </Item>
                      </span>
                    ) : (
                      <Row>
                        <Col {...colLeft}>注册资本：</Col>
                        <Col {...colRight}>
                          {_.get(qualification, "registerMoney", "")}
                        </Col>
                      </Row>
                    )}
                  </Row>
                </Col>
              </Row>
              <Row className="u-ct g-wrapper">
                <Col {...col}>
                  <Row>
                    {isEditing ? (
                      <Item
                        {...formItemLayout}
                        label="营业执照扫描件"
                        required
                        colon={false}
                        dataIndex="licenseFile"
                        rules={[
                          { required: true, message: "营业执照扫描件不得为空" },
                        ]}
                        decorator={
                          <div className="upload-body">
                            <div
                              className={
                                licenseFile && licenseFile.length >= 1
                                  ? "m-upload-wrapper m-upload-has-control"
                                  : "m-upload-wrapper"
                              }
                            >
                              <Upload
                                {...uploadProps}
                                fileList={licenseFile}
                                onChange={(...args) => {
                                  this.onUploadChange("licenseFile", ...args);
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
                                <div className="u-upload-desc">
                                  <p>&nbsp;支持jpg/png文件，不得大于50M</p>
                                </div>
                              </Upload>
                            </div>
                          </div>
                        }
                      />
                    ) : (
                      <Row>
                        <Col {...colLeft}>营业执照扫描件：</Col>
                        <Col {...colRight}>
                          {_.get(qualification, "licenseFile", "") ? (
                            <a
                              href={_.get(qualification, "licenseFile", "")}
                              target="_blank"
                              download="营业执照扫描件"
                            >
                              <img src={downloadIcon} alt="" />
                              下载附件
                            </a>
                          ) : (
                            <span>未上传</span>
                          )}
                        </Col>
                      </Row>
                    )}
                  </Row>
                </Col>
              </Row>
            </section>
          </FormEx2>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoBase.updateForm,
    licenseFile: state.infoBase.licenseFile,
    uploadProps: state.app.uploadProps,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(License)