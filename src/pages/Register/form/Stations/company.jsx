// 账户信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { Button } from "antd";
import "./company.scss";
import { Authorization, Base, Branch, License } from "./companyForm";

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
    let validateBase = false;
    let validateLicense = false;
    let validateAuth = false;
    let validateBranch = false;
    let { authKeys, branchKeys } = this.props;

    this.baseRef.form.submit(() => {
      validateBase = true;
    });
    this.licenseRef.form.submit(() => {
      validateLicense = true;
    });

    if (authKeys && authKeys.length >= 1) {
      this.authRef.form.submit(() => {
        validateAuth = true;
      });
    } else {
      validateAuth = true;
    }


    if (branchKeys && branchKeys.length >= 1) {
      this.branchRef.form.submit(() => {
        validateBranch = true;
      });
    } else {
      validateBranch = true;
    }
    if (validateBase && validateLicense && validateAuth && validateBranch) {
      const { changeStep } = this.props.actions;
      changeStep(34);
    } else {
    }
  };

  render() {
    return (
      <div className="m-sation-company">
        <header>
          <h1 className="u-tt">公司信息</h1>
          <div className="u-subtt">
            请填写准确的公司及资质信息，方便我们进行信息审核
          </div>
        </header>

        <section className="u-section">
          <Base ref={(ref) => (this.baseRef = ref)} />
        </section>
        <section className="u-section">
          <License ref={(ref) => (this.licenseRef = ref)} />
        </section>
        <section className="u-section">
          <Authorization ref={(ref) => (this.authRef = ref)} />
        </section>
        <section className="u-section">
          <Branch ref={(ref) => (this.branchRef = ref)} />
        </section>

        <div className="u-next">
          <Button type="primary" onClick={this.onSubmitAll}>
            下一步
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
    authKeys: state.register.authKeys,
    branchKeys: state.register.branchKeys,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register")
)(Company)