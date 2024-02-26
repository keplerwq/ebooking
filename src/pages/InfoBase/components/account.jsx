// 银行卡信息
import React, { Component } from "react";
import { connect } from "react-redux";
import dispatchs from "src/redux/dispatchs";
import _ from "lodash";
import { Row, Col } from "antd";
import "../infoBase.scss";

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const colLeft = {
      span: 5,
    };
    const colRight = {
      span: 19,
    };
    const col = {
      span: 12,
    };
    const { updateForm = {}} = this.props;
    const emailAccount = _.get(updateForm, "emailAccount", {});
    return (
      <div className="g-panel">
        <Row className="u-ct g-wrapper">
          <Col {...col}>
            <Row>
              <Col {...colLeft}>帐号：</Col>
              <Col {...colRight}>{_.get(emailAccount, "email", "")}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoBase.updateForm,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "infoBase"),
  null,
  { forwardRef: true }
)(Account)