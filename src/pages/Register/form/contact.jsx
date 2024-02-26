// 联系信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import { FormEx2 } from 'src/components';
import { descriptor } from 'src/libs';
import './contact.scss';

const { Item } = FormEx2;

const maxLength = 50;
const telLength = 11;

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  } 

  handleSubmit = (values) => {
    const { changeStep } = this.props.actions;
    changeStep(3);
  }

  render() {
    const { registerForm } = this.props;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19, offset: 1 },
    };

    return (

      <div className="m-contact">

        <header>
        
          <h1 className="u-tt">联系人信息</h1>
          <div className="u-subtt">填写联系人信息，方便我们及时给您反馈</div>
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
              colon={false}
              label="姓名"
              required
              dataIndex="contact.contactName"
              rules={[{ required: true, message: '请输入联系人姓名' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="联系人姓名" />
              }
            />


            <Item
              {...formItemLayout}
              colon={false}
              label="职务"
              required
              dataIndex="contact.position"
              rules={[{ required: true, message: '请输入联系人职务' }]}
              decorator={
                <Input maxLength={20} placeholder="联系人职务" />
              }
            />  

            <Item
              {...formItemLayout}
              colon={false}
              label="手机号"
              required
              dataIndex="contact.mobilePhone"
              rules={[{ required: true, message: '请输入联系人手机号码' }, descriptor.telephone]}
              decorator={
                <Input maxLength={telLength} placeholder="联系人手机号码" />
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="邮箱"
              required
              dataIndex="contact.contactEmail"
              rules={[{ required: true, message: '请输入联系人邮箱' }, descriptor.email]}
              decorator={
                <Input maxLength={maxLength} placeholder="联系人邮箱" />
              }
            />


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
