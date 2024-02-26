// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Button, Input, Row, Col, Radio, Tooltip,Select } from 'antd';
import { FormEx2, message } from 'src/components';
import { withRouter } from 'react-router-dom';
import { descriptor, } from 'src/libs';
import api from 'src/api';
import './account.scss';

const { Item } = FormEx2;
const maxLength = 50;

const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
  };
}

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newEdition: false,
      cutdown: 60,
      flagCode: false,
      flagEmail: true
    }
  }

  checkEdition() {
    // 使用新版本就往 typeList 里面加对应的 accountType
    const typeList = [10];

    const accountType = this.form.getValue('emailAccount.accountType');

    const isNewEdition = typeList.includes(accountType);

    if (isNewEdition === this.state.newEdition) return;

    this.setState({
      newEdition: isNewEdition,
    })
  }

  componentWillMount() {
    const { registerForm } = this.props;
    let query = this.props.match.params;
    let { type = 0 } = query;
    type = parseFloat(type)
    registerForm.emailAccount.accountType = type
    const { freshForm } = this.props.actions;
    freshForm(registerForm);
  }

  componentDidMount() {
    this.checkEdition();
  }

  componentDidUpdate() {
    this.checkEdition();
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  onFormChange = (values) => {
    const type = values.emailAccount.accountType;
    this.props.history.replace(`/register/${type}`);
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  handleSubmit = (values) => {
    this.checkValid(() => {
      const { changeStep } = this.props.actions;
      // debugger
      if (values.emailAccount.accountType === 0) {
        changeStep(2)
      } else if (values.emailAccount.accountType === 1 || values.emailAccount.accountType === 2) {
        changeStep(12)
      }else if(values.emailAccount.accountType === 10){
        changeStep(22)
      } else if (values.emailAccount.accountType === 20) {
        changeStep(32)
      }
    });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.form;
    if (value && value !== form.getValue('emailAccount.password')) {
      callback('两次密码输入不一致!');
    } else {
      callback();
    }
  }

  sendCode = () => {
    const { flagCode, newEdition } = this.state;
    if (!flagCode) {
      this.form.validateValue('emailAccount.email', (success, result) => {

        let emailRes = result.find(x => x.dataIndex === 'emailAccount.email');
        if (emailRes.status !== 'error') {
          const email = this.form.getValue('emailAccount.email');
          const accountType = this.form.getValue('emailAccount.accountType');

          const request = newEdition ?
            api.sendValidateCode.bind(null, email) :
            api.sendCode.bind(null, { email, accountType });

          request().then(res => {
            this.setState({flagCode: true});
            this.cutdown();
            message.success('发送成功', 3);
          });
        }
      });
    }
  }


  checkContactsHasRegister(res) {
    if (res.code !== '0') return;

    const { setContactsInfo } = this.props.actions;
    const {data} = res;

    setContactsInfo({
      'contactName': data?.username,
      'gender': data?.gender || 'male',
      'mobilePhone': data?.phoneNo,
      'hasPassword': Boolean(data?.accountId),
    });
  }

  checkValid = (cb) => {
    const email = this.form.getValue('emailAccount.email');
    const code = this.form.getValue('emailAccount.code');

    const request = this.state.newEdition ?
      api.validateCode :
      api.checkCodeReg;

    // validateCode
    request({
      email,
      code,
    }).then(res => {
      this.checkContactsHasRegister(res);
      cb && cb();
    });
  }

  cutdown = () => {
    if(this.state.cutdown === 0){
      this.setState({flagCode: false, cutdown: 60});
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

  hanldeEmailRule = (rule, value, callback) => {
    if(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)){
      this.setState({flagEmail: false});
      callback();
    } else {
      this.setState({flagEmail: true});
      callback();
    }
  }

  handlePasswordRule = (rule, value, callback) => {
    const {newEdition} = this.state;

    const rules = newEdition ? descriptor.passwordNewRule : descriptor.password;
    const { message, pattern } = rules;

    if (!pattern.test(value))
      callback(message);

    callback();
  }

  render() {
    const { registerForm } = this.props;
    const { flagCode, flagEmail, cutdown, newEdition} = this.state;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18, offset: 1 },
    };

    return (
      <div className="m-account">

        <header>
          <h1 className="u-tt">账户信息</h1>
        </header>

        <div className="u-form">
          <FormEx2
            defaultValues={registerForm}
            onSubmit={(values)=>{
              this.handleSubmit(values);
            }}
            ref={(f) => { this.form = f}}
            onChange={this.onFormChange}
            className="u-form-ex2"
          >

            <Item
              {...formItemLayout}
              label={<span>企业业务范围&nbsp;
                {/*<Tooltip title={<span>*/}
                {/*  <p>账户类型说明</p>*/}
                {/*  <p>1.集团通用采购提供IT电子采购、网易内购等通用类渠道</p>*/}
                {/*  <p>2.集团资源类供应商提供IDC、CDN、云服务、海外资源、固网及文印等服务</p>*/}
                {/*</span>}>*/}
                {/*  <Icon type="question-circle" theme="filled"/>*/}
                {/*</Tooltip>*/}
              </span>}
              colon={false}
              required
              dataIndex="emailAccount.accountType"
              rules={[{ required: true, message: '请输入账户类型' }]}
              decorator={
                <Radio.Group >
                  <Radio value={0}> {<span>通用类&nbsp;
                    <Tooltip title={<span>
                      <p>通用类指集团通用采购的IT电子采购</p>
                    </span>}>
                      <QuestionCircleFilled />
                    </Tooltip></span>}
                  </Radio>
                  <Radio value={1}> {<span>资源类（IDC、CDN、云等）&nbsp;
                    <Tooltip title={<span>
                      <p>资源类指供应商提供IDC、CDN、云服务、海外资源、固网等服务</p>
                    </span>}>
                      <QuestionCircleFilled />
                    </Tooltip></span>}</Radio>
                  <Radio value={2}> {<span>服务器及网络设备相关&nbsp;
                    <Tooltip title={<span>
                      <p>服务器及网络设备相关类指供应商提供服务器、刀框、网络设备及相关配件及耗材等硬件产品</p>
                    </span>}>
                      <QuestionCircleFilled />
                    </Tooltip></span>}</Radio>

                  <Radio value={10}> {<span>行政类&nbsp;
                    <Tooltip title={<span>
                      <p>集团行政类供应商提供行政办公用品、餐饮物品、广告及服务等相关商品及业务供应</p>
                    </span>}>
                      <QuestionCircleFilled />
                    </Tooltip></span>}</Radio>
                  <Radio value={20}> {<span>基建类&nbsp;
                    <Tooltip title={<span>
                      <p>工程管理、建筑施工及材料、设备等相关产品的供应商</p>
                    </span>}>
                      <QuestionCircleFilled />
                    </Tooltip></span>}</Radio>

                  {/*<Radio value={1}>集团资源类</Radio>*/}
                  {/*<Radio value={2}>服务器及网络设备相关</Radio>*/}
                </Radio.Group>
              }
            />

            <Item
              {...formItemLayout}
              label="注册邮箱"
              trigger='onBlur'
              colon={false}
              required
              dataIndex="emailAccount.email"
              rules={[{ required: true, message: '请输入用户名' }, descriptor.email,{validator: this.hanldeEmailRule}]}
              decorator={
                <Input maxLength={maxLength} placeholder="请输入邮箱地址，注册成功后不可修改" />
              }
            />
            <Item
              {...formItemLayout}
              label="邮箱验证码"
              required
              colon={false}
            >
              <Row className="m-tel">
                <Col span={16}>
                  <Item
                    trigger='onBlur'
                    dataIndex="emailAccount.code"
                    rules={[{ required: true, message: '请输入验证码' }, descriptor.code]}
                    decorator={
                      <Input maxLength={maxLength} placeholder="请填写验证码" className="u-code"/>
                    }
                  />
                </Col>  
                    
                <Col span={8}>
                  <Item
                    dataIndex="tel"
                    decorator={
                      <Button
                        className="u-tel"
                        disabled={flagCode || flagEmail}
                        onClick={this.sendCode}
                        style={flagCode || flagEmail ? {}: {color: '#1890ff'} }> 
                        { flagEmail ? "获取验证码" : flagCode ? `发送验证码${cutdown}`: "获取验证码"}
                      </Button> 
                    }
                  />
                </Col>

              </Row>
            </Item>
            {
              !newEdition &&
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
                {/*  help="6-16字符，前后不能有空格，区分大小写" */}
                <Item
                  {...formItemLayout}
                  label="确认密码"
                  required
                  colon={false}
                  trigger='onBlur'
                  dataIndex="emailAccount.confirmPassword"
                  rules={[{ required: true, message: '请再次输入密码' },{
                    validator: this.compareToFirstPassword,
                  }, descriptor.password]}
                  decorator={
                    <Input maxLength={maxLength} placeholder="请再次输入密码" type="password" autoComplete="new-password"/>
                  }
                />
              </>
            }
            <div className="u-next">        
              <Button  type="primary" htmlType="submit">下一步</Button>
            </div>
          </FormEx2>

        </div>

        <div className="m-intro">
          <h3>入驻流程：</h3>
          <p>1.申请成为网易供应商并提交您的真实准确的资质材料，其中包括：账户信息、联系人信息、公司信息、资质信息。</p>
          <p>2.进入资质审核阶段,并在7个工作日后反馈审核结果，审核结果将会发送至注册账户时所填写的企业邮箱，同时请保持手机畅通，以便工作人员随时联系您。</p>
          <p>注：每一个营业执照号所对应的企业只可使用公司邮箱注册一个账户；审核阶段不允许修改相关信息。</p>
          <p>填写过程中在点击提交资料审核前请勿关闭或刷新页面，否则已填写信息将会丢失。</p>

        </div>

      </div>
    );
  }
}


export default withRouter(
  connect(mapStateToProps, dispatchs('app', 'register'))(Account)
)
