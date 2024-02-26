import React, { PureComponent } from 'react';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import _ from 'lodash';
import './StateIcon.scss';

export default class StateIcon extends PureComponent {
  static defaultProps = {
    status: {
      text: "",
      type: "ghost-blue",
      icon: "",
      step: "",
      showLine: true,
      lineColor: "gray",
      textColor: "gray"
    }
  }

  componentWillReceiveProps(nextProps) {

  }


  render() {
    const { status } = this.props;
    return (
      <div className="m-state-icon">
        <div className="m-row">
          <div className={`u-btn u-${status.type}`}>
            {status.icon ? <LegacyIcon type={status.icon} /> : ''}
            {status.step ? <span className={`u-${status.textColor}`}>{status.step}</span> : ''}
          </div>
          {status.showLine ? <div className={`u-line u-line-${status.lineColor}`} ></div> : ''}
        </div >

        <div className={`u-text u-text-${status.textColor}`}>{status.text}</div>
      </div >
    );
  }
}