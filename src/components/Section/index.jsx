import React, { Component } from "react";
import "./index.scss";
import moment from "moment";
import { Col, Row } from "antd";
export default class Header extends Component {
  static defaultProps = {
    data: {},
  };

  getCol = (data) => {
    const colLeft = {
      span: 6,
    };
    const colRight = {
      span: 14,
    };
    const col = {
      span: 12,
    };

    const name = data && data.name || "";
    let value = data && data.value || "";
    if (data && data.time) {
      let format = data.format || "YYYY-MM-DD";
      value = (value && moment(value).format(format)) || "";
    }
    return (
      <Col {...col}>
        <Row>
          <Col {...colLeft} className="col-name">{name}</Col>
          <Col {...colRight} className="col-value">{value}</Col>
        </Row>
      </Col>
    );
  };

  render() {
    const { data } = this.props;
    return (
      <div className="page-section">
        {data &&
          data.map((item, index) => (
            <Row className="section-row" key={index}>
              {this.getCol(item[0])}
              {this.getCol(item[1])}
            </Row>
          ))}
      </div>
    );
  }
}
