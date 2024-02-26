// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import {
  Button,
  Input,
  Col,
  Row,
  Cascader,
  Card,
  Upload,
  DatePicker,
  Checkbox,
  InputNumber,
} from "antd";
import { FormEx2, Address, message } from "src/components";
import _ from "lodash";
import "./license.scss";
import moment from "moment";
import { realLength } from "src/libs/util";

const { Item } = FormEx2;

class License extends Component {
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
    // const keys = ["creditCode", "registrationOrgan"];
    // for (let key of Object.values(keys)) {
    //   values.qualification[key] = handleTrim(values.qualification[key]);
    // }
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
    const {
      registerForm = {},
      uploadProps = {},
      licenseFile = [],
    } = this.props;
    const rowLayout = {
      gutter: 25,
    };
    const col8 = {
      span: 8,
    };
    return (
      <div className="m-sation-license">
        <Card className="u-card" title="营业执照信息">
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
                  label="统一社会信用代码"
                  required
                  colon={false}
                  isTrim={true}
                  dataIndex="qualification.creditCode"
                  rules={[
                    {
                      required: true,
                      message: "统一社会信用代码不得为空",
                    },
                    { max: 50, message: "统一社会信用代码不得超过50个字符" },
                  ]}
                  decorator={<Input placeholder="请填写统一信用代码" />}
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="登记机关"
                  colon={false}
                  required
                  isTrim={true}
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
                  decorator={<Input placeholder="请填写登记机关" />}
                />
              </Col>
              <Col {...col8}>
                {_.get(
                  registerForm,
                  "qualification.registrationOrganArea.country",
                  ""
                ) !== "foreign" && (
                  <Item
                    label="营业执照登记机关所在地"
                    required
                    colon={false}
                    dataIndex="qualification.registrationOrganAreaArray"
                    rules={[{ required: true, message: "请选择省市区" }]}
                    decorator={
                      <Cascader options={Address} placeholder="省/市/区" />
                    }
                  />
                )}
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
                  className="u-data-item"
                  label="登记日期"
                  required
                  colon={false}
                  dataIndex="qualification.registerTime"
                  rules={[{ required: true, message: "登记日期不得为空" }]}
                  decorator={
                    <DatePicker
                      showToday={false}
                      format={"YYYY-MM-DD"}
                      disabledDate={this.disabledAfterDate}
                      placeholder="请选择公司营业执照登记日期"
                    />
                  }
                />
              </Col>
              <Col {...col8}>
                <Item
                  className="u-form-group"
                  style={{ marginBottom: 0 }}
                  required
                  label="营业执照有效截止日期"
                >
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
                      width: "calc(100% - 106px)",
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
                          _.get(registerForm, "qualification.check", false) ===
                          true
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
                    decorator={<Checkbox>长期有效</Checkbox>}
                  />
                </Item>
              </Col>

              <Col {...col8}>
                <Item
                  label="注册资本"
                  required
                  colon={false}
                  dataIndex="qualification.registerMoney"
                  rules={[
                    { required: true, message: "注册资本不得为空" },
                    { max: 8, message: "注册资本不得超过8位" },
                  ]}
                  decorator={
                    <div style={{display: 'flex', justifyContent: 'flex-start'}} >
                      <InputNumber
                        style={{ width: "100%", height: 32, marginTop: 4 }}
                        placeholder="请填写公司注册资本"
                      />
                      <span className="ant-input-suffix">万元</span>
                    </div>
                  }
                ></Item>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
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
    licenseFile: state.register.licenseFile,
    uploadProps: state.app.uploadProps,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register"),
  null,
  { forwardRef: true }
)(License)