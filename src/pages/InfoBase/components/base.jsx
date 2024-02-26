// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { FormEx2, Address, message } from "src/components";
import api from "src/api";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Col, Select, Row, Cascader, Upload, DatePicker } from "antd";
import downloadIcon from "src/resource/img/info/download.png";
import moment from "moment";
import { realLength } from "src/libs/util";

import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";

const { Item } = FormEx2;
const { Option } = Select;
const { TextArea } = Input;

class Base extends Component {
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
    const {
      isEditing = false,
      updateForm = {},
      uploadProps = {},
      companyLogoFile = [],
      companyIntroduce = [],
    } = this.props;
    const company = _.get(updateForm, "company", {});
    const areaAray = _.get(updateForm, "company.areaArray", []);
    const companyAddress = _.get(updateForm, "company.companyAddress", "");
    const address = ((areaAray && areaAray.join("")) || "") + companyAddress;
    return (
      <div id="sation-base" className="ant-affix-content">
        <OpHeader name="基本信息" />
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
                      label="企业名称"
                      required
                      dataIndex="company.companyName"
                      rules={[
                        { required: true, message: "请填写公司营业执照上名称" },
                      ]}
                      isTrim={true}
                      decorator={
                        <Input placeholder="请填写公司营业执照上名称" />
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>企业名称：</Col>
                      <Col {...colRight}>
                        {_.get(company, "companyName", "")}
                      </Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="公司简称"
                      trigger="onChange"
                      onChange={(values) => {
                        this.validRepeat(values);
                      }}
                      dataIndex="company.companySimpleName"
                      rules={[
                        {
                          validator: this.validLength,
                          message: "企业简称不得超过20个字",
                        },
                      ]}
                      isTrim={true}
                      decorator={<Input placeholder="请填写公司名称简称" />}
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>公司简称：</Col>
                      <Col {...colRight}>
                        {_.get(company, "companySimpleName", "")}
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
                      label="公司Logo"
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
                  ) : (
                    <Row>
                      <Col {...colLeft}>公司Logo：</Col>
                      <Col {...colRight}>
                        {_.get(company, "companyLogoFile", "") ? (
                          <a
                            href={_.get(company, "companyLogoFile", "")}
                            target="_blank"
                            download="公司Logo"
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
              <Row className="u-ct g-wrapper">
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="业务范围"
                      required
                      maxLength={50}
                      dataIndex="company.bizType"
                      rules={[{ required: true, message: "请选择业务范围" }]}
                      isTrim={true}
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
                  ) : (
                    <Row>
                      <Col {...colLeft}>业务范围：</Col>
                      <Col {...colRight}>
                        {_.get(company, "bizType", []).join("，")}
                      </Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="业务范围描述"
                      required
                      maxLength={50}
                      dataIndex="company.bizScope"
                      rules={[
                        { required: true, message: "请输入公司业务范围描述" },
                      ]}
                      isTrim={true}
                      decorator={
                        <TextArea
                          maxLength={200}
                          placeholder="请输入公司业务范围描述，200字以内"
                          autoSize={{ minRows: 1, maxRows: 3 }}
                        />
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>业务范围描述：</Col>
                      <Col {...colRight}>{_.get(company, "bizScope", "")}</Col>
                    </Row>
                  )}
                </Col>
              </Row>
              <Row className="u-ct g-wrapper">
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      required
                      className="u-form-group"
                      label="公司地址"
                      style={{ marginBottom: 0 }}
                    >
                      <Item
                        required
                        dataIndex="company.areaArray"
                        rules={[
                          { required: true, message: "请选择省市区" },
                        ]}
                        style={{
                          display: "inline-block",
                          width: "calc(50% - 50px)",
                          marginRight: "10px",
                        }}
                        decorator={
                          <Cascader
                            options={Address}
                            placeholder="省/市/区"
                          />
                        }
                      />
                      <Item
                        label=""
                        required
                        dataIndex="company.companyAddress"
                        rules={[
                          { required: true, message: "请输入详细地址" },
                        ]}
                        style={{
                          display: "inline-block",
                          width: "calc(50% + 40px)",
                        }}
                        isTrim={true}
                        decorator={
                          <Input placeholder="详细地址：如道路、门牌号、单元室等" />
                        }
                      />
                    </Item>
                  ) : (
                    <Row>
                      <Col {...colLeft}>公司地址：</Col>
                      <Col {...colRight}>{address}</Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      className="u-data-item"
                      label="公司成立日期"
                      required
                      dataIndex="company.companySetUpTime"
                      rules={[
                        { required: true, message: "公司成立日期不得为空" },
                      ]}
                      decorator={
                        <DatePicker
                          showToday={false}
                          format={"YYYY-MM-DD"}
                          placeholder="请选择公司成立日期"
                        />
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>公司成立日期：</Col>
                      <Col {...colRight}>
                        {_.get(company, "companySetUpTime", "") ? (
                          <span>
                            {moment(
                              _.get(company, "companySetUpTime", "")
                            ).format("YYYY-MM-DD")}
                          </span>
                        ) : (
                          <span></span>
                        )}
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
                      label="对外联系电话"
                      required
                      dataIndex="company.contactTelephone"
                      rules={[
                        { required: true, message: "对外联系电话不得为空" },
                        { max: 20, message: " 对外联系电话不得超过20位数字" },
                      ]}
                      isTrim={true}
                      decorator={
                        <Input placeholder="请输入公司对外联系电话号码" />
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>对外联系电话：</Col>
                      <Col {...colRight}>
                        {_.get(company, "contactTelephone", "")}
                      </Col>
                    </Row>
                  )}
                </Col>
                <Col {...col}>
                  {isEditing ? (
                    <Item
                      {...formItemLayout}
                      label="公司简介"
                      required
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
                                this.onUploadChange(
                                  "companyIntroduce",
                                  ...args
                                );
                              }}
                              // className={
                              //   companyIntroduce && companyIntroduce.length >= 1
                              //     ? "m-upload-has-control"
                              //     : ""
                              // }
                              accept=".jpg, .png"
                              beforeUpload={this.onBeforeUpload}
                            >
                              {/* {companyIntroduce &&
                            companyIntroduce.length <= 0 ? (
                              <div> */}
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
                              {/* </div>
                            ) : (
                              <div></div>
                            )} */}
                            </Upload>
                          </div>
                        </div>
                      }
                    />
                  ) : (
                    <Row>
                      <Col {...colLeft}>公司简介：</Col>
                      <Col {...colRight}>
                        {_.get(company, "companyIntroduce", "") ? (
                          <a
                            href={_.get(company, "companyIntroduce", "")}
                            target="_blank"
                            download="公司简介"
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
    companyLogoFile: state.infoBase.companyLogoFile,
    companyIntroduce: state.infoBase.companyIntroduce,
    uploadProps: state.app.uploadProps,
  };
};

export default connect(
  mapStateToProps, dispatchs("app", "infoBase"), null, { forwardRef: true }
)(Base)

