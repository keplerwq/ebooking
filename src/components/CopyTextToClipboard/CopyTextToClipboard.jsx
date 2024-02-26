/**
 * 拷贝内容到剪切板
 */
import React, { Component } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';

const defaultSuccessCallback = () => {
  message.success('复制成功');
}

function copyTextToClipboard(text, successCallback = defaultSuccessCallback, failCallback) {
  let textArea = document.createElement("textarea")
  textArea.style.width = '0';
  textArea.style.height = '0';
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    if (document.execCommand('copy'))
      successCallback && successCallback();
    else
      failCallback && failCallback();
  } catch (err) {
    failCallback && failCallback();
  }
  document.body.removeChild(textArea)
}

export default class CopyTextToClipboard extends Component {

  static defaultProps = {
    text: '', // 需要复制的内容
    successCallback: undefined, // 复制成功回调
    failCallback: undefined, // 复制失败回调
    title: '点击复制信息', // 鼠标hover文本
  }

  onCopy = () => {
    copyTextToClipboard(this.props.text, this.props.successCallback, this.props.failCallback);
  }

  render() {
    return this.props.children ?
      <span onClick={this.onCopy}>
        {this.props.children}
      </span> :
      <a title={this.props.title} onClick={this.onCopy}>
        <CopyOutlined />
      </a>;
  }
}