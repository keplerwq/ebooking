// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { Input, Select } from "antd";
import { FormEx2 } from "src/components";
import { Empty } from "antd";

import OpHeader from "../baseComponents/OpHeader";
import "../infoBase.scss";

const { Item } = FormEx2;
const { Option } = Select;

class Bank extends Component {
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
    console.log(values);
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  addBankItem = () => {
    let { bankKeys, bankUuid } = this.props;
    const { saveBankKeys } = this.props.actions;
    const nextKeys = bankKeys.concat(bankUuid);
    bankUuid++;
    saveBankKeys(nextKeys, bankUuid);
  };

  removeBankItem = (k, index) => {
    let { bankKeys, bankUuid } = this.props;
    const { saveBankKeys } = this.props.actions;
    if (saveBankKeys.length === 1) {
      return;
    }
    saveBankKeys(bankKeys.filter((key) => key !== k), bankUuid, () => {});
    if (this.form && this.form.getValue("bankCardList")) {
      let bankCardList = _.cloneDeep(this.form.getValue("bankCardList"));
      bankCardList.splice(index, 1);
      this.form.setValue("bankCardList", bankCardList);
    }
  };
  render() {
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
    const { updateForm = {}, bankKeys, isEditing = false } = this.props;
    const { bankCardList = [] } = updateForm;
    return (
      <div id="sation-bank" className="ant-affix-content">
        <OpHeader
          name="银行卡信息"
          clickMethod={() => this.addBankItem()}
          isEditing={isEditing}
          buttonTitle="添加银行卡"
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
            <table className="ant-table table-contact g-panel">
              <thead className="ant-table-thead">
                <tr>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      开户行
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      户名
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      卡号
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      结算币种
                    </div>
                  </th>
                  <th>
                    <div
                      className={
                        isEditing ? "table-ant-legacy-form-item-required" : ""
                      }
                    >
                      开户银行地址
                    </div>
                  </th>
                  <th>
                    <div>SwiftCode</div>
                  </th>
                  <th>
                    <div>操作</div>
                  </th>
                </tr>
              </thead>

              {bankKeys && bankKeys.length >= 1 && (
                <tbody className="ant-table-tbody">
                  {bankKeys.map((k, index) =>
                    !isEditing ? (
                      <tr key={`${k}_${index}`}>
                        <td>{_.get(bankCardList[index], "bankName", "")}</td>
                        <td>
                          {_.get(bankCardList[index], "bankAccountName", "")}
                        </td>
                        <td>
                          {_.get(bankCardList[index], "bankAccountId", "")}
                        </td>
                        <td>
                          {_.get(bankCardList[index], "settCurrency", "")}
                        </td>
                        <td>{_.get(bankCardList[index], "bankAddress", "")}</td>
                        <td>{_.get(bankCardList[index], "swiftCode", "")}</td>
                        <td></td>
                      </tr>
                    ) : (
                      <tr key={`${k}_${index}`}>
                        <td>
                          <Item
                            label=""
                            required
                            colon={false}
                            dataIndex={`bankCardList[${index}].bankName`}
                            rules={[
                              {
                                required: true,
                                message: "请输入公司开户银行名称",
                              },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input placeholder="请输入公司开户银行名称" />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            label=""
                            required
                            colon={false}
                            dataIndex={`bankCardList[${index}].bankAccountName`}
                            rules={[
                              { required: true, message: "请输入公司银行户名" },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input placeholder="请输入公司银行户名" />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            label=""
                            required
                            colon={false}
                            dataIndex={`bankCardList[${index}].bankAccountId`}
                            rules={[
                              { required: true, message: "请输入公司银行账号" },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input placeholder="请输入公司银行账号" />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            label=""
                            required
                            defaultValue="人民币"
                            colon={false}
                            dataIndex={`bankCardList[${index}].settCurrency`}
                            rules={[
                              { required: true, message: "请选择结算币种" },
                            ]}
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
                        </td>
                        <td>
                          <Item
                            label=""
                            required
                            colon={false}
                            dataIndex={`bankCardList[${index}].bankAddress`}
                            rules={[
                              { required: true, message: "请输入开户银行地址" },
                            ]}
                            isTrim={true}
                            decorator={
                              <Input placeholder="请输入开户银行地址" />
                            }
                          />
                        </td>
                        <td>
                          <Item
                            label=""
                            // required
                            colon={false}
                            dataIndex={`bankCardList[${index}].swiftCode`}
                            // rules={[
                            //   { required: true, message: "请输入SwiftCode" },
                            // ]}
                            isTrim={true}
                            decorator={<Input placeholder="请输入SwiftCode" />}
                          />
                        </td>
                        <td>
                          <a
                            className="u-form-link"
                            onClick={() => this.removeBankItem(k, index)}
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
            {!(bankKeys && bankKeys.length >= 1) && (
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
    bankKeys: state.infoBase.bankKeys,
    bankUuid: state.infoBase.bankUuid,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Bank)
