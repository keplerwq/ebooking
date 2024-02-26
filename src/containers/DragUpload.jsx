
import React from 'react';
import {  Upload } from 'antd';
import uploadIcon from 'src/resource/img/purchase/uploader.png';

const Dragger = Upload.Dragger;

export default function DragUpload(props) {
  return ( 
    <Dragger {...props} >
      <p className="ant-upload-drag-icon">
        <img src={uploadIcon} alt=""/>
      </p>
      <p className="ant-upload-hint">{props.desc}</p>
    </Dragger>
  )
}

