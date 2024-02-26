// 银行卡信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Select,Empty } from 'antd';
import { FormEx2 } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';

const { Item } = FormEx2;
const { Option } = Select;

const maxLength = 50;
const bankLength = 30;
class Bank extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    }
  }

  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
    this.setState({
      isEditing: false
    })

    this.props.hasSave && this.props.hasSave(true);

  }

  onEdit = () => {
    this.setState({
      isEditing: true
    });
    const { setEditStatus } = this.props.actions;
    setEditStatus('bank', true);
  }

  addBankItem = () => {
    let { bankKeys, bankUuid, } = this.props;
    const { saveBankKeys } = this.props.actions;
    const nextKeys = bankKeys.concat(bankUuid);
    bankUuid++;
    saveBankKeys(nextKeys, bankUuid);
  }

  removeBankItem = (k, index) => {
    const { bankKeys, bankUuid } = this.props;
    const { saveBankKeys } = this.props.actions;
    // if (bankKeys.length === 1) {
    //   return;
    // }
    saveBankKeys(bankKeys.filter(key => key !== k), bankUuid, () => {});

    let bank = _.cloneDeep(this.form.getValue('bankCardList'));
    bank.splice(index, 1);
    this.form.setValue('bankCardList', bank);
  }

  render() {
    const { updateForm = {}, isEditing = false, bankKeys = [] } = this.props;
    const { status } = updateForm;
    const canEdit = status !== 0;
    const currencyList = [
      '人民币',
      '美元',
      '日元',
      '港币',
      '欧元',
      '加元',
      '新加坡币',
      '澳元'
    ];

    return (
      <div id="sation-bank">
        <FormEx2
          defaultValues={updateForm}
          onSubmit={(values) => { this.handleSubmit(values); }}
          onChange={(values) => { this.onFormChange(values) }}
          ref={(f) => { this.form = f }}
        >
          <OpHeader
            name="银行卡信息"
            canEdit={canEdit && bankKeys.length < 10}
            isEditing={isEditing}
            clickMethod={() => this.addBankItem()}
            buttonTitle="添加银行卡"
          />
          <table className="ant-table table-bank">
            <thead className="ant-table-thead">
              <tr>
                <th><div>开户行<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>户名<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>卡号<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>结算币种<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>开户银行地址<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>SwiftCode</div></th>
                {
                  isEditing && <th><div>操作</div></th>
                }
              </tr>
            </thead>
            {bankKeys&&bankKeys.length>=1&&(
              <tbody className="ant-table-tbody">
                {
                  bankKeys.map((k, index) => (
                    <tr key={index}>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`bankCardList[${index}].bankName`}
                            rules={[{ required: true, message: '请输入开户行' }]}
                            decorator={
                              isEditing ?
                                <Input maxLength={maxLength} placeholder="开户行" />
                                : <span>{_.get(updateForm, `bankCardList[${index}].bankName`, '')}</span>
                            }
                          />
                        }
                      </td>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`bankCardList[${index}].bankAccountName`}
                            rules={[{ required: true, message: '请填写户名' }]}
                            decorator={
                              isEditing ?
                                <Input maxLength={maxLength} placeholder="户主名" />
                                : <span>{_.get(updateForm, `bankCardList[${index}].bankAccountName`, '')}</span>
                            }
                          />
                        }
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`bankCardList[${index}].bankAccountId`}
                          rules={[{ required: true, message: '请输入银行卡号' }]}
                          decorator={
                            isEditing ?
                              <Input maxLength={bankLength} placeholder="银行卡号" />
                              : <span>{_.get(updateForm, `bankCardList[${index}].bankAccountId`, '')}</span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`bankCardList[${index}].settCurrency`}
                          rules={[{ required: true, message: '请选择结算币种' }]}
                          decorator={
                            isEditing ?
                              <Select placeholder="请选择结算货币" >
                                {currencyList.map((value) => <Option key={value} value={value}>{value}</Option>)}
                              </Select>
                              : 
                              <span>{_.get(updateForm, `bankCardList[${index}].settCurrency`, '')}</span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          label=""
                          dataIndex={`bankCardList[${index}].bankAddress`}
                          rules={[{ required: true, message: '请填写开户行地址' }]}
                          decorator={
                            isEditing ?
                              <Input maxLength={maxLength} placeholder="开户行地址" />
                              : <span>{_.get(updateForm, `bankCardList[${index}].bankAddress`, '')}</span>
                          }
                        />
                      </td>
                      <td>
                        <Item
  
                          label=""
                          dataIndex={`bankCardList[${index}].swiftCode`}
                          // rules={_.get(updateForm, `bankInfoList[${index}].settCurrency`, '') !== '人民币'} 
                          decorator={
                            isEditing ?
                              <Input maxLength={maxLength} placeholder="SWIFT代码" />
                              : <span>{_.get(updateForm, `bankCardList[${index}].swiftCode`, '')}</span>
                          }
                        />
                      </td>
                      {
                        isEditing &&
                    <td>
                      <a onClick={() => this.removeBankItem(k, index)}>删除</a>
                    </td>
                      }
                    </tr>
                  ))
                }
              </tbody>
            )}
          </table>
          {!(bankKeys && bankKeys.length >= 1) && (
            <Empty
              style={{ marginTop: "10px" }}
              description={<span >暂无数据 </span>}
            ></Empty>
          )}
        </FormEx2>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    updateForm: state.infoPublic.updateForm,
    bankKeys: state.infoPublic.bankKeys,
    bankUuid: state.infoPublic.bankUuid
  };
}

export default connect(mapStateToProps, dispatchs('app', 'infoPublic'), null, { forwardRef: true })(Bank)
