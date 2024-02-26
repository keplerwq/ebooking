/**
 * 在 antd的message的基础上添加关闭按钮，使用方式参照antd
 * message.success(content, duration, onClose, withClose = true)
 */
import React from 'react';
import _ from 'lodash';
import { CloseOutlined } from '@ant-design/icons';
import { message } from 'antd';

const msg = (type, ...args) => {
  let instance = null;

  function handleClose() {
    instance();
  }
  args[3] = args[3] === undefined ? true : args[3];

  let messageType = message[type];
  // if (args.length > 0 && _.isString(args[0])) {
  if (args.length > 0) {
    if (args[3] === true) {
      args[0] = <span>{args[0]} <a className="nase-message-close" onClick={handleClose}><CloseOutlined /></a></span>;
    }

    instance = messageType(...args);
  }

  return instance;
}

const enhanceMsg = {
  success: (...args) => msg('success', ...args),
  error: (...args) => msg('error', ...args),
  info: (...args) => msg('info', ...args),
  warning: (...args) => msg('warning', ...args),
  warn: (...args) => msg('warn', ...args),
  loading: (...args) => msg('loading', ...args),
};

export default enhanceMsg;

// msg('success', 'aaa');
// msg('success', 'bbbb', 6, null, true);