import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, message } from 'antd';
import api from 'src/api';
import { connect } from 'react-redux';

const { Item } = Form;

class ChangePasswordForm extends React.Component {

  constructor(props) {
    super(props);
    this.Formstyle = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    }
  }

  handleSubmit = (e) => {
    console.log(e, 5555)
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        this.props.onSubmit && this.props.onSubmit(values);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { userInfo } = this.props;

    return (
      <div style={{ width: '300px', margin: '100px auto' }}>
        <Form
          onSubmit={this.handleSubmit}
        >
          <Item
            label="用户名"
            {...this.Formstyle}
          >{userInfo.groupName}
          </Item>
          <Item
            label="旧密码"
            {...this.Formstyle}
          >
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入旧密码' }],
            })(<Input type="password" placeholder="请输入旧密码" />)
            }
          </Item>
          <Item
            label="新密码"
            {...this.Formstyle}
          >
            {getFieldDecorator('new1', {
              rules: [{ required: true, message: '请输入新密码' }],
            })(
              <Input type="password" placeholder="请输入新密码" />)
            }
          </Item>
          <Item
            label="确认新密码"
            {...this.Formstyle}
          >
            {getFieldDecorator('new2', {
              rules: [{ required: true, message: '请再次输入新密码' }],
            })(
              <Input type="password" placeholder="请再次输入新密码" />)
            }
          </Item>
          <Item>
            <Button type="primary" htmlType="submit" >确认修改</Button>
          </Item>
        </Form>
      </div >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.app.userInfo,
  };
};

const ChangePasswordFormWithConnect = connect(mapStateToProps)(ChangePasswordForm)

const ChangePassword = (props) => {
  const onSubmit = (allValues) => {
    api.changePassword(allValues).then(res => {
      message.success('修改密码成功');
      props.history.push('/');
    })
  };
  const ChangePassword = Form.create({ name: 'normal_login' })(ChangePasswordFormWithConnect);
  return (
    <ChangePassword onSubmit={onSubmit} />
  );

};

export default ChangePassword;
