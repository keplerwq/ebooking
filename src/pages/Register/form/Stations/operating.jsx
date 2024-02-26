// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { Button  } from "antd";
import { message } from "src/components";
import _ from "lodash";
import "./operating.scss";
import { Finance, Insurance, Case, Fund } from "./operatingForm";
import { regBaseFormSubmit } from 'src/helps/regFormSubmit'
import api from "src/api";

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      currencyList: ["人民币", "美元", "港币", "日元", "欧元"],
    };
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  onSubmitAll = () => {
    let validateInsurance = false;
    let validateFund = false;
    let validateFinance = false;
    let validateCase = false;
    let { caseKeys } = this.props;

    this.insuranceRef.form.submit(() => {
      validateInsurance = true;
    });
   

    if (caseKeys && caseKeys.length >= 1) {
      this.caseRef.form.submit(() => {
        validateCase = true;
      });
    }else {
      validateCase = true;
    }
    this.financeRef.form.submit(() => {
      validateFinance = true;
    });

    this.fundRef.form.submit(() => {
      validateFund = true;
    });
   
    if (validateInsurance && validateFund && validateFinance && validateCase) {
      const { registerForm } = this.props;
      const formData = _.cloneDeep(registerForm);
      console.log(formData)
      const form = regBaseFormSubmit(formData);
      api.register(form).then((res) => {
        message.loading(
          "注册成功，即将跳转到登录页",
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

  render() {
    return (
      <div className="m-sation-operating">
        <header>
          <h1 className="u-tt">公司经营状态</h1>
          <div className="u-subtt">
            请填写公司准确的社保、出资、财务及案例信息，方便我们进行信息审核
          </div>
        </header>

        <section className="u-section">
          <Insurance ref={(ref) => (this.insuranceRef = ref)} />
        </section>
        <section className="u-section">
          <Fund ref={(ref) => (this.fundRef = ref)} />
        </section>
        <section className="u-section">
          <Finance ref={(ref) => (this.financeRef = ref)} />
        </section>
        <section className="u-section">
          <Case ref={(ref) => (this.caseRef = ref)} />
        </section>

        <div className="u-next">
          <Button type="primary" onClick={this.onSubmitAll}>
            提交审核
          </Button>
        </div>
        <div className="m-intro">
          <p>
            注：填写过程中在点击提交资料审核前请勿关闭或刷新页面，否则已填写信息将会丢失。
          </p>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    caseKeys: state.register.caseKeys,
    financeKeys: state.register.financeKeys,
    fundKeys: state.register.fundKeys,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register")
)(Company)