// 联系信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button, Input, Row, Col } from 'antd';
import { FormEx2 } from 'src/components';
import _ from 'lodash';
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
    changeStep(13);
  }

  render() {
    const { registerForm } = this.props;
    const accountType = _.get(registerForm, 'emailAccount.accountType', 1);

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 15, offset: 1 },
    };

    return (

      <div className="m-contact">

        <header>
          <h1 className="u-tt">联系人信息</h1>
          <div className="u-subtt">填写联系人信息，方便我们及时给您反馈</div>
        </header>

        <div className="u-form">
          {
            accountType === 1 ?
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
                  label="供应商商务对接人"
                  required
                  dataIndex="resourcesContact[0].contactName"
                  rules={[{ required: true, message: '请输入供应商商务对接人' },]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入供应商商务对接人" />
                  }
                />


                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商商务对接人电话"
                  required
                  dataIndex="resourcesContact[0].mobilePhone"
                  rules={[{ required: true, message: '请输入供应商商务对接人电话' }, descriptor.telephone]}
                  decorator={
                    <Input maxLength={telLength} placeholder="请输入供应商商务对接人电话" />
                  }
                />

                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商商务对接人邮箱"
                  required
                  dataIndex="resourcesContact[0].contactEmail"
                  rules={[{ required: true, message: '请输入供应商商务对接人邮箱' }, descriptor.email]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入供应商商务对接人邮箱" />
                  }
                />
                <Row >
                  <Col span={8}></Col>
                  <Col span={15} offset={1} style={{height: '0.5px',marginBottom: '24px',background: '#eee'}}></Col>
                </Row>

                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商技术对接人"
                  required
                  dataIndex="resourcesContact[1].contactName"
                  rules={[{ required: true, message: '请输入供应商技术对接人' }]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入供应商技术对接人" />
                  }
                />

                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商技术对接人电话"
                  required
                  dataIndex="resourcesContact[1].mobilePhone"
                  rules={[{ required: true, message: '请输入供应商技术对接人电话' }, descriptor.telephone]}
                  decorator={
                    <Input maxLength={telLength} placeholder="请输入供应商技术对接人电话" />
                  }
                />

                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商技术对接人邮箱"
                  required
                  dataIndex="resourcesContact[1].contactEmail"
                  rules={[{ required: true, message: '请输入供应商技术对接人邮箱' }, descriptor.email]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入供应商技术对接人邮箱" />
                  }
                />


                <div className="u-next">
                  <Button  type="primary" htmlType="submit" >下一步</Button>
                </div>
              </FormEx2>
              :
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
                  label="供应商商务对接人"
                  required
                  dataIndex="contact.contactName"
                  rules={[{ required: true, message: '请输入供应商商务对接人' },]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入供应商商务对接人" />
                  }
                />

                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商商务对接人电话"
                  required
                  dataIndex="contact.mobilePhone"
                  rules={[{ required: true, message: '请输入供应商商务对接人电话' }, descriptor.telephone]}
                  decorator={
                    <Input maxLength={telLength} placeholder="请输入供应商商务对接人电话" />
                  }
                />

                <Item
                  {...formItemLayout}
                  colon={false}
                  label="供应商商务对接人邮箱"
                  required
                  dataIndex="contact.contactEmail"
                  rules={[{ required: true, message: '请输入供应商商务对接人邮箱' }, descriptor.email]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请输入供应商商务对接人邮箱" />
                  }
                />

                <div className="u-next">
                  <Button  type="primary" htmlType="submit" >下一步</Button>
                </div>
              </FormEx2>
          }
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
