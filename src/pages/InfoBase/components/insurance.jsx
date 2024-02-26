// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { FormEx2, message } from "src/components";
import { PlusOutlined } from '@ant-design/icons';
import { Row, Col, Button, Upload, InputNumber } from "antd";
import downloadIcon from "src/resource/img/info/download.png";
import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";

const { Item } = FormEx2;

class Insurance extends Component {
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
    const value = [];
    fileList = fileList.filter((file) => {
      if (file.response) {
        if (file.response.errorCode === 0) {
          //如果上传成功，则加到文件列表中，否则不加
          value.push(file.response.data);
        }
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
    freshForm(values);
  };

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
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
      updateForm = {},
      uploadProps = {},
      securityRegistrationFile = [],
      isEditing = false,
    } = this.props;
    const { securityRegistration = {} } = updateForm;
    return (
      <div id="sation-insurance" className="ant-affix-content">
        <OpHeader name="社保登记信息" />
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
                    <span>
                      <Item
                        {...formItemLayout}
                        label="在职人数"
                        required
                        colon={false}
                        dataIndex="securityRegistration.activeStaff"
                        rules={[
                          { required: true, message: "在职人数不得为空" },
                          {
                            max: 9999999999,
                            type: "number",
                            message: "在职人数不得超过10位数字",
                          },
                        ]}
                        decorator={
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="请填写公司在职人数"
                          />
                        }
                      />
                    </span>
                  ) : (
                    <Row>
                      <Col {...colLeft}>在职人数：</Col>
                      <Col {...colRight}>
                        {_.get(securityRegistration, "activeStaff", "")}
                      </Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  {isEditing ? (
                    <span>
                      <Item
                        {...formItemLayout}
                        label="社保缴费人数"
                        required
                        colon={false}
                        dataIndex="securityRegistration.securityPayers"
                        rules={[
                          { required: true, message: "社保缴费人数不得为空" },
                          {
                            max: 9999999999,
                            type: "number",
                            message: "社保缴费人数不得超过10位数字",
                          },
                        ]}
                        decorator={
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="请填写公司社保缴费人数"
                          />
                        }
                      />
                    </span>
                  ) : (
                    <Row>
                      <Col {...colLeft}>社保缴费人数：</Col>
                      <Col {...colRight}>
                        {_.get(securityRegistration, "securityPayers", "")}
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
                      label="社保登记扫描件"
                      colon={false}
                      required
                      dataIndex="securityRegistrationFile"
                      rules={[
                        { required: true, message: "社保登记扫描件不得为空" },
                      ]}
                      decorator={
                        <div className="upload-body">
                          <div
                            className={
                              securityRegistrationFile &&
                              securityRegistrationFile.length >= 1
                                ? "m-upload-wrapper m-upload-has-control"
                                : "m-upload-wrapper"
                            }
                          >
                            <Upload
                              {...uploadProps}
                              fileList={securityRegistrationFile}
                              onChange={(...args) => {
                                this.onUploadChange(
                                  "securityRegistrationFile",
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
                                <PlusOutlined />
                                上传文件
                              </Button>
                              <div className="u-upload-desc">
                                <p>&nbsp;支持jpg、png格式文件，不得大于50M</p>
                              </div>
                            </Upload>
                          </div>
                        </div>
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>社会保险登记扫描件：</Col>
                      <Col {...colRight}>
                        {_.get(
                          securityRegistration,
                          "securityRegistrationFile",
                          ""
                        ) ? (
                            <a
                              href={_.get(
                                securityRegistration,
                                "securityRegistrationFile",
                                ""
                              )}
                              target="_blank"
                              download="社会保险登记扫描件"
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
    securityRegistrationFile: state.infoBase.securityRegistrationFile,
    uploadProps: state.app.uploadProps,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Insurance)