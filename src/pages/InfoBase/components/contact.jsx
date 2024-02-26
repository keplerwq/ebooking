// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { Input, Select } from "antd";
import { FormEx2 } from "src/components";
import { descriptor } from "src/libs";
import { Empty, Modal } from "antd";
import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";

const { Item } = FormEx2;
const { Option } = Select;

const telLength = 11;

class Contact extends Component {
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

  onFormChange = (values) => {
    console.log(values);
    console.log("values");
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  addBizItem = () => {
    let { bizKeys, bizUuid } = this.props;
    const { saveBizKeys } = this.props.actions;
    const nextKeys = bizKeys.concat(bizUuid);
    bizUuid++;
    saveBizKeys(nextKeys, bizUuid);
  };

  removeBizItem = (k, index) => {
    let { bizKeys, bizUuid } = this.props;
    const { saveBizKeys } = this.props.actions;
    if (bizKeys && bizKeys.length === 1) {
      Modal.error({
        title: "联系人信息不得为空",
        content: (
          <div style={{ lineHeight: "35px" }}>
            联系人信息是采购方与供应商的主要联系渠道，不得删除为空
          </div>
        ),
      });
      return;
    }
    saveBizKeys(bizKeys.filter((key) => key !== k), bizUuid, () => {});
    if (this.form && this.form.getValue("contactInfo.bizContact")) {
      let bizContact = _.cloneDeep(
        this.form.getValue("contactInfo.bizContact")
      );
      bizContact.splice(index, 1);
      this.form.setValue("contactInfo.bizContact", bizContact);
    }
  };

  render() {
    const {
      updateForm = {},
      bizKeys = [],
      isEditing,
    } = this.props;
    const { contactInfo = {} } = updateForm;
    const {
      bizContact = [],
      techContact = {},
      legalContact = {},
    } = contactInfo;
    const contactArr = [...bizContact, techContact, legalContact];
    return (
      <div id="sation-contact" className="ant-affix-content">
        <OpHeader
          name="人员信息"
          clickMethod={() => this.addBizItem()}
          isEditing={isEditing}
          buttonTitle="添加联系人"
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
                      联系人姓名
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      职务
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      联系人电话
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      联系人邮箱
                    </div>
                  </th>
                  {/* <th>
                  <div
                    className={isEditing ? "table-ant-legacy-form-item-required" : ""}
                  >
                    人员资质证书
                  </div>
                </th> */}
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {contactArr && contactArr.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {bizKeys &&
                    bizKeys.length >= 1 &&
                    bizKeys.map((k, index) =>
                      !isEditing ? (
                        <tr key={`${k}_${index}`}>
                          <td>{_.get(bizContact[index], "contactName", "")}</td>
                          <td>{_.get(bizContact[index], "position", "")}</td>
                          <td>{_.get(bizContact[index], "mobilePhone", "")}</td>
                          <td>
                            {_.get(bizContact[index], "contactEmail", "")}
                          </td>

                          <td></td>
                        </tr>
                      ) : (
                        <tr key={`${k}_${index}`}>
                          <td>
                            {
                              <Item
                                className="u-form-group"
                                style={{ marginBottom: 0 }}
                                required
                                label=""
                              >
                                <Item
                                  colon={false}
                                  label=""
                                  required
                                  dataIndex={`contactInfo.bizContact[${index}].contactName`}
                                  rules={[
                                    {
                                      required: true,
                                      message: "请输入联系人姓名",
                                    },
                                  ]}
                                  style={{
                                    display: "inline-block",
                                    width: "calc(100% - 96px)",
                                    marginRight: "6px",
                                  }}
                                  isTrim={true}
                                  decorator={
                                    <Input placeholder="请输入联系人姓名" />
                                  }
                                />
                                <Item
                                  colon={false}
                                  label=""
                                  defaultValue="先生"
                                  dataIndex={`contactInfo.bizContact[${index}].gender`}
                                  style={{
                                    display: "inline-block",
                                    width: "90px",
                                    height: "36px",
                                  }}
                                  decorator={
                                    <Select
                                      style={{ width: "90px", height: "36px" }}
                                    >
                                      <Option value="先生">先生</Option>
                                      <Option value="女士">女士</Option>
                                    </Select>
                                  }
                                />
                              </Item>
                            }
                          </td>
                          <td>
                            {
                              <Item
                                colon={false}
                                label=""
                                required
                                dataIndex={`contactInfo.bizContact[${index}].position`}
                                rules={[
                                  {
                                    required: true,
                                    message: "请输入联系人职务",
                                  },
                                ]}
                                isTrim={true}
                                decorator={
                                  <Input placeholder="请输入联系人职务" />
                                }
                              />
                            }
                          </td>
                          <td>
                            {
                              <Item
                                colon={false}
                                label=""
                                required
                                dataIndex={`contactInfo.bizContact[${index}].mobilePhone`}
                                rules={[
                                  {
                                    required: true,
                                    message: "请输入联系人手机号码",
                                  },
                                ]}
                                isTrim={true}
                                decorator={
                                  <Input
                                    placeholder="请输入联系人手机号码"
                                  />
                                }
                              />
                            }
                          </td>
                          <td>
                            {
                              <Item
                                colon={false}
                                label=""
                                required
                                dataIndex={`contactInfo.bizContact[${index}].contactEmail`}
                                rules={[
                                  {
                                    required: true,
                                    message: "请输入联系人邮箱地址",
                                  },
                                  descriptor.email,
                                ]}
                                isTrim={true}
                                decorator={
                                  <Input placeholder="请输入联系人邮箱地址" />
                                }
                              />
                            }
                          </td>
                          <td>
                            <a
                              className="u-form-link"
                              onClick={() => this.removeBizItem(k, index)}
                            >
                              删除
                            </a>
                          </td>
                        </tr>
                      )
                    )}
                  {!isEditing ? (
                    <tr>
                      <td>{_.get(techContact, "contactName", "")}</td>
                      <td>{_.get(techContact, "position", "")}</td>
                      <td>{_.get(techContact, "mobilePhone", "")}</td>
                      <td>{_.get(techContact, "contactEmail", "")}</td>
                      <td></td>
                    </tr>
                  ) : (
                    <tr>
                      <td>
                        {
                          <Item
                            className="u-form-group"
                            style={{ marginBottom: 0 }}
                            required
                            label=""
                          >
                            <Item
                              colon={false}
                              label=""
                              required
                              dataIndex={`contactInfo.techContact.contactName`}
                              rules={[
                                {
                                  required: true,
                                  message: "请输入联系人姓名",
                                },
                              ]}
                              style={{
                                display: "inline-block",
                                width: "calc(100% - 96px)",
                                marginRight: "6px",
                              }}
                              isTrim={true}
                              decorator={
                                <Input placeholder="请输入联系人姓名" />
                              }
                            />
                            <Item
                              colon={false}
                              label=""
                              defaultValue="先生"
                              dataIndex={`contactInfo.techContact.gender`}
                              style={{
                                display: "inline-block",
                                width: "90px",
                                height: "36px",
                              }}
                              decorator={
                                <Select
                                  style={{ width: "90px", height: "36px" }}
                                >
                                  <Option value="先生">先生</Option>
                                  <Option value="女士">女士</Option>
                                </Select>
                              }
                            />
                          </Item>
                        }
                      </td>
                      <td>
                        {
                          <Item
                            colon={false}
                            label=""
                            required
                            dataIndex={`contactInfo.techContact.position`}
                            rules={[
                              {
                                required: true,
                                message: "请输入联系人职务",
                              },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input disabled placeholder="请输入联系人职务" />
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            colon={false}
                            label=""
                            required
                            dataIndex={`contactInfo.techContact.mobilePhone`}
                            rules={[
                              {
                                required: true,
                                message: "请输入联系人手机号码",
                              },
                              // descriptor.telephone,
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                maxLength={telLength}
                                placeholder="请输入联系人手机号码"
                              />
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            colon={false}
                            label=""
                            required
                            dataIndex={`contactInfo.techContact.contactEmail`}
                            rules={[
                              {
                                required: true,
                                message: "请输入联系人邮箱地址",
                              },
                              descriptor.email,
                            ]}
                            isTrim={true}
                            decorator={
                              <Input placeholder="请输入联系人邮箱地址" />
                            }
                          />
                        }
                      </td>
                      <td>
                        {/* <a
                          className="u-form-link"
                          onClick={() => this.removeBizItem(k, index)}
                        >
                          删除
                        </a> */}
                      </td>
                    </tr>
                  )}
                  {!isEditing ? (
                    <tr>
                      <td>{_.get(legalContact, "contactName", "")}</td>
                      <td>{_.get(legalContact, "position", "")}</td>
                      <td>{_.get(legalContact, "mobilePhone", "")}</td>
                      <td>{_.get(legalContact, "contactEmail", "")}</td>
                      <td></td>
                    </tr>
                  ) : (
                    <tr>
                      <td>
                        {
                          <Item
                            className="u-form-group"
                            style={{ marginBottom: 0 }}
                            required
                            label=""
                          >
                            <Item
                              colon={false}
                              label=""
                              required
                              dataIndex={`contactInfo.legalContact.contactName`}
                              rules={[
                                {
                                  required: true,
                                  message: "请输入联系人姓名",
                                },
                              ]}
                              style={{
                                display: "inline-block",
                                width: "calc(100% - 96px)",
                                marginRight: "6px",
                              }}
                              isTrim={true}
                              decorator={
                                <Input placeholder="请输入联系人姓名" />
                              }
                            />
                            <Item
                              colon={false}
                              label=""
                              defaultValue="先生"
                              dataIndex={`contactInfo.legalContact.gender`}
                              style={{
                                display: "inline-block",
                                width: "90px",
                                height: "36px",
                              }}
                              decorator={
                                <Select
                                  style={{ width: "90px", height: "36px" }}
                                >
                                  <Option value="先生">先生</Option>
                                  <Option value="女士">女士</Option>
                                </Select>
                              }
                            />
                          </Item>
                        }
                      </td>
                      <td>
                        {
                          <Item
                            colon={false}
                            label=""
                            required
                            dataIndex={`contactInfo.legalContact.position`}
                            rules={[
                              {
                                required: true,
                                message: "请输入联系人职务",
                              },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input disabled placeholder="请输入联系人职务" />
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            colon={false}
                            label=""
                            required
                            dataIndex={`contactInfo.legalContact.mobilePhone`}
                            rules={[
                              {
                                required: true,
                                message: "请输入联系人手机号码",
                              },
                              // descriptor.telephone,
                            ]}
                            isTrim={true}
                            decorator={
                              <Input
                                maxLength={telLength}
                                placeholder="请输入联系人手机号码"
                              />
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            colon={false}
                            label=""
                            required
                            dataIndex={`contactInfo.legalContact.contactEmail`}
                            rules={[
                              {
                                required: true,
                                message: "请输入联系人邮箱地址",
                              },
                              descriptor.email,
                            ]}
                            isTrim={true}
                            decorator={
                              <Input placeholder="请输入联系人邮箱地址" />
                            }
                          />
                        }
                      </td>
                      <td>
                        {/* <a
                          className="u-form-link"
                          onClick={() => this.removeBizItem(k, index)}
                        >
                          删除
                        </a> */}
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
            {!(contactArr && contactArr.length >= 1) && (
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
    bizKeys: state.infoBase.bizKeys,
    bizUuid: state.infoBase.bizUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Contact)