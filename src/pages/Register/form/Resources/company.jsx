// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Select, Radio, Cascader } from 'antd';
import { FormEx2, Address } from 'src/components';
import _ from 'lodash';
import './company.scss';


const { Item } = FormEx2;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

const maxLength = 50;
const textareaSize = {
  minRows: 2,
  maxRows: 4
};

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      currencyList: ["人民币", "美元", "港币", "日元", "欧元"]
    }
  }

  handleSubmit = (values) => {
    const { changeStep } = this.props.actions;
    changeStep(14);
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  }


  render() {

    const { registerForm } = this.props;
    const { currencyList } = this.state;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18, offset: 1 },
    };
    const formItemLayoutWrapper = {
      wrapperCol: { span: 18, offset: 6 }
    };

    return (

      <div className="m-company">

        <header>
          {/*<h1 className="u-tt">公司信息</h1>*/}
          <div className="u-subtt">填写公司信息，方便我们及时给您反馈</div>
        </header>

        <div className="u-form">
          <FormEx2
            defaultValues={registerForm}
            onValidate={(status) => {
              this.setState({ formValidate: status });
            }}
            onSubmit={(values) => {
              this.handleSubmit(values);
            }}
            onChange={this.onFormChange}
            ref={(f) => { this.form = f }}
          >


            <Item
              {...formItemLayout}
              label="企业名称"
              required
              colon={false}
              dataIndex="resourcesCompany.companyName"
              rules={[{ required: true, message: '请输入必须与营业执照名称相符的企业名称' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="请输入企业名称(必须与营业执照名称相符)" />
              }
            />

            <Item
              {...formItemLayoutWrapper}
              className="u-radio-gp"
              dataIndex="resourcesCompany.area.country"
              rules={[{ required: true, message: '请选择国家' },]}
              decorator={
                <RadioGroup >
                  <RadioButton value="china">大陆</RadioButton>
                  <RadioButton value="foreign">海外</RadioButton>
                </RadioGroup>
              }
            />

            {
              _.get(registerForm, 'resourcesCompany.area.country', '') !== 'foreign' &&
              <Item
                {...formItemLayout}
                label="联系地址"
                required
                colon={false}
                dataIndex="resourcesCompany.areaArray"
                rules={[{ required: true, message: '请选择省市区' },]}
                decorator={
                  <Cascader options={Address} placeholder="省/市/区" />
                }
              />

            }

            <Item
              {...formItemLayout}
              label="详细地址"
              required
              colon={false}
              dataIndex="resourcesCompany.companyAddress"
              rules={[{ required: true, message: '请填写详细地址' },]}
              decorator={
                <TextArea maxLength={maxLength} autoSize={textareaSize} placeholder="详细地址：如道路、门牌号、楼梯号、单元室等" />
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="法定代表人"
              required
              rules={[{ required: true, message: '请输入企业法定代表人姓名' },]}
              dataIndex="resourcesQualification.legalRepresentative"
              decorator={
                <Input maxLength={maxLength} placeholder="请输入企业法定代表人姓名" />
              }
            />
            <Item
              {...formItemLayout}
              className="u-radio-gp"
              label="供应级别"
              colon={false}
              required
              dataIndex="resourcesCompany.companyType"
              rules={[{ required: true, message: '请选择供应级别' }]}
              decorator={
                <RadioGroup >
                  <RadioButton value={1}>原厂商</RadioButton>
                  <RadioButton value={2}>代理商</RadioButton>
                  <RadioButton value={0}>其他</RadioButton>
                </RadioGroup>
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="开户名"
              required
              rules={[{ required: true, message: '请输入银行开户名' },]}
              dataIndex="resourcesQualification.accountName"
              decorator={
                <Input maxLength={500} placeholder="请输入银行开户名" />
              }
            />

            <Item
              {...formItemLayout}
              colon={false}
              label="开户银行"
              required
              rules={[{ required: true, message: '请输入开户银行' },]}
              dataIndex="resourcesQualification.bank"
              decorator={
                <Input maxLength={500} placeholder="请输入开户银行" />
              }
            />

            <Item
              {...formItemLayout}
              colon={false}
              label="付款账号"
              required
              rules={[{ required: true, message: '请输入付款账号' },]}
              dataIndex="resourcesQualification.bankAccountId"
              decorator={
                <Input maxLength={maxLength} placeholder="请输入付款账号" />
              }
            />
            {/*资源类*/}
            <Item
              {...formItemLayout}
              label="工商注册地址"
              required
              colon={false}
              dataIndex="resourcesQualification.registerAddress"
              rules={[{ required: true, message: '请输入工商注册地址' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="请填写工商注册地址" />
              }
            />

            {
              _.get(registerForm, 'resourcesCompany.area.country', '') === 'foreign' &&
              <Item
                {...formItemLayout}
                label="结算货币"
                required
                colon={false}
                dataIndex="resourcesQualification.settCurrency"
                rules={[{ required: true, message: '请选择结算货币' },]}
                decorator={
                  <Select placeholder="请选择结算货币" >
                    {currencyList.map((value) => <Option key={value} value={value}>{value}</Option>)}
                  </Select>
                }
              />
            }

            {
              _.get(registerForm, 'resourcesCompany.area.country', '') === 'foreign' &&
              _.get(registerForm, 'resourcesQualification.settCurrency', '') &&
              _.get(registerForm, 'resourcesQualification.settCurrency', '') !== '人民币' &&
              <span>
                <Item
                  {...formItemLayout}
                  label="Bank Address"
                  required
                  colon={false}
                  dataIndex="resourcesQualification.bankAddress"
                  rules={[{ required: true, message: '请输入Bank Address' },]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入Bank Address" />
                  }
                />
                <Item
                  {...formItemLayout}
                  label="Swift Code"
                  required
                  colon={false}
                  dataIndex="resourcesQualification.swiftCode"
                  rules={[{ required: true, message: '请输入Swift Code' },]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入Swift Code" />
                  }
                />
              </span>
            }

            <div className="u-next">
              <Button type="primary" htmlType="submit" >下一步</Button>
              {/* <Button  type="primary" htmlType="submit" >保存</Button>  */}
            </div>
          </FormEx2>

        </div>

        <div className="m-intro">

          <p>注：填写过程中在点击提交资料审核前请勿关闭或刷新页面，否则已填写信息将会丢失。</p>

        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
  };
}


export default connect(mapStateToProps, dispatchs('app', 'register'))(Company)
