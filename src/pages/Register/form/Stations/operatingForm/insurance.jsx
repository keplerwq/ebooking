// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Card, Upload, InputNumber } from "antd";
import { FormEx2, message } from "src/components";
import "./insurance.scss";

const { Item } = FormEx2;

class Insurance extends Component {
  
  componentWillReceiveProps(props) {
    const { registerForm } = props;
    if (registerForm) {
      this.form && this.form.setValues(registerForm);
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
    const {
      registerForm = {},
      uploadProps = {},
      securityRegistrationFile = [],
    } = this.props;
    const rowLayout = {
      gutter: 25,
    };
    const col8 = {
      span: 8,
    };
    return (
      <div className="m-sation-insurance">
        <Card
          className="u-card"
          title="社会保险登记信息"
          extra={
            <div>
              标记<span style={{ color: "#ff4d4f" }}> * </span>的信息为必填项
            </div>
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
            layout="vertical"
          >
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
                  label="在职人数"
                  required
                  colon={false}
                  dataIndex="securityRegistration.activeStaff"
                  rules={[
                    { required: true, message: "在职人数不得为空" },
                    { max: 10, message: "在职人数不得超过10位数字" },
                  ]}
                  decorator={
                    <span>
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="请填写公司在职人数"
                      />
                    </span>
                  }
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="社保缴费人数"
                  required
                  colon={false}
                  dataIndex="securityRegistration.securityPayers"
                  rules={[
                    { required: true, message: "社保缴费人数不得为空" },
                    { max: 10, message: "社保缴费人数不得超过10位数字" },
                  ]}
                  decorator={
                    <span>
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="请填写公司社保缴费人数"
                      />
                    </span>
                  }
                />
              </Col>
              <Col {...col8}>
                <Item
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
              </Col>
            </Row>
          </FormEx2>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    securityRegistrationFile: state.register.securityRegistrationFile,
    uploadProps: state.app.uploadProps,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register"),
  null,
  { forwardRef: true }
)(Insurance)