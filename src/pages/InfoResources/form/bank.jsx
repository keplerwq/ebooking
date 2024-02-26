// 银行卡信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Select, Modal } from 'antd';
import { FormEx2 } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../Info.scss';

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
    const { updateForm } = this.props
    const secondName = _.get(updateForm, `bankInfoList[${index}].secondSimpleName`, '')
    const accountType = _.get(updateForm, 'accountType', 0)

    // 硬件类有二级简称的银行卡不能删除
    if (secondName && accountType === 2) {
      Modal.error({
        title: '该银行卡信息不能删除！',
        content: '拥有企业二级简称的银行卡不支持删除操作'
      })
      return
    }
    const { bankKeys, bankUuid } = this.props;
    const { saveBankKeys } = this.props.actions;
    // if (bankKeys.length === 1) {
    //   return;
    // }
    saveBankKeys(bankKeys.filter(key => key !== k), bankUuid, () => {});

    let bank = _.cloneDeep(this.form.getValue('bankInfoList'));
    bank.splice(index, 1);
    this.form.setValue('bankInfoList', bank);
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
          buttonTitle="新增银行卡"
        />
        <table className="ant-table table-bank">
          <thead className="ant-table-thead">
            <tr>
              <th><div>开户行</div></th>
              <th><div>户名</div></th>
              <th><div>卡号</div></th>
              <th><div>二级简称</div></th>
              <th><div>币种</div></th>
              <th><div>开户行地址</div></th>
              <th><div>Bank Address</div></th>
              <th><div>SWIFT代码</div></th>
              {
                isEditing && <th><div>操作</div></th>
              }
            </tr>
          </thead>
          <tbody className="ant-table-tbody">
            {
              bankKeys.map((k, index) => (
                <tr key={index}>
                  <td>
                    {
                      <Item
                        label=""
                        required
                        dataIndex={`bankInfoList[${index}].bank`}
                        rules={[{ required: true, message: '请输入开户行' }]}
                        decorator={
                          isEditing ?
                            <Input maxLength={maxLength} placeholder="开户行" />
                            : <span>{_.get(updateForm, `bankInfoList[${index}].bank`, '')}</span>
                        }
                      />
                    }
                  </td>
                  <td>
                    {
                      <Item
                        label=""
                        required
                        dataIndex={`bankInfoList[${index}].accountName`}
                        rules={[{ required: true, message: '请填写户名' }]}
                        decorator={
                          isEditing ?
                            <Input maxLength={maxLength} placeholder="户主名" />
                            : <span>{_.get(updateForm, `bankInfoList[${index}].accountName`, '')}</span>
                        }
                      />
                    }
                  </td>
                  <td>
                    <Item
                      required
                      label=""
                      dataIndex={`bankInfoList[${index}].bankAccountId`}
                      rules={[{ required: true, message: '请输入银行卡号' }]}
                      decorator={
                        isEditing ?
                          <Input maxLength={bankLength} placeholder="银行卡号" />
                          : <span>{_.get(updateForm, `bankInfoList[${index}].bankAccountId`, '')}</span>
                      }
                    />
                  </td>
                  <td>
                    <Item
                      label=""
                      dataIndex={`bankInfoList[${index}].secondSimpleName`}
                      decorator={
                        <span>{
                          _.get(updateForm, `bankInfoList[${index}].secondSimpleName`, '') === '' ? '' :
                            `${_.get(updateForm, `bankInfoList[${index}].secondSimpleName`, '')}${_.get(updateForm, 'accountType', 0) === 2 ? '' : '-' + _.get(updateForm, `bankInfoList[${index}].secondNameType`, '')}`
                        }
                        </span>
                      }
                    />
                  </td>
                  <td>
                    <Item
                      required
                      label=""
                      dataIndex={`bankInfoList[${index}].settCurrency`}
                      rules={[{ required: true, message: '请选择结算币种' }]}
                      decorator={
                        isEditing ?
                          <Select placeholder="请选择结算货币" >
                            {currencyList.map((value) => <Option key={value} value={value}>{value}</Option>)}
                          </Select>
                          : <span>{_.get(updateForm, `bankInfoList[${index}].settCurrency`, '')}</span>
                      }
                    />
                  </td>
                  <td>
                    <Item
                      label=""
                      dataIndex={`bankInfoList[${index}].registerAddress`}
                      decorator={
                        isEditing ?
                          <Input maxLength={maxLength} placeholder="开户行地址" />
                          : <span>{_.get(updateForm, `bankInfoList[${index}].registerAddress`, '')}</span>
                      }
                    />
                  </td>
                  <td>
                    { _.get(updateForm, `bankInfoList[${index}].settCurrency`, '人民币') !== '人民币' &&
                      <Item
                        label=""
                        dataIndex={`bankInfoList[${index}].bankAddress`}
                        rules={[{ required: true, message: '请输入Bank Address' }]}
                        decorator={
                          isEditing ?
                            <Input maxLength={maxLength} placeholder="Bank Address" />
                            : <span>{_.get(updateForm, `bankInfoList[${index}].bankAddress`, '')}</span>
                        }
                      />
                    }
                  </td>
                  <td>
                    { _.get(updateForm, `bankInfoList[${index}].settCurrency`, '人民币') !== '人民币' &&
                      <Item
                        required
                        label=""
                        dataIndex={`bankInfoList[${index}].swiftCode`}
                        rules={[{ required: true, message: '请输入SWIFT代码' }]}
                        decorator={
                          isEditing ?
                            <Input maxLength={maxLength} placeholder="SWIFT代码" />
                            : <span>{_.get(updateForm, `bankInfoList[${index}].swiftCode`, '')}</span>
                        }
                      />
                    }
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
        </table>
      </FormEx2>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoResources.updateForm,
    bankKeys: state.infoResources.bankKeys,
    bankUuid: state.infoResources.bankUuid
  };
}

export default connect(mapStateToProps, dispatchs('app', 'infoResources'), null, { forwardRef: true })(Bank)
