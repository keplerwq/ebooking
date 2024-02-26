import React, { Component } from "react";
import "./detail.scss";
import Header from "src/components/Header";
import { message } from "src/components";
import { CheckCircleFilled } from '@ant-design/icons';
import { Button, Modal } from "antd";
import api from "src/api";
import _ from "lodash";
import Section from "src/components/Section";
import PdfPreview from "src/components/PdfPreview";

class BaseBiddingDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      data: [],
      visible: false,
      previewVis: false,
      file: {},
      modalTitle: "公告预览",
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    const { id } = this.props.match.params;
    const params = {
      projectId: id,
    };
    api.baseProjectDetail(params).then((res) => {
      if (res.code === 0) {
        this.setState({
          data: res.msg,
        });
      } else {
        message.error(res.msg);
      }
    });
  };

  handleOk = () => {
    const { id } = this.props.match.params;
    const params = {
      projectId: id,
    };
    api.baseProjectApply(params).then((res) => {
      this.setState({ visible: false });
      this.getList();
      if (res.code !== 0) {
        message.error(res.msg);
      }
    });
    // this.setState({ visible: false });
  };

  handleVis = (visible) => {
    this.setState({ visible });
  };

  handlePreviewVis = ({ previewVis, file = {}, modalTitle = "" }) => {
    this.setState({ previewVis, file, modalTitle });
  };

  mapApplyStatusToText = (status) => {
    if (typeof status !== "number") return "";
    if (status === 0) return "审核中";
    if (status === 1) return "已驳回";
    if (status === 2) return "已报名";
    if (status === 3) return "已结束";
    return "";
  };

  mapWinningStatusToText = (status) => {
    if (typeof status !== "number") return "";
    if (status === 1) {
      return "未中标";
    }
    if (status === 2) {
      return "已中标";
    }
    return "";
  };

  /**
   * @function 使用iframe下载
   * @params url {String}
   */
  downloadFile = (file) => {
    let url = (file && file.fileUrl) || "";
    if (!url) return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none"; // 防止影响页面
    iframe.style.height = 0; // 防止影响页面
    iframe.src = url;
    document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
    // 5分钟之后删除（onload方法对于下载链接不起作用，就先抠脚一下吧）
    setTimeout(() => {
      iframe.remove();
    }, 5 * 60 * 1000);
  };

  downloadFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      this.downloadFile(files[i]);
    }
  };

  render() {
    let { history } = this.props;
    let { data, file } = this.state;
    let { projectInfo = {}, applyInfo = {}, winningInfo = {} } = data;
    let statusToText = this.mapApplyStatusToText(applyInfo.applyStatus);
    let wstatusToText = this.mapWinningStatusToText(winningInfo.winningStatus);
    let status = (
      <div>
        {statusToText}
        &nbsp;&nbsp;
        {applyInfo.applyStatus == 1 &&
          (projectInfo.projectStatus == 1 ? (
            <a onClick={this.handleVis.bind(this, true)}>重新报名</a>
          ) : (
            <span className="text-gray">报名截止</span>
          ))}
        <br />
        {applyInfo.applyStatus == 1 && (
          <span>驳回原因：{applyInfo.operationInfo || ""}</span>
        )}
      </div>
    );
    const config = {
      baseInfo: [
        [
          { name: "项目名称：", value: projectInfo.projectName || "" },
          { name: "项目类型：", value: projectInfo.projectTypeName || "" },
        ],
        [
          {
            name: "报名截止时间：",
            value: projectInfo.applyDeadline || "",
            time: true,
          },
          {
            name: "招标公告：",
            value: (
              <span>
                <a
                  onClick={this.handlePreviewVis.bind(this, {
                    previewVis: true,
                    file: projectInfo.tenderNoticeFile,
                    modalTitle: "招标公告预览",
                  })}
                >
                  预览
                </a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  onClick={this.downloadFile.bind(
                    this,
                    projectInfo.tenderNoticeFile
                  )}
                >
                  下载
                </a>
              </span>
            ),
          },
        ],
        [
          {
            name: "招标文件：",
            value: _.isEmpty(projectInfo.tenderFiles) ? (
              <span className="text-gray" style={{ cursor: "not-allowed" }}>
                下载
              </span>
            ) : (
              <a
                onClick={this.downloadFiles.bind(this, projectInfo.tenderFiles)}
              >
                下载
              </a>
            ),
          },
          null,
        ],
      ],

      applyInfo: [
        [
          {
            name: "报名时间：",
            value: applyInfo.applyTime || "",
            time: true,
            format: "YYYY/MM/DD hh:mm",
          },
          null,
        ],
        [{ name: "状态：", value: status }, null],
      ],
      winningInfo: [
        [
          {
            name: (
              <div style={{ color: "#58cc92" }}>
                {winningInfo.winningStatus == 2 && (
                  <span>
                    <CheckCircleFilled />
                    &nbsp;&nbsp;
                  </span>
                )}

                <span
                  className={winningInfo.winningStatus == 2 ? "" : "text-gray"}
                >
                  {wstatusToText}
                </span>
              </div>
            ),
          },
          null,
        ],
        [
          {
            name: "中标公告：",
            value: (
              <span>
                <a
                  onClick={this.handlePreviewVis.bind(this, {
                    previewVis: true,
                    file: projectInfo.winningFile,
                    modalTitle: "中标公告预览",
                  })}
                >
                  预览
                </a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  onClick={this.downloadFile.bind(
                    this,
                    projectInfo.winningFile
                  )}
                >
                  下载
                </a>
              </span>
            ),
          },
          {
            name: "中标发布时间：",
            value: projectInfo.winningNoticeTime || "",
            time: true,
          },
        ],
      ],
    };

    return (
      <div className="base-detail">
        <Header name="&nbsp;投标详情" showBack history={history} />
        <div>
          <Section data={config.baseInfo} />
          <header className="b-header">报名信息</header>
          <Section data={config.applyInfo} />
          {!_.isEmpty(winningInfo) && (
            <div>
              <header className="b-header">中标信息</header>
              <Section data={config.winningInfo} />
            </div>
          )}
        </div>
        <Modal
          title="招标报名"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleVis.bind(this, false)}
          footer={[
            <Button key="submit" type="primary" onClick={this.handleOk}>
              提交
            </Button>,
            <Button key="back" onClick={this.handleVis.bind(this, false)}>
              取消
            </Button>,
          ]}
        >
          <p>
            欢迎您报名参加此项目，请认真阅读公告文件，若需相关资质证明等，请提前在供应商信息页面提交相关资质证明。点击下方提交按钮，即可报名。
          </p>
        </Modal>
        <Modal
          wrapClassName="base-detail-pdf-modal"
          // style={{ width: "960px!important" }}
          title={this.state.modalTitle}
          visible={this.state.previewVis}
          onOk={this.handlePreviewVis.bind(this, false)}
          onCancel={this.handlePreviewVis.bind(this, false)}
          footer={null}
        >
          <PdfPreview file={file}>
            <Button
              className="preview-btn"
              type="primary"
              onClick={this.handlePreviewVis.bind(this, false)}
            >
              关闭
            </Button>
          </PdfPreview>
        </Modal>
      </div>
    );
  }
}

export default function BaseBiddingDetailPage(props) { return <BaseBiddingDetail {...props} />; }