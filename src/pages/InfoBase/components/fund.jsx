// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { Input, Select } from "antd";
import { FormEx2 } from "src/components";
import {
  Empty,
  InputNumber,
  DatePicker,
} from "antd";
import moment from "moment";

import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";
import { realLength } from "src/libs/util";

const { Item } = FormEx2;
const { Option } = Select;

class Fund extends Component {
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

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  addFundItem = () => {
    let { fundKeys, fundUuid } = this.props;
    const { saveFundKeys } = this.props.actions;
    const nextKeys = fundKeys.concat(fundUuid);
    fundUuid++;
    saveFundKeys(nextKeys, fundUuid);
  };

  removeFundItem = (k, index) => {
    let { fundKeys, fundUuid } = this.props;
    const { saveFundKeys } = this.props.actions;
    if (fundKeys.length === 1) {
      return;
    }
    saveFundKeys(fundKeys.filter((key) => key !== k), fundUuid, () => {});
    if (this.form && this.form.getValue("paidInList")) {
      let paidInList = _.cloneDeep(this.form.getValue("paidInList"));
      paidInList.splice(index, 1);
      this.form.setValue("paidInList", paidInList);
    }
  };

  validLength = (rule, value, callback) => {
    if (value && realLength(value) > 60) {
      callback(false);
    } else {
      callback();
    }
  };

  validValue = (rule, value, callback) => {
    if (value && value > 100) {
      callback(false);
    } else {
      callback();
    }
  };

  disabledAfterDate = (current) => {
    return current && current > moment().endOf("day");
  };

  render() {
    const { updateForm = {}, fundKeys = [], isEditing = false } = this.props;
    const { paidInList = [] } = updateForm;
    return (
      <div id="sation-fund" className="ant-affix-content">
        <OpHeader
          clickMethod={() => this.addFundItem()}
          name="出资信息"
          isEditing={isEditing}
          buttonTitle="新增出资信息"
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
                      出资人类型
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      出资人名称
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      出资额
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      出资比例
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      出资时间
                    </div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {fundKeys && fundKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {fundKeys.map((k, index) =>
                    !isEditing ? (
                      <tr key={`${k}_${index}`}>
                        <td>{_.get(paidInList[index], "paidInType", "")}</td>
                        <td>{_.get(paidInList[index], "paidInName", "")}</td>
                        <td>{_.get(paidInList[index], "paidInAmount", "")}</td>
                        <td>{_.get(paidInList[index], "paidInRatio", "")}</td>
                        <td>
                          {_.get(paidInList[index], "paidInTime", "") ? (
                            <span>
                              {moment(
                                _.get(paidInList[index], "paidInTime", "")
                              ).format("YYYY-MM-DD")}
                            </span>
                          ) : (
                            <span></span>
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
                              required
                              dataIndex={`paidInList[${index}].paidInType`}
                              rules={[
                                {
                                  required: true,
                                  message: "出资人类型不得为空",
                                },
                              ]}
                              decorator={
                                <Select
                                  placeholder=" 请选择"
                                  style={{ width: 180 }}
                                >
                                  <Option value="法人">法人</Option>
                                  <Option value="企业法人">企业法人</Option>
                                  <Option value="社会团体法人">
                                    社会团体法人
                                  </Option>
                                  <Option value="事业法人">事业法人</Option>
                                  <Option value="国家授权投资的机构或部门">
                                    国家授权投资的机构或部门
                                  </Option>
                                  <Option value="自然人">自然人</Option>
                                  <Option value="合伙企业">合伙企业</Option>
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
                              dataIndex={`paidInList[${index}].paidInName`}
                              rules={[
                                {
                                  required: true,
                                  message: "出资人名称不得为空",
                                },
                                {
                                  validator: this.validLength,
                                  message: "出资人名称不得超过30个汉字",
                                },
                              ]}
                              isTrim={true}
                              decorator={
                                <Input
                                  placeholder="请输入出资人名称"
                                  style={{ width: 220 }}
                                />
                              }
                            />
                          }
                        </td>
                        <td>
                          <span className="ant-input-affix-wrapper">
                            <Item
                              required
                              label=""
                              dataIndex={`paidInList[${index}].paidInAmount`}
                              rules={[
                                { required: true, message: "出资金额不得为空" },
                                {
                                  max: 99999999,
                                  type: "number",
                                  message: "出资金额不得超过8位",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  style={{ width: "100%" }}
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
                              dataIndex={`paidInList[${index}].paidInRatio`}
                              rules={[
                                { required: true, message: "出资比例不能为空" },
                                {
                                  validator: this.validValue,
                                  message: "请输入正确比例",
                                },
                              ]}
                              decorator={
                                <InputNumber
                                  precision={2}
                                  style={{ width: "100%" }}
                                  placeholder="请输入"
                                />
                              }
                            >
                              <span className="ant-input-suffix">%</span>
                            </Item>
                          </span>
                        </td>
                        <td>
                          <Item
                            required
                            label=""
                            dataIndex={`paidInList[${index}].paidInTime`}
                            rules={[
                              { required: true, message: "出资日期不得为空" },
                            ]}
                            decorator={
                              <DatePicker
                                showToday={false}
                                format={"YYYY-MM-DD"}
                                disabledDate={this.disabledAfterDate}
                                placeholder="请选择出资日期"
                              />
                            }
                          />
                        </td>
                        <td>
                          <a
                            className="u-form-link"
                            onClick={() => this.removeFundItem(k, index)}
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
            {!(fundKeys && fundKeys.length >= 1) && (
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
    fundKeys: state.infoBase.fundKeys,
    fundUuid: state.infoBase.fundUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Fund)