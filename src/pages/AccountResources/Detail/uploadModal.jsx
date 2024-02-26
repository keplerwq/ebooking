import React, { Component } from 'react'
import { Modal, Button, Upload } from 'antd';
import api_config from "../../../api/api-config";
import { UploadOutlined } from '@ant-design/icons';

export default class UploadModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            fileList: [],
            isUpload: false,
            status: ''
        };
    }

    componentWillReceiveProps(nextProps) {
        const { visible, cloudSupplierFile, cloudSupplierFileName } = nextProps.uploadSupplier
        const { status } = nextProps
        let fileList = []
        let isUpload = true
        if (cloudSupplierFile) {
            fileList = [
                {
                    name: cloudSupplierFileName,
                    url: cloudSupplierFile
                }
            ]
            isUpload = false
        }
        this.setState({ visible, fileList, isUpload, status })
    }


    uploadOkClick = () => {
        if (this.state.fileList.length && this.state.isUpload) {
            let obj = {}
            const { msg } = this.state.fileList[0].response
            obj = {
                cloudSupplierFile: msg.url,
                cloudSupplierFileName: msg.name
            }
            this.props.uploadOkClick(obj)
        }
        this.uploadCancel()
    }

    uploadCancel = () => {
        this.setState({
            fileList: []
        })
        this.props.uploadCancel()
    }

    downloadHistoryFile = () => {
        if (this.state.fileList[0]) {
            const { url } = this.state.fileList[0]
            window.open(url, '_blank')
        }
    }

    handleOnChange = (info) => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1);

        fileList = fileList.map(file => {
            const { response = {} } = file
            const { msg = {} } = response
            if (msg && msg.url) {
                file.url = msg.url;
            }
            return file;
        });
        this.setState({
            fileList,
            isUpload: true
        })
    }

    render() {
        const uploadProps = {
            action: api_config.getIDCAccountUpload.url,
            withCredentials: true,
            name: 'file',
            onChange: this.handleOnChange
        };

        return (
            <>
                <Modal
                    visible={this.state.visible}
                    title="附件上传"
                    onOk={this.uploadOkClick}
                    onCancel={this.uploadCancel}
                    footer={[
                        <Button
                            key="download"
                            style={{float: 'left'}}
                            type="primary"
                            disabled={this.state.isUpload}
                            onClick={this.downloadHistoryFile}>
                            下载历史文件
                        </Button>,
                        <Button key="cancel" onClick={this.uploadCancel}>
                            取消
                        </Button>,
                        <Button
                            key='submit'
                            type="primary"
                            onClick={this.uploadOkClick}
                        >
                            确定
                        </Button>,
                    ]}
                >
                    <Upload
                        {...uploadProps}
                        disabled={this.state.status === '已确认' || this.state.status === '待审核'}
                        fileList={this.state.fileList}
                        style={{ textAlign: 'center' }}>
                        <div className="u-upload-block">
                            <Button disabled={this.state.status === '已确认' || this.state.status === '待审核'}><UploadOutlined /> 上传文件</Button>
                            <span style={{ fontSize: '10px' }}></span>
                        </div>
                    </Upload>
                </Modal>
            </>
        )
    }

}
