// 联系人信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Select} from 'antd';
import { FormEx2 } from 'src/components';
import { descriptor } from 'src/libs';
import './contact.scss';

const { Item } = FormEx2;
const { Option } = Select;

const maxLength = 50;
const telLength = 11;

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      disabledWhenHasRegister: false,
      hasPassword: false,
    }
  }

  handlePasswordRule = (rule, value, callback) => {
    const { message, pattern } = descriptor.passwordNewRule;

    if (!pattern.test(value))
      callback(message);

    callback();
  }

  handleNameRule = (rule, value, callback) => {
    const { message, pattern } = descriptor.chinaName;
    const { disabledWhenHasRegister } = this.state;

    if (value?.match(/\*/g) && disabledWhenHasRegister)
      callback();
    else if (!value?.trim())
      callback('请输入联系人姓名');
    else if (!pattern.test(value))
      callback(message);

    callback();
  }

  handleTelephoneRule = (rule, value, callback) => {
    const { message, pattern } = descriptor.telephone;
    const { disabledWhenHasRegister } = this.state;

    if (value?.match(/\*/g) && disabledWhenHasRegister)
      callback();
    else if (!value?.trim())
      callback('请输入联系人手机号码');
    else if (!pattern.test(value))
      callback(message);

    callback();
  }


  compareToFirstPassword = (rule, value, callback) => {
    const form = this.form;
    if (value && value !== form.getValue('emailAccount.password')) {
      callback('两次密码输入不一致!');
    } else {
      callback();
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  } 

  handleSubmit = () => {
    const { changeStep } = this.props.actions;
    changeStep(23);
  }

  checkContactsHasRegister() {
    const form = this.form;

    const contactName = form.getValue('contactList.contactName');
    // 若已经带有脱敏字符（后端提供）, 则表示该用户在服务器已经存有数据
    if (contactName?.match(/\*/g)) {
      this.setState({disabledWhenHasRegister: true});
    }

    this.setState({
      hasPassword: form.getValue('contactList.hasPassword')
    })
  }

  componentDidMount() {
    this.checkContactsHasRegister();
  }

  render() {
    const { registerForm } = this.props;
    const { disabledWhenHasRegister, hasPassword } = this.state;

    const formItemLayout = {
      labelCol: { span: 7},
      wrapperCol: { span: 16, offset: 1 },
    };

    return (

      <div className="m-public-contact">

        <header>
          <h1 className="u-tt">联系人信息</h1>
          <div className="u-subtt">请联系人保持手机畅通，方便我们及时给您反馈</div>
        </header>

        <div className="u-form">
          <FormEx2
            defaultValues={registerForm}
            onValidate={(status)=> { 
              this.setState({formValidate: status});
            }}
            onSubmit={(values)=>{   
              this.handleSubmit(values);
            }}
            onChange={this.onFormChange}
            ref={(f) => { this.form = f}}
          >

            <Item
              {...formItemLayout}
              label="联系人姓名"
              isTrim={true}
              required
              colon={false}
              style={{width:"100%"}}
            >
              <Item
                trigger='onBlur'
                colon={false}
                label=""
                required
                dataIndex="contactList.contactName"
                style={{
                  display:"inline-block",
                  width:"calc(100%-90px)",
                }}
                rules={[{validator: this.handleNameRule}]}
                decorator = {
                  <Input style={{width:"90%"}} disabled={disabledWhenHasRegister}  placeholder="请输入联系人姓名" />
                }
              />
        
              <Item
                colon={false}
                label=""
                dataIndex="contactList.gender"
                style={{
                  display: "inline-block",
                  width: "90px"
                }}
                decorator = {
                  <Select disabled={disabledWhenHasRegister} placeholder='请选择'>
                    <Option value="male">先生</Option>
                    <Option value="female">女士</Option>
                  </Select>
                }
              />
            </Item>


            <Item
              {...formItemLayout}
              trigger='onBlur'
              colon={false}
              label="手机号"
              required
              dataIndex="contactList.mobilePhone"
              rules={[{validator: this.handleTelephoneRule}]}
              decorator={
                <Input disabled={disabledWhenHasRegister} maxLength={telLength} placeholder="请输入联系人手机号码" />
              }
            />


            <Item
              {...formItemLayout}
              trigger='onBlur'
              colon={false}
              label="职务"
              required
              isTrim={true}
              dataIndex="contactList.position"
              rules={[{ required: true, message: '请输入联系人职务' }]}
              decorator={
                <Input maxLength={20} placeholder="请输入联系人职务" />
              }
            />
            {
              !hasPassword &&
              <>
                <input type="password" style={{display: 'none'}}/>
                <Item
                  {...formItemLayout}
                  trigger='onBlur'
                  label="密码"
                  required
                  colon={false}
                  dataIndex="emailAccount.password"
                  rules={[{ required: true, message: '请输入密码' }, { validator: this.handlePasswordRule }]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入密码" type="password" autoComplete="new-password"/>
                  }
                />
                <input type="password" style={{display: 'none'}}/>
                <Item
                  {...formItemLayout}
                  label="确认密码"
                  required
                  colon={false}
                  trigger='onBlur'
                  dataIndex="emailAccount.confirmPassword"
                  rules={[{ required: true, message: '请再次输入密码', trigger: 'onBlur' },{
                    validator: this.compareToFirstPassword,
                  }, descriptor.password]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请再次输入密码" type="password" autoComplete="new-password"/>
                  }
                />
              </>
            }

            <div className="u-next">        
              <Button  type="primary" htmlType="submit" >下一步</Button> 
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

export default connect(mapStateToProps, dispatchs('app', 'register'))(Contact)
