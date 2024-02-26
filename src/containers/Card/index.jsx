import React, { Component } from 'react';
import './Card.scss';
export default function Card(props) {
  return (
    <div className="g-card">
      <span className="u-card-title">报价{props.formListIndex} 
        {
          props.statusName ==='再次报价' ? null : <span>（{props.statusName}）</span>
        }</span>
      <span>
        <span>{props.supplierType}</span>
        {props.secondType && props.secondType !== 'N' && props.secondType !== ''
          ?
          <span>-{props.secondType}</span>
          :
          null}
      </span>
      {props.isEditing ? <span><span className="u-card-btn" onClick={props.copy}>复制</span> <span className="u-card-btn" onClick={props.del}>删除</span></span> : <span></span>}
    </div>)
}