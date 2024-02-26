import React, { Component } from 'react';
import { ModalEx } from 'src/components';

class InfoConfirm extends Component {

  render() {
    return (
      <div style={{ lineHeight: '60px' }}>提交审核后，供应商信息将进行再次审核，审核过程中无法进行修改，是否确认提交？</div>
    )
  }

}


export default function infoConfirm(data = {}, onOk, onCancel) {
  const title = `是否确认提交供应商信息变更？`;
  ModalEx.confirm({
    title,
    content: <InfoConfirm data={data} />,
    width: 560,
    onOk,
    onCancel,
    okText: '确认',
  });
}
