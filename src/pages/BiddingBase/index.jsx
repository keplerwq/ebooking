import React, { Component } from "react";
import "./index.scss";
import Header from "src/components/Header";
import { message } from "src/components";
import { Input, Button, Table } from "antd";
import { Link } from "react-router-dom";
import api from 'src/api';

class BiddingBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      searchParams: {
        projectName: "",
        projectType: "",
      },
      page: {
        current: 1,
        total: 0,
        pageSize: 20,
      },
      data: [],
    };
  }

  componentDidMount() {
    this.onSearch();
  }

  onSearchParamsChange = (name, value) => {
    const searchParams = { ...this.state.searchParams, [name]: value };
    this.setState({ searchParams });
  };

  onSearch = () => {
    this.setState({ page: { ...this.state.page, current: 1 } }, () => {
      this.getList();
    });
  };

  onReset = () => {
    this.setState(
      {
        searchParams: {
          projectName: "",
          projectType: "",
        },
      },
      () => {
        this.onSearch();
      },
      () => {
        console.log(this.state.searchParams);
      }
    );
  };

  getList = () => {
    let { searchParams, page } = this.state;
    let projectName = searchParams.projectName.trim();
    let projectType = searchParams.projectType.trim();
    const { current, pageSize } = page;
    const params = {
      projectName,
      projectType,
      pageNum: current,
      pageSize,
    };

    // page.total = data.total;
    // this.setState({
    //   data: data.list,
    //   page,
    // });
    api.baseProjectList(params).then((res) => {
      if (res.code === 0) {
        let { page } = this.state;
        page.total = res.msg.total;
        this.setState({
          data: res.msg.list,
          page,
        });
      } else {
        message.error(res.msg);
      }
    });
  };

  pageSizeChange = (current, pageSize) => {
    let page = this.state.page;
    page.pageSize = pageSize;
    /* 改变分页条数后，返回第一页*/
    page.current = 1;
    this.setState(
      { page },
      () => {
        this.getList()
        console.log(this.state.page);
      },
      "pageSizeChange"
    );
    this.getList();
  };

  onPageChange = (current, pageSize) => {
    let page = this.state.page;
    page.current = current;
    this.setState({ page }, () => console.log(this.state.page), "onPageChange");
    this.getList();
  };

  onFormChange = (key, value) => {
    const { params } = this.state;
    this.setState({
      params: { ...params, [key]: value },
    });
  };

  render() {
    const columns = [
      {
        title: "项目名称",
        dataIndex: "projectName",
        width: 180,
      },
      {
        title: "项目类型",
        dataIndex: "projectTypeName",
        width: 160,
      },
      {
        title: "业务类型",
        dataIndex: "projectStatus",
        width: 250,
        render: (text, record) => {
          const bizType = record.bizType || [];
          const bizTypeStr = bizType.join("、") || "";
          return (
            <span>{bizTypeStr}</span>
          )
        }
      },
      {
        title: "项目状态",
        dataIndex: "winningStatusName",
        width: 130,
      },
      {
        title: "操作",
        width: 130,
        render: (text, record) => {
          // if (record.authority && record.authority.includes("查看详情")) {
          return (
            <Link
              to={`/baseBiddingDetail/${record.projectId}`}
              key={text}
              style={{ wordWrap: "break-word", wordBreak: "break-all" }}
            >
              查看详情
            </Link>
          );
        },
        // },
      },
    ];
    const formStyle = { width: 200, marginRight: 19 };
    const { searchParams, page, data } = this.state;
    return (
      <div>
        <Header name="投标管理" />
        <div className="search-wrapper">
          <span style={{ marginRight: 10 }}>项目名称：</span>
          <Input
            style={formStyle}
            value={searchParams.projectName}
            onChange={(e) =>
              this.onSearchParamsChange("projectName", e.target.value)
            }
            placeholder="请输入"
          ></Input>
          <span style={{ marginRight: 10 }}>项目类型：</span>
          <Input
            style={formStyle}
            value={searchParams.projectType}
            onChange={(e) =>
              this.onSearchParamsChange("projectType", e.target.value)
            }
            placeholder="请输入"
          ></Input>
          <Button
            type="primary"
            onClick={this.onSearch}
            style={{ marginRight: 20 }}
          >
            搜索
          </Button>
          <Button type="primary" ghost onClick={this.onReset}>
            重置
          </Button>
        </div>
        <div className="table-wrapper">
          <Table
            rowKey="projectId"
            columns={columns}
            dataSource={data}
            scroll={{ y: 500 }}
            locale={{ emptyText: "当前条件无结果，请检查筛选项" }}
            pagination={{
              showSizeChanger: true,
              onShowSizeChange: this.pageSizeChange,
              total: page.total,
              current: page.current,
              onChange: this.onPageChange,
              showTotal: (total, range) => `共有${total}条`,
              pageSize: page.pageSize,
            }}
            className="m-table"
          />
        </div>
      </div>
    );
  }
}

export default function BiddingBasePage(props) { return <BiddingBase {...props} />; }