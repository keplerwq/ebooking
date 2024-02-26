/**
 * 价格
 */
import React from 'react';
import { InputNumber, } from 'antd';

export default function Price(props) {

  const defaultProps = {
    min: 0,
    step: 0.01,
    style: {
      width: 100,
    },
    precision: 2,
  }
    
  return (
    <InputNumber  {...defaultProps} {...props} /> 
  )
}