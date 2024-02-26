// 按资产编号发货弹窗组件
import { Modal, Upload, Button, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

interface ImportModalProps {
  visible?: boolean;
  onOk?(): void;
  onCancel?(): void;
  id: number;
}

let failBlob: any;

const ImportModal: React.FC<ImportModalProps> = (props) => {
  const [ajaxing, setAjaxing] = useState(false);
  const uploadConfig = {
    showUploadList: false,
    beforeUpload: (file) => {
      setAjaxing(true);
      const params = new FormData();
      params.append('file', file);
      params.append('poId', String(props.id));

      axios({
        method: 'post',
        url: '/supply/deliverSn',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: params,
        responseType: 'blob',
      })
        .then((res: any) => {
          if (res.headers['content-type'].indexOf('application/json') !== -1) {
            message.success('导入成功！');
            failBlob = undefined;
            setIsUpdateError(false);
          } else {
            failBlob = new Blob([res.data], {
              type: res.headers['content-type'],
            });
            console.log(failBlob);
            setIsUpdateError(true);
            message.error('导入失败，请下载错误模板');
          }
        })
        .catch((res) => {
          message.error('请求失败！请重试');
        })
        .finally(() => {
          setAjaxing(false);
        });

      return false;
    },
    accept: '.xlsx',
  };

  const [isUpdateError, setIsUpdateError] = useState(false);

  const downloadTpl = () => {
    window.open(`/supply/exportSnByPoId?id=${props.id}`);
  };

  const downloadFailTpl = () => {
    saveAs(failBlob, 'failSn.xlsx');
  };

  useEffect(() => {
    if (props.visible) {
      setIsUpdateError(() => false);
      failBlob = undefined;
    }
  }, [props.visible]);

  return (
    <Modal
      visible={props.visible}
      title="发货数据导入"
      destroyOnClose
      onCancel={props.onCancel}
      footer={
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            {isUpdateError ? (
              <Button type="primary" onClick={downloadFailTpl}>
                下载错误模板
              </Button>
            ) : (
              <Button type="primary" onClick={downloadTpl}>
                下载模板
              </Button>
            )}
          </div>
          <Button onClick={props.onCancel}>取消</Button>
          <Button type="primary" loading={ajaxing} onClick={props.onOk}>
            确定
          </Button>
        </div>
      }
    >
      <Upload {...uploadConfig}>
        <Button>
          {' '}
          <CloudUploadOutlined /> 上传
        </Button>
      </Upload>
    </Modal>
  );
};

export default ImportModal;
