import React, { Component } from 'react';
import './toolbar.scss';

export default function ToolBar(props) {
  return (
    <div className="nasa-toolbar" style={props.style || {}}>
      <div style={{float: 'left'}}>
        { props.left }
      </div>
      <div style={{float: 'right'}}>
        { props.right }
      </div>
      <div style={{clear: 'both'}}></div>
    </div>)
}