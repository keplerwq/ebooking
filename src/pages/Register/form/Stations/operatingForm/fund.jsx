// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select, Card, DatePicker, InputNumber, Empty } from "antd";
import { FormEx2 } from "src/components";
import _ from "lodash";
import "./fund.scss";
import { realLength } from "src/libs/util";
import moment from "moment";

const { Item } = FormEx2;
const { Option } = Select;

class Fund extends Component {
  
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
    if (saveFundKeys.length === 1) {
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
    const {
      registerForm = {},
      fundKeys = [],
    } = this.props;

    return (
      <div className="m-sation-fund">
        <Card
          className="u-card"
          title="出资信息"
          extra={
            <Button
              onClick={() => this.addFundItem()}
              type="primary"
              size="small"
              ghost
              style={{ height: 30 }}
            >
              <PlusOutlined />
              新增出资信息
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
                    <div className="ant-legacy-form-item-required">出资人类型</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">出资人名称</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">出资金额</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">出资比例</div>
                  </th>
                  <th>
                    <div className="ant-legacy-form-item-required">出资时间</div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {fundKeys && fundKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {fundKeys.map((k, index) => (
                    <tr key={k}>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`paidInList[${index}].paidInType`}
                            rules={[
                              { required: true, message: "出资人类型不得为空" },
                            ]}
                            decorator={
                              <Select
                                placeholder=" 请选择"
                                style={{ width: 180 }}
                              >
                                <Option value="法人">法人</Option>
                                <Option value="企业法人">企业法人</Option>
                                <Option value="社会团体法人">社会团体法人</Option>
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
                              { required: true, message: "出资人名称不得为空" },
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
                        <Item
                          required
                          label=""
                          dataIndex={`paidInList[${index}].paidInAmount`}
                          rules={[
                            { required: true, message: "出资金额不得为空" },
                            { max: 8, message: "出资金额不得超过8位" },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                style={{ width: "100%" }}
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
                          dataIndex={`paidInList[${index}].paidInRatio`}
                          rules={[
                            { required: true, message: "出资比例不能为空" },
                            {
                              validator: this.validValue,
                              message: "请输入正确比例",
                            },
                          ]}
                          decorator={
                            <span className="ant-input-affix-wrapper">
                              <InputNumber
                                precision={2}
                                style={{ width: "100%" }}
                                placeholder="请输入"
                              />
                              <span className="ant-input-suffix">%</span>
                            </span>
                          }
                        />
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
                  ))}
                </tbody>
              )}
            </table>
            {!(fundKeys && fundKeys.length >= 1) && (
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
    fundKeys: state.register.fundKeys,
    fundUuid: state.register.fundUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register"),
  null,
  { forwardRef: true }
)(Fund)