import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Upload, Table } from 'antd';
import {
  UploadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import style from './BatchQuote.module.scss';

const status = {
  READY: 'READY',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const failColumns = [
  {
    dataIndex: 'rowNum',
    title: '行',
  },
  {
    dataIndex: 'bizCode',
    title: '需求子单',
  },
  {
    dataIndex: 'errorMsg',
    title: '失败原因',
  },
];

export default function BatchQuote(props) {
  const [state, setState] = useState(status.READY);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadFiles, setUploadFiles] = useState({});

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  const handleReUpload = () => setState(status.READY);

  const onDownloadTemplate = () => {
    props?.onDownloadTemplate?.();
  };

  const [succeedRes, setSucceedRes] = useState(undefined);
  const [failedRes, setFailedRes] = useState(undefined);

  const handleOk = () => {
    if (state === status.SUCCESS) {
      setIsModalVisible(false)
    } else {
      props.onSubmit(uploadFiles).then((result) => {
        const { state, data } = result;

        if (state) {
          setState(status.SUCCESS);
          setSucceedRes(data);
        } else {
          setState(status.FAIL);
          setFailedRes(data);
        }
      });
    }
  };

  const uploadConf = {
    name: 'file',
    maxCount: 1,
    beforeUpload: () => false,
  };

  useEffect(() => {
    if (!isModalVisible) setUploadFiles({});
  }, [isModalVisible]);

  const onUploadChange = (type, info) => {
    setUploadFiles({
      ...uploadFiles,
      [type]: info.fileList,
    });
  };

  const disableSubmit = useMemo(() => {
    return Object.values(uploadFiles)?.flat()?.length < 1;
  }, [uploadFiles]);

  return (
    <>
      <Button type="primary" onClick={showModal}>
        批量报价
      </Button>
      <Modal
        title="批量报价"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={
          <>
            { status.SUCCESS !== state && <Button
              className={style.downloadTemplate}
              onClick={onDownloadTemplate}
            >
              下载模版
            </Button>}
            {status.SUCCESS !== state && <Button key="back" onClick={handleCancel}>
              取消
            </Button>}

            <Button
              onClick={handleReUpload}
              style={{ display: state !== status.READY && status.SUCCESS !== state ? void 0 : 'none' }}
            >
              重新上传
            </Button>
            <Button
              key="submit"
              type="primary"
              loading={false}
              disabled={disableSubmit}
              onClick={handleOk}
            >
              确定
            </Button>
          </>
        }
      >
        <div
          className={style.uploadContent}
          style={{ display: state === status.READY ? void 0 : 'none' }}
        >
          <Upload
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            fileList={uploadFiles['data']}
            onChange={onUploadChange.bind(null, 'data')}
            {...uploadConf}
          >
            <div>
              <span onClick={(e) => e.stopPropagation()}>点击上传表格：</span>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </div>
            <p onClick={(e) => e.stopPropagation()} className={style.desc}>
              支持扩展名：.xlsx
            </p>
          </Upload>
        </div>

        <div
          className={style.content}
          style={{ display: state === status.SUCCESS ? void 0 : 'none' }}
        >
          <CheckCircleFilled style={{ fontSize: '64px', color: '#63d067' }} />
          <p className={style.contentTitle}>校验成功!</p>
          <p>{succeedRes}</p>
        </div>

        <div
          className={style.content}
          style={{ display: state === status.FAIL ? void 0 : 'none' }}
        >
          <CloseCircleFilled style={{ fontSize: '64px', color: '#e45151' }} />
          <p className={style.contentTitle}>校验失败!</p>
          <Table
            style={{ marginTop: 16 }}
            columns={failColumns}
            dataSource={failedRes}
            rowKey="line"
            pagination={false}
            size="small"
          />
        </div>
      </Modal>
    </>
  );
}
