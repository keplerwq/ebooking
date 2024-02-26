/**
 * 价格
 */
import React, { Component } from 'react';
import { Input, InputNumber, } from 'antd';
import _ from 'lodash';
export default class Price  extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }
  static defaultProps = {
    min: 0,
    step: 0.01,
    style: {
      width: 100,
    },
    precision: 2,
  }

  onChange = (e) => {
    let value = e.target.value || '0.00';
    value = value + '';
    if(!(/^\d*\.\d*$|^\d*$/.test(value))){
      console.log('111')
      return;
    }

    if((/^\.\d*$/.test(value))){
      value = '0' + value;
    }

    if ( /^\d*\.\d{3,}$/.test(value) ){
      value = _.floor(value, 2)
    }
    
    
    this.props.onChange && this.props.onChange(value);
  }

  componentDidMount(nextProps) {}

  render() {
    
    return (
     
      this.props.normal ? <InputNumber  {...this.props} /> : <InputNumber  {...this.props} /> 
    )
  }
}