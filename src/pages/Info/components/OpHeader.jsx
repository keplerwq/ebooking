import React, { Component } from 'react';
import './OpHeader.scss';
class OpHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  onEdit = () => {
    const { onEdit } = this.props;
    onEdit && onEdit();
  }

  render() {
   
    const {
      name, 
      // canEdit = true,
      // isEditing, 
      extraInfo 
    } = this.props;
    
    return (

      <header className="c-op-header">
        <span className="name">{name}</span>

        {/* {
          !isEditing && canEdit &&
          <a className="op" onClick={this.onEdit}>
            <img src={editPng} alt=""/>
            <span>修改信息</span>
          </a>
        }
        
        {
          isEditing && canEdit && <Button  type="primary" htmlType="submit" className="submit">确认</Button> 
        } */}

        {extraInfo && extraInfo}
          
      </header>
      
    )
  }
}

export default OpHeader