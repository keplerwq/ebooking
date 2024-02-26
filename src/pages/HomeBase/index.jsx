import React, { Component } from "react";
import { List } from "antd";
import { message } from "src/components";
import moment from "moment";
import api from "src/api";
import "./index.scss";

class HomeBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      page: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    let { page } = this.state;
    const { current, pageSize } = page;
    const params = {
      pageNum: current,
      pageSize,
    };
    api.baseIndex(params).then((res) => {
      if (res.code == 0) {
        page.total = res.msg.total;
        this.setState({
          data: res.msg.list || [],
          page,
        });
      } else {
        message.error(res.msg);
      }
    });
    // const res = data.dataIndex || {};
    // page.total = res.total;
    // this.setState({
    //   data: res.list || [],
    //   page,
    // });
  };

  pageSizeChange = (current, pageSize) => {
    let page = this.state.page;
    page.pageSize = pageSize;
    page.current = 1;
    this.setState(
      { page },
      () => {
        this.getList();
        console.log(this.state.page);
      },
      "pageSizeChange"
    );
  };

  onPageChange = (current, pageSize) => {
    let page = this.state.page;
    page.current = current;
    this.setState({ page }, () => console.log(this.state.page), "onPageChange");
    this.getList();
  };

  goPage = (projectId, type) => {
    // 招标 中标
    if (projectId && type) {
      this.props.history.push(`/baseNotice/${projectId}/${type}`);
    }
  };

  render() {
    const { data, page } = this.state;
    return (
      <div className="home-base">
        <List
          header={<div>项目公告</div>}
          pagination={{
            showSizeChanger: true,
            total: page.total || 0,
            current: page.current || 1,
            pageSize: page.pageSize || 10,
            showTotal: (total, range) => `共${total}条数据`,
            onShowSizeChange: this.pageSizeChange,
            onChange: this.onPageChange,
          }}
          dataSource={data}
          renderItem={({
            projectId = null,
            noticeType = "",
            noticeTypeName = "",
            projectName = "",
            applyDeadline,
            publishTime,
            projectStatus,
          }) => (
            <List.Item key={projectId}>
              <span
                className="pointer"
                onClick={this.goPage.bind(this, projectId, noticeType)}
              >
                【{noticeTypeName}】{projectName}
              </span>
              &nbsp;
              {noticeType !== "winning" &&
                (projectStatus == 1 ? (
                  <span className="text-green">
                    报名截止日期：
                    {applyDeadline &&
                      moment(applyDeadline).format("YYYY-MM-DD")}
                  </span>
                ) : (
                  <span className="text-gray">报名已截止</span>
                ))}
              <span className="text-gray fr">
                {publishTime && moment(publishTime).format("M-DD HH:mm")}
              </span>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default function HomeBasePage(props) { return <HomeBase {...props} />; }
