import React, { Component } from "react";
import { Modal } from "antd";

const { confirm } = Modal;
class InfoConfirm extends Component {
  render() {
    const { data } = this.props;
    return <div style={{ lineHeight: "35px" }}>{data}</div>;
  }
}

export default function infoConfirm(data = {}, config = {}, onOk, onCancel) {
  config.content = <InfoConfirm data={data} />;
  config.onOk = onOk;
  config.onCancel = onCancel;
  confirm(config);
}
