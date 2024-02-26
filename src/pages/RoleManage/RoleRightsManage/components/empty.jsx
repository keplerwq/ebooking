
import React from 'react';
import style from '../.module.scss';

export default function Empty() {
  return (
    <div className={style.empty}>
      <i className={`iconfont icon-congzuocexuanze1 ${style.emptyIcon}`}/>
            请从左侧选择需要添加权限的模块
    </div>
  );
}