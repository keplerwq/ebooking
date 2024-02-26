import React, { Component } from 'react';
import { ModalEx } from 'src/components';
class InfoConfirm extends Component {

  render() {
    return (
      <div style={{ lineHeight: '60px' }}>信息变更需要重新审核,是否提交?</div>
    )
  }

}


export default function infoConfirm(data = {}, onOk, onCancel) {
  const title = `确认`;
  ModalEx.confirm({
    title,
    content: <InfoConfirm data={data} />,
    width: 560,
    onOk,
    onCancel,
    okText: '提交审核',
  });
}
