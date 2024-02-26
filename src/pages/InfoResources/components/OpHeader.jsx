import React, { Component } from 'react';
import { Button, } from 'antd';
import _ from 'lodash';
import './OpHeader.scss';

class OpHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  onClick() {
    const { clickMethod } = this.props;
    _.isFunction(clickMethod) && clickMethod();
  }

  render() {
   
    const { name, canEdit = true, isEditing, buttonTitle, extraInfo } = this.props;
    
    return (

      <header className="c-op-header">
        <span className="name">{name}</span>

        {
          canEdit && isEditing && buttonTitle &&
          <span className="edit-button">
            <Button type="primary" onClick={ () => { this.onClick() } } ghost>{buttonTitle}</Button>
          </span>
        }

        {extraInfo && extraInfo}
          
      </header>
      
    )
  }
}

export default OpHeader