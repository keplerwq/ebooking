// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Row, Col,} from 'antd';
import { FormEx2, message } from 'src/components';
import api from 'src/api';
import { descriptor,  } from 'src/libs';
import './find.scss';

const { Item } = FormEx2;

const maxLength = 50;

class Find extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      formData: {},
      cutdown: 60,
      flag: false,
    }
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  onFormChange = (values) => {
    this.setState({ formData: values });
  } 

  handleSubmit = (values) => {
    const { changeStep } = this.props;
    const { email, code } = values;
    api.checkCode({
      email, code
    }).then(res => {
      changeStep && changeStep(2, this.state.formData);
    });
    
  }

  sendCode = () => {
    const { flag } = this.state;
    if (!flag) {
      this.form.validateValue('email', (success, result) => {
        let emailRes = result.find(x => x.dataIndex === 'email');
        if (emailRes.status !== 'error') {
          this.setState({flag: true});
          this.cutdown();
          const email = this.form.getValue('email');
          api.sendCode({ email }).then(res => {
            message.success('发送成功', 3);
          });
        } 
      });
    }

  }

  cutdown = () => {
    if(this.state.cutdown === 0){
      this.setState({flag: false, cutdown: 60});
      return;
    }
    if(this.state.cutdown > 0){
      this.timer = setTimeout(() => {
        let _num = this.state.cutdown;
        this.setState({
          cutdown: -- _num
        });
        this.cutdown();
      }, 1000);
    }
  }

  render() {
    const { formData, flag, cutdown, formValidate } = this.state;

    return (

      <div className="m-find">

        <header>
          <div className="u-tt">
            <h1>密码找回</h1>
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
              dataIndex="email"
              rules={[{ required: true, message: '请输入用户名' }, descriptor.email]}
              decorator={
                <Input maxLength={maxLength} placeholder="请填写您注册的企业帐号/邮箱" />
              }
            />


            <Item>
              <Row className="m-tel">
                <Col span={16}>  
                  <Item 
                    dataIndex="code"
                    rules={[{ required: true, message: '请输入验证码' },]}
                    decorator={
                      <Input maxLength={maxLength} placeholder="请填写验证码" className="u-code"/>
                    }
                  />
                </Col>  
              
                <Col span={8}>
                  <Item
                    dataIndex="tel"
                    decorator={
                      <Button className="u-tel" disabled={flag} onClick={this.sendCode} style={flag ? {}: {color: '#1890ff'} }> 发送验证码 { flag && cutdown}</Button> 
                    }
                  />
                </Col>  

              </Row>
            </Item>


            <div className="u-next">        
              <Button  type="primary" htmlType="submit" disabled={!formValidate}>下一步</Button> 
            </div>
          </FormEx2>

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
export default connect(mapStateToProps, dispatchs('app', 'register'))(Find)