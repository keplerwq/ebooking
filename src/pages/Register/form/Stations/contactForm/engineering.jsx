// 联系信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { Input, Select, Upload, Button } from "antd";
import { FormEx2, message } from "src/components";
import uploadIcon from "src/resource/img/上传2.png";
import { descriptor } from "src/libs";
import "./engineering.scss";

const { Option } = Select;
const { Item } = FormEx2;

const telLength = 11;

class Engineering extends Component {
  componentWillReceiveProps(props) {
    const { registerForm } = props;
    if (registerForm) {
      this.form && this.form.setValues(registerForm);
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
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

  onBeforeUpload = (file, fileList) => {
    // if (file & (file.size > 50 * 1024)) {
    //   message.error(`上传文件大小不得超过50M`, 3);
    //   return false;
    // }
    if (fileList.length >= 2) {
      message.error(`最多上传单份`, 3);
      return false;
    }
  };

  render() {
    const {
      registerForm = {},
      uploadProps = {},
      techQualificationFile = [],
    } = this.props;
    console.log(registerForm);
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16, offset: 1 },
    };

    return (
      <div className="m-contact">
        <div className="u-sub-header">
          <span className="u-line"></span>
          <span className="u-sub-tt">工程技术负责人信息</span>
          <span className="u-line"></span>
        </div>

        <div className="u-form">
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
            <Item {...formItemLayout} label="工程技术负责人姓名">
              <Item
                colon={false}
                label=""
                isTrim={true}
                dataIndex="contactInfo.techContact.contactName"
                style={{
                  display: "inline-block",
                  width: "calc(100% - 96px)",
                  marginRight: "6px",
                  marginBottom: "0",
                }}
                decorator={<Input placeholder="请输入联系人姓名" />}
              />
              <Item
                colon={false}
                label=""
                defaultValue="先生"
                dataIndex="contactInfo.techContact.gender"
                style={{
                  display: "inline-block",
                  width: "90px",
                  height: "36px",
                  marginBottom: "0",
                }}
                decorator={
                  <Select style={{ width: "90px", height: "36px" }}>
                    <Option value="先生">先生</Option>
                    <Option value="女士">女士</Option>
                  </Select>
                }
              />
            </Item>
            <Item
              {...formItemLayout}
              colon={false}
              label="手机号"
              rules={[descriptor.telephone]}
              isTrim={true}
              dataIndex="contactInfo.techContact.mobilePhone"
              decorator={
                <Input
                  maxLength={telLength}
                  placeholder="请输入联系人手机号码"
                />
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="邮箱"
              isTrim={true}
              dataIndex="contactInfo.techContact.contactEmail"
              rules={[descriptor.email]}
              decorator={<Input placeholder="请输入联系人邮箱地址" />}
            />
            <Item
              {...formItemLayout}
              label="技术人员资质证书扫描件"
              dataIndex="contactInfo.techContact.techQualificationFile"
              decorator={
                <div
                  className={
                    techQualificationFile && techQualificationFile.length >= 1
                      ? "m-upload-wrapper m-upload-has-control"
                      : "m-upload-wrapper"
                  }
                >
                  <div className="u-upload-desc">
                    <p>
                      请上传工程技术负责人技术资质证明扫描件，若为多张资质文件可上传rar\zip格式的压缩包
                    </p>
                  </div>
                  <Upload
                    {...uploadProps}
                    fileList={techQualificationFile}
                    onChange={(...args) => {
                      this.onUploadChange("techQualificationFile", ...args);
                    }}
                    beforeUpload={this.onBeforeUpload}
                  >
                    <Button className="u-uploader">
                      <img src={uploadIcon} alt="" />
                    </Button>
                  </Upload>
                </div>
              }
            />
          </FormEx2>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    uploadProps: state.app.uploadProps,
    techQualificationFile: state.register.techQualificationFile,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register"),
  null,
  { forwardRef: true }
)(Engineering)