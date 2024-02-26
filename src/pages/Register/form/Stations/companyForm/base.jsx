// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import api from "src/api";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Col, Select, Row, Cascader, Card, Upload, DatePicker } from "antd";
import { FormEx2, Address, message } from "src/components";
import _ from "lodash";
import { realLength } from "src/libs/util";
import "./base.scss";

const { Item } = FormEx2;
const { Option } = Select;
const { TextArea } = Input;

class Base extends Component {
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
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };
  validLength = (rule, value, callback) => {
    if (value && realLength(value) > 40) {
      callback(false);
    } else {
      callback();
    }
  };

  validRepeat = _.debounce(function() {
    const value = this.form.getValue("company.companySimpleName");
    if (!value || (value && value.trim() == "")) return;
    this.form.validateValue("company.companySimpleName", (success, result) => {
      let nameRes = result.find(
        (x) => x.dataIndex === "company.companySimpleName"
      );
      if (nameRes.status !== "error") {
        const params = {
          accountType: 20,
          type: "companySimpleName",
          value: value,
        };
        api.registerCheck(params).then((res) => {
          if (res.errorCode !== 0) {
            message.error(res.msg);
          }
        });
      }
    });
  }, 1000);

  render() {
    const {
      registerForm = {},
      uploadProps = {},
      companyLogoFile = [],
      companyIntroduce = [],
    } = this.props;

    const typeList = [
      "工程设计",
      "工程施工",
      "工程勘察",
      "监理",
      "造价咨询",
      "测绘",
      "图审",
      "电梯",
      "空调",
      "园林景观",
      "家具",
      "检验检测技术服务",
      "其他咨询技术服务",
      "市政",
      "电力工程",
      "水务",
      "燃气工程",
      "其他",
    ];
    const currencyList = [
      "人民币",
      "美元",
      "日元",
      "港币",
      "欧元",
      "加元",
      "新加坡币",
      "澳元",
    ];
    const rowLayout = {
      gutter: 25,
    };
    const col8 = {
      span: 8,
    };
    const col16 = {
      span: 16,
    };
    return (
      <div className="m-sation-base">
        <Card
          className="u-card"
          title="基本信息"
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
                  label="公司名称"
                  required
                  colon={false}
                  isTrim={true}
                  dataIndex="company.companyName"
                  rules={[{ required: true, message: "公司名称不得为空" }]}
                  decorator={<Input placeholder="请填写公司营业执照上名称" />}
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="公司简称"
                  colon={false}
                  trigger="onChange"
                  onChange={(values) => {
                    this.validRepeat(values);
                  }}
                  isTrim={true}
                  dataIndex="company.companySimpleName"
                  rules={[
                    {
                      validator: this.validLength,
                      message: "企业简称不得超过20个字",
                    },
                    // {
                    //   validator: this.validRepeat,
                    //   message: "企业简称不得重复",
                    // },
                  ]}
                  decorator={<Input placeholder="请填写公司名称简称" />}
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="公司Logo"
                  colon={false}
                  dataIndex="companyLogoFile"
                  decorator={
                    <div className="upload-body">
                      <div
                        className={
                          companyLogoFile && companyLogoFile.length >= 1
                            ? "m-upload-wrapper m-upload-has-control"
                            : "m-upload-wrapper"
                        }
                      >
                        <Upload
                          {...uploadProps}
                          fileList={companyLogoFile}
                          onChange={(...args) => {
                            this.onUploadChange("companyLogoFile", ...args);
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
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
                  label="业务范围"
                  required
                  isTrim={true}
                  colon={false}
                  dataIndex="company.bizType"
                  rules={[{ required: true, message: "请选择业务类型" }]}
                  decorator={
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="请选择业务类型"
                    >
                      {typeList.map((value) => (
                        <Option key={value} value={value}>
                          {value}
                        </Option>
                      ))}
                    </Select>
                  }
                />
              </Col>
              <Col {...col16}>
                <Item
                  style={{ marginTop: "38px" }}
                  required
                  isTrim={true}
                  colon={false}
                  dataIndex="company.bizScope"
                  rules={[
                    { required: true, message: "请输入公司业务范围描述" },
                  ]}
                  decorator={
                    <TextArea
                      maxLength={200}
                      placeholder="请输入公司业务范围描述，200字以内"
                      autoSize={{ minRows: 1, maxRows: 3 }}
                    />
                  }
                />
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
                  className="u-data-item"
                  label="公司成立日期"
                  required
                  colon={false}
                  dataIndex="company.companySetUpTime"
                  rules={[{ required: true, message: "公司成立日期不得为空" }]}
                  decorator={
                    <DatePicker
                      showToday={false}
                      format={"YYYY-MM-DD"}
                      placeholder="请选择公司成立日期"
                    />
                  }
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="对外联系电话"
                  required
                  colon={false}
                  isTrim={true}
                  dataIndex="company.contactTelephone"
                  rules={[
                    { required: true, message: "对外联系电话不得为空" },
                    { max: 20, message: " 对外联系电话不得超过20位数字" },
                  ]}
                  decorator={<Input placeholder="请输入公司对外联系电话号码" />}
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="公司简介"
                  required
                  colon={false}
                  dataIndex="companyIntroduce"
                  rules={[{ required: true, message: "公司简介不得为空" }]}
                  decorator={
                    <div className="upload-body">
                      <div
                        className={
                          companyIntroduce && companyIntroduce.length >= 1
                            ? "m-upload-wrapper m-upload-has-control"
                            : "m-upload-wrapper"
                        }
                      >
                        <Upload
                          {...uploadProps}
                          fileList={companyIntroduce}
                          onChange={(...args) => {
                            this.onUploadChange("companyIntroduce", ...args);
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
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
                  label="公司地址"
                  required
                  colon={false}
                  dataIndex="company.areaArray"
                  rules={[{ required: true, message: "请选择省市区" }]}
                  decorator={
                    <Cascader options={Address} placeholder="省/市/区" />
                  }
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="详细地址"
                  required
                  isTrim={true}
                  colon={false}
                  dataIndex="company.companyAddress"
                  rules={[{ required: true, message: "请输入详细地址" }]}
                  decorator={
                    <Input placeholder="详细地址：如道路、门牌号、单元室等" />
                  }
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="结算币种"
                  required
                  defaultValue="人民币"
                  colon={false}
                  dataIndex="company.settCurrency"
                  rules={[{ required: true, message: "请选择结算币种" }]}
                  decorator={
                    <Select placeholder="结算币种">
                      {currencyList.map((value) => (
                        <Option key={value} value={value}>
                          {value}
                        </Option>
                      ))}
                    </Select>
                  }
                />
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col {...col8}>
                <Item
                  label="开户行"
                  required
                  colon={false}
                  isTrim={true}
                  dataIndex="company.bankName"
                  rules={[
                    { required: true, message: "请输入公司开户银行名称" },
                  ]}
                  decorator={<Input placeholder="请输入公司开户银行名称" />}
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="户名"
                  required
                  isTrim={true}
                  colon={false}
                  dataIndex="company.bankAccountName"
                  rules={[{ required: true, message: "请输入公司银行户名" }]}
                  decorator={<Input placeholder="请输入公司银行户名" />}
                />
              </Col>
              <Col {...col8}>
                <Item
                  label="银行账号"
                  required
                  colon={false}
                  isTrim={true}
                  dataIndex="company.bankAccountId"
                  rules={[{ required: true, message: "请输入公司银行账号" }]}
                  decorator={<Input placeholder="请输入公司银行账号" />}
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
    companyLogoFile: state.register.companyLogoFile,
    companyIntroduce: state.register.companyIntroduce,
    uploadProps: state.app.uploadProps,
  };
};

export default connect(mapStateToProps, dispatchs("app", "register"), null, { forwardRef: true })(Base)