import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import './Login.scss';
import { Link } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Tabs } from 'antd';
import api from 'src/api';
import iconLogo from 'src/resource/img/login/logo.png';
import { descriptor, } from 'src/libs';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const maxLength = 50;
const codeLength = 4;

function onTabsChange(key) {
  this.setState({
    loginType: key,
  }, this.onRefreshCode);
}


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeUrl: api._config.authCode.url,
      loginType: '1'
    }
  }

  componentDidMount() {
    // 一进入登录页面就清除部分缓存
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('NEW_EDITION');
    localStorage.removeItem('UPDATEFORM');
    localStorage.removeItem('FROMLISTKEY')
    localStorage.removeItem('FROMLIST')
    localStorage.removeItem('ID')
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {

        const { loginType } = this.state;

        if (loginType === '1')
          api.login(values).then((res) => {

            sessionStorage.setItem('isLinkToLogin', '0');
            /**
             * accountType
             * 0 通用类
             * 1 资源类
             * 2 服务器及网络设备相关
             */
            sessionStorage.setItem('isAccountType', res.data.accountType);
            sessionStorage.setItem('accountTypes', res.data.accountTypes);
            sessionStorage.setItem('oneType', res.data.oneType);
            if (res.data.accountType === 1 || res.data.accountType === 2) {
              this.props.history.push('/resourcesInfo');
            } else if (res.data.accountType === 20) {
              this.props.history.push('/baseInfo');
            } else if (res.data.accountType === 10) {
              this.props.history.push('/publicInfo');
            } else {
              this.props.history.push('/backlog');
            };
          });
        else if (loginType === '2')
        // 新版本登录
          api.loginService({
            grant_type: 'password_code',
            username: values.email,
            password: values.password,
            deviceId: 'web',
            validCode: values.code,
            // Authorization 是写死的，由后端提供
          }, {headers: {Authorization: 'Basic cHVyY2hhc2U6bmV0ZWFzZQ=='}}).then((res) => {
            // 清除旧环境中使用的值
            sessionStorage.removeItem('oneType');
            sessionStorage.removeItem('accountTypes');
            // 是否需要跳转登录的标记
            sessionStorage.setItem('isLinkToLogin', '0');
            //目前只有行政接入新版本，所以可以写死，后面接入其他业务后还是需要后台提供登录的类型的
            sessionStorage.setItem('isAccountType', '10');
            // 存储 token
            localStorage.setItem('ACCESS_TOKEN', res?.data?.access_token);
            // 是否为新版本系统
            localStorage.setItem('NEW_EDITION', 'true');
            // 新版本直接跳转到 default，由 default 页面请求后台权限接口判断跳转的初始页
            this.props.history.push('/default');
          });
      }
    });
  }

  onRefreshCode = () => {
    if (this.state.loginType === '1') {
      this.setState({codeUrl: `${api._config.authCode.url}?times=${Date.now()}`})
    } else {
      this.setState({codeUrl: `${api._config.authImgCode.url}?times=${Date.now()}`})
      // 新版本图像验证码
      // 因为这个版本的请求，后端需要帮忙添加 harder 参数，用来区分环境
      // 所以使用 ajax 请求
    //   api.authImgCode({}, { responseType: 'blob' })
    //     .then(({data: blob}) => this.setState({codeUrl: URL.createObjectURL(blob)}));
    }
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    let { codeUrl, loginType } = this.state;

    return (
      <div className="g-login">
        {/* <div className="login-bannar">
          <img src={iconLogo} alt="网易" />
        </div> */}
        <div className="m-login" >
          <header>
            <div className="u-logo">
              <img src={iconLogo} alt="网易"/>
            </div>
            <h2 className="u-salutatory">欢迎登录网易集团供应商管理系统</h2>
          </header>

          <Tabs style={{paddingLeft: 50, borderBottom: '1px solid #ccc'}} activeKey={loginType} onChange={onTabsChange.bind(this)}>
            <TabPane tab="供应商登录" key="1" />
            <TabPane tab="行政类供应商登录" key="2" />
          </Tabs>

          <Form onSubmit={this.handleSubmit} className="u-form">
            <FormItem>
              {getFieldDecorator('email', {
                rules: [{ required: true, message: '请输入用户名' }, descriptor.email],
              })(
                <Input placeholder="注册用户邮箱" maxLength={maxLength} size="large" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入密码' },],
              })(
                <Input type="password" placeholder="登录账号密码" maxLength={maxLength} size="large" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('code', {
                rules: [{ required: true, message: '请输入图中的验证码' },],
              })(
                <Input placeholder="请输入图片中的验证码" className="u-code " maxLength={codeLength} size="large" />
              )}
              <img src={codeUrl} alt="验证码" className="u-code-img" onClick={this.onRefreshCode.bind(this)} />
            </FormItem>
            {
              loginType === '1' &&
              <div className="u-forgot">
                <Link to="/forget">忘记密码?</Link>
              </div>
            }
            <Button type="primary" htmlType="submit" className="u-submit">登录</Button>

          </Form>

          <div  className="noAccount">没有账号？<Link to="/register">立即注册</Link></div>

          <footer className="u-footer">

          </footer>

        </div>

        <footer className="g-ft">
          <div>
            <span>
              <a href="https://jubao.163.com/" target="_blank" style={{color: "#1890FF"}}>廉正举报</a>
            </span>
          </div>
          <div>
            <span>
              <a href="http://beian.miit.gov.cn/" target="_blank" style={{}}>工业和信息化部备案管理系统&nbsp;&nbsp;粤B2-20090191-2</a>
            </span>
          </div>
          <span>网易公司版权所有 © 1997-2020</span>
        </footer>
      </div>
    )
  }

}

const mapStateToProps = () => ({})

const LoginWithForm = Form.create()(
  connect(mapStateToProps, dispatchs('app'))(Login)
);

export default  (props) => <LoginWithForm {...props} />