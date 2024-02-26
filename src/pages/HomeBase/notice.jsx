import React, { Component } from "react";
import "./notice.scss";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import Header from "src/components/Header";
import { message } from "src/components";
import Section from "src/components/Section";
import PdfPreview from "src/components/PdfPreview";
import { Button, Modal } from "antd";
import api from "src/api";
import _ from "lodash";

class NoticeBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      type: "tender",
      visible: false,
      hasApply: false,
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    const { id, type } = this.props.match.params;
    const params = {
      projectId: id,
    };
    api.baseProjectDetail(params).then((res) => {
      if (res.code == 0) {
        this.setState({ data: res.msg, type });
      } else {
        message.error(res.msg);
      }
    });
    // this.setState({ data: data.dataNotice || {}, type });
  };

  goCheck = (btnText) => {
    if (btnText == "报名已截止") return;
    const { id, } = this.props.match.params;
    const { data } = this.state;
    const { applyInfo } = data;
    if (!_.isEmpty(applyInfo)) {
      this.props.history.push(`/baseBiddingDetail/${id}`);
    } else {
      this.setState({ visible: true });
    }
  };


  handleOk = () => {
    const { id } = this.props.match.params;
    const params = {
      projectId: id,
    };
    api.baseProjectApply(params).then((res) => {
      this.getList();
      if (res.code == 0) {
        this.setState({ visible: false });
      } else {
        this.setState({ visible: false });
        message.error(res.msg);
      }
    });
  };

  handleCancel = () => {
    this.setState({ visible: false });
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

  render() {
    console.log(this.props.updateForm);
    let { updateForm } = this.props;
    const { emailAccount = {} } = updateForm;
    let { status } = emailAccount;
    let { type, data } = this.state;

    let { projectInfo = {}, applyInfo = {} } = data;

    const {
      projectName,
      projectStatus,
      projectTypeName,
      applyDeadline,
      publishTime,
      winningCompanyNames,
    } = projectInfo;

    const winningCompanyNamesStr =
      (winningCompanyNames && winningCompanyNames.join("、")) || "";
    let { history } = this.props;

    let btnText;
    if (!_.isEmpty(applyInfo)) {
      btnText = "查看报名信息";
    } else {
      if (projectStatus == 1) {
        btnText = "立即报名";
      } else {
        btnText = "报名已截止";
      }
    }

    const config = {
      tender: {
        title: "招标公告",
        data: [
          [
            { name: "项目名称：", value: projectName },
            { name: "项目类型：", value: projectTypeName },
          ],
          [{ name: "报名截止时间：", value: applyDeadline, time: true }, null],
        ],
      },
      inquiry: {
        title: "询比价公告",
        data: [
          [
            { name: "项目名称：", value: projectName },
            { name: "项目类型：", value: projectTypeName },
          ],
          [{ name: "报名截止时间：", value: applyDeadline, time: true }, null],
        ],
      },
      winning: {
        title: "中标公告",
        data: [
          [
            { name: "项目名称：", value: projectName },
            { name: "项目类型：", value: projectTypeName },
          ],
          [
            { name: "报名截止时间：", value: applyDeadline, time: true },
            { name: "中标发布时间：", value: publishTime, time: true },
          ],
          [{ name: "中标单位：", value: winningCompanyNamesStr }, null],
        ],
      },
    };
    const title = (type && config[type].title) || "";
    const dataSource = (type && config[type].data) || [];
    let file;
    if (type == "tender" || type == "inquiry") {
      file = projectInfo.tenderNoticeFile;
    } else if (type == "winning") {
      file = projectInfo.winningFile;
    }

    return (
      <div className="base-notice">
        <Header
          name={`【${title}】${projectName}`}
          showBack
          history={history}
        />
        <Section data={dataSource} />
        <header className="b-header">{title}</header>
        <div className="b-content">
          <PdfPreview file={file}>
            <Button
              type="primary"
              onClick={this.downloadFile.bind(this, file)}
              // onClick={this.downloadFile.bind(
              //   this,
              //   "http://localhost:3300/static/media/1.673610ad.pdf"
              // )}
              className="preview-btn"
            >
              {/* href={pdf} target="_blank" */}
              下载公告
            </Button>
          </PdfPreview>
        </div>
        {type !== "winning" && (
          <div className="b-button">
            <Button
              type="primary"
              
              onClick={this.goCheck.bind(this, btnText)}
              disabled={btnText === "报名已截止"}
            >
              {btnText || ""}
            </Button>
          </div>
        )}
        <Modal
          title="招标报名"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={
            status !== 1
              ? [
                <Button key="back" onClick={this.handleCancel}>
                    关闭
                </Button>,
              ]
              : [
                <Button key="submit" type="primary" onClick={_.once(this.handleOk, 100)}>
                    提交
                </Button>,
                <Button key="back" onClick={this.handleCancel}>
                    取消
                </Button>,
              ]
          }
        >
          <p>
            {status !== 1
              ? "抱歉，您的注册申请尚在审核中，审核通过后才可参与招标报名。"
              : "欢迎您报名参加此项目，请认真阅读公告文件，若需相关资质证明等，请提前在供应商信息页面提交相关资质证明。点击下方提交按钮，即可报名。"}
          </p>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoBase.updateForm,
  };
};

const NoticeBaseWithConnect = connect(
  mapStateToProps,
  dispatchs("app"),
  null,
  { forwardRef: true }
)(NoticeBase)

export default function NoticeBaseWithConnectPage(props) { return <NoticeBaseWithConnect {...props} />; }