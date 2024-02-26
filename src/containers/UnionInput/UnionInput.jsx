import React, { PureComponent } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import './UnionInput.scss';

const TextArea = Input.TextArea;

export default class UnionInput extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: _.isPlainObject(props.value) ? props.value.inputValue : '',
      textValue: _.isPlainObject(props.value) ? props.value.textValue : '',
    };
  }

  static defaultProps = {
    rows: 3,
    inputPlaceholder: '*工单标题：请简述工单内容',
    textPlaceholder: '工单详情：请详细描述需求内容',
    inputMax: '251',
    textMax: '1001',
    onChange: () => {},
    // onPressEnter: () => {
    // },
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      inputValue: _.get(nextProps, 'value.inputValue', ''),
      textValue: _.get(nextProps, 'value.textValue', ''),
    });
  }

  onInputChange = (e) => {
    this.setState({ inputValue: e.target.value }, () => {
      this.props.onChange && this.props.onChange(this.state);
    });
  }

  onTextChange = (e) => {
    this.setState({ textValue: e.target.value }, () => {
      this.props.onChange && this.props.onChange(this.state);
    });
  }

  onEnter = (e) => {
    e.preventDefault();
    if (typeof(this.props.onPressEnter) === 'function') {
      this.props.onPressEnter();
    } else {
      this.textarea && this.textarea.focus();
    }
    
  }


  render() {
    return (
      <div 
        className="union-input"
        ref={ d => this.union = d} 
      >
        <Input 
          value={this.state.inputValue}
          placeholder={this.props.inputPlaceholder } 
          onChange={this.onInputChange}
          onPressEnter={ this.onEnter }
          maxLength={this.props.inputMax}
        />
        <div className="line" style={{margin: '5px 0'}}></div>
        <TextArea 
          value={this.state.textValue}
          rows={this.props.rows} 
          placeholder={this.props.textPlaceholder }
          onChange={this.onTextChange}
          maxLength={this.props.textMax}
          ref={ textarea => this.textarea = textarea}  
        />
      </div>
    )
  }
}