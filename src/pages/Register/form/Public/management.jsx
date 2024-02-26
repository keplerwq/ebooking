// 公司经营状态
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Button,  message } from 'antd';
import api from 'src/api';
import _ from 'lodash';
import { convertPublicFormData } from 'src/helps/regFormSubmit'
import './management.scss';
import { Finance, Customer } from "./manageForm";

class Management extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
    }
  }
  
  onSubmitAll = () => {
    let validateFinance = false;
    let validateCustomer = false;
    let { customerKeys, financialKeys} = this.props;

    if (customerKeys && customerKeys.length <= 0) {
      validateCustomer = true;
    } else {
      this.customerRef.form.submit(() => {
        validateCustomer = true;
      });
    }

    if (financialKeys && financialKeys.length <= 0) {
      validateFinance = true;
    } else {
      this.financeRef.form.submit(() => {
        validateFinance = true;
      });
    }

   
    if (validateFinance && validateCustomer ) {
      const { registerForm } = this.props;
      const formData = _.cloneDeep(registerForm);
      const form = convertPublicFormData(formData);

      api.registerService(form).then((res) => {
        message.loading(
          "注册成功，即将跳转至登录页",
          3,
          null,
          false
        );
        setTimeout(() => {
          this.props.history.push("/login");
        }, 3000);
      });
    }
  };

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  }


  render() {
    return (
      <div className="m-public-management">

        <header>
          <h1 className="u-tt">公司经营状态</h1>
          <div className="u-subtt">请填写公司准确财务及主要客户信息，方便我们进行信息审核</div>
        </header>

        <section className="u-section">
          <Finance ref={(ref) => (this.financeRef = ref)} />
        </section>
        <section className="u-section">
          <Customer ref={(ref) => (this.customerRef = ref)} />
        </section>
        <div className="u-next">        
          <Button  type="primary" htmlType="submit" onClick={this.onSubmitAll} >提交审核</Button> 
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
    financialKeys: state.register.financialKeys,
    customerKeys: state.register.customerKeys,
  };
}

export default connect(mapStateToProps, dispatchs('app', 'register'))(Management)