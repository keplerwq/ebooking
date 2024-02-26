/**
 * 工具栏
 */
import React, { Component } from 'react';
// import './style.scss';

export default class ToolBar  extends Component {
  static defaultProps = {
  
  }


  componentDidMount(nextProps) {}

  render() {
    return (
      <div className={`g-toolbar ${this.props.className || ''}`} style={this.props.style} >
        {this.props.children}
      </div>
    )
  }
}

