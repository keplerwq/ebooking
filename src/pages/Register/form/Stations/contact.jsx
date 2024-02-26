// 联系信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { Button } from "antd";
import { Business, Engineering, Legal } from "./contactForm";
import "./contact.scss";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
    };
  }
  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  onSubmitAll = () => {
    let validateBusiness = false;
    let validateEngineering = false;
    let validateLegal = false;

    this.businessRef.form.submit(() => {
      validateBusiness = true;
    });
    this.engineeringRef.form.submit(() => {
      validateEngineering = true;
    });
    this.legalRef.form.submit(() => {
      validateLegal = true;
    });
    if (validateBusiness && validateEngineering && validateLegal) {
      const { changeStep } = this.props.actions;
      changeStep(33);
    } else {
    }
  };

  render() {

    return (
      <div className="m-contact">
        <header>
          <h1 className="u-tt">人员信息</h1>
          <div className="u-subtt">
            请填写企业业务联系人、工程技术负责人、法定代表人联系信息，以便我们及时与您反馈及联系
          </div>
        </header>

        <section>
          <Business ref={(ref) => (this.businessRef = ref)} />
        </section>
        <section>
          <Engineering ref={(ref) => (this.engineeringRef = ref)} />
        </section>
        <section>
          <Legal ref={(ref) => (this.legalRef = ref)} />
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
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register")
)(Contact)