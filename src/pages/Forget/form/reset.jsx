// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import { FormEx2, ModalEx, message } from 'src/components';
import api from 'src/api';
import store from 'src/redux/create';
import { descriptor} from 'src/libs';
import './reset.scss';

const { Item } = FormEx2;
const maxLength = 50;

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      formData: {}
    }
  }

  onFormChange = (values) => {
    
  } 

  handleSubmit = (values) => {
    const { email } = this.props; 
    values.email = email;
    console.log(this.props.history);
    api.resetPwd({...values}).then( res=> {
      message.loading('密码重置成功，即将跳转到登录页', 3, null, false);
      setTimeout(() => {
        this.props.history.push('/login');
      }, 3000);
    });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.form;
    if (value && value !== form.getValue('password')) {
      callback('两次密码输入不一致!');
    } else {
      callback();
    }
  }

  render() {
    const { formData } = this.state;

    return (

      <div className="m-reset">

        <header>
          <div className="u-tt">
            <h1>密码重置</h1>
          </div>
          <h2 className="u-subtt">填写准确的帐号信息有助于您快速找回密码</h2>
        </header>

        <div className="u-form">
          <FormEx2
            defaultValues={formData}
            onValidate={(status)=> { 
              this.setState({formValidate: status});
            }}
            onSubmit={(values)=>{   
              this.handleSubmit(values);
            }}
            ref={(f) => { this.form = f}}
            onChange={this.onFormChange}
          >

            <Item
              dataIndex="password"
              rules={[{ required: true, message: '请输入密码' }, descriptor.password]}
              decorator={
                <Input maxLength={maxLength} placeholder="新密码" type="password"/>
              }
            />
            <Item
              trigger='onBlur'
              dataIndex="confirmPassword"
              rules={[{ required: true, message: '请确认密码', trigger: 'onBlur' },{
                validator: this.compareToFirstPassword,
              }]}
              decorator={
                <Input maxLength={maxLength} placeholder="确认新密码" type="password"/>
              }
            />

            <div className="u-next">        
              <Button  type="primary" htmlType="submit">去登录系统</Button> 
              {/* <Button  type="primary" htmlType="submit" >保存</Button>  */}
            </div>
          </FormEx2>

        </div>

      </div>

    )
  }
}

const mapStateToProps = () => {
  return {
  };
}

const AccountWithConnect = connect(mapStateToProps, dispatchs('app', 'register'))(Account)

export function editAccount(data, callback) {

  ModalEx.confirm({
    title: '编辑账户信息',
    content: <AccountWithConnect store={store} data={data} callback={callback} />,
    width: 600,
    footer: null,
  });
}

export default AccountWithConnect