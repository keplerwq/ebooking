/**
 * @file   报价管理
 * @author olgaWu
 *
 */

import React, { Component } from 'react';
import _ from 'lodash';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Content, message } from 'src/components';
import '@ant-design/compatible/assets/index.css';
import {
  Button,
  Input,
  Select,
  Table,
  Tabs,
} from 'antd';
import api from 'src/api';
import './Quote.scss';
import { Link } from 'react-router-dom';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

class Quote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchParams: {
        requireType: '',
        state: '待报价',
        applicationId: ''
      },
      stateDataList: {},
      stateList: [
        {
          name: "待报价",
          value: "待报价",
          color: "#fff"
        },
        {
          name: "已报价",
          value: "已报价",
          color: "#fff"
        },
        {
          name: "已失效",
          value: "已失效",
          color: "#fff"
        }
      ],
      page: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
      requireTypeList: [
        "裸纤类",
        "云服务",
        "国际专线", // "国际线路类",
        "国内专线-电路", //new
        "DX专线", //new
        "CDN&P2P类",
        "IDC-主体机房",
        "IDC-外围节点机房",
        "其他" // new
      ],
      data: [],
    }
  }
  componentDidMount() {
    this.onSearch();
  }

    /**
     * @function 切换顶部状态菜单
     * @params {String} value
     * @params {String} name
    */
    onSearchStateChange = (value, name) => {
      const searchParams = { ...this.state.searchParams, [name]: value };
      this.setState({ searchParams }, () => this.onSearch());
    }
    onSearchParamsChange = (value, name) => {
      const searchParams = { ...this.state.searchParams, [name]: value };
      this.setState({ searchParams });
    }
    onSearch = () => {
      this.setState({ page: { ...this.state.page, current: 1 } }, () => {
        this.getList();
      });
    }
    onReset = () => {
      const { searchParams } = this.state;
      this.setState({
        searchParams: {
          ...searchParams,
          requireType: undefined,
          applicationId: '',
        }
      }, () => {
        this.onSearch();
      }, () => {
        console.log(this.state.searchParams);
      })
    }
    getList = () => {
      const { searchParams, page } = this.state;
      const { requireType, state, applicationId } = searchParams;
      const { current, pageSize } = page;
      const params = {
        requireType: requireType || '',
        applicationId,
        pageNum: current,
        pageSize
      }

      let apiName = 'getIDCQuoteList';
      if (state === '已报价') apiName = 'getIDCApprovalList';
      if (state === '已失效') apiName = 'getIDCInvalidList';
      this.setState({data:[]})
      api[apiName](params).then((res) => {
        if (res.code === 0) {
          let { page } = this.state;
          page.total = res.msg.count;
          this.setState({
            data: res.msg.list,
            page,
          });
          // 这边获取的是待报价 不包含筛选条件的总数所以需要在执行一遍
          this.props.actions.setQuotedTotal()
        } else {
          message.error(res.msg, 3);
        }
      });

    }

    pageSizeChange = (current, pageSize) => {
      let page = this.state.page;
      page.pageSize = pageSize;
      /* 改变分页条数后，返回第一页*/
      page.current = 1;
      this.setState({ page }, () => console.log(this.state.page), 'pageSizeChange');
      this.getList();
    }

    onPageChange = (current, pageSize) => {
      let page = this.state.page;
      page.current = current;
      this.setState({ page }, () => console.log(this.state.page), 'onPageChange')
      this.getList();
    }
    render() {
      const columns = [
        {
          title: '申请编号',
          dataIndex: 'applicationId',
          width: 120
        },
        {
          title: '项目名称',
          dataIndex: 'projectName',
          width: 180
        },
        {
          title: '预计开始时间',
          dataIndex: 'planStartTime',
          width: 160
        },
        {
          title: '商务负责人',
          dataIndex: 'tracker',
          width: 120
        },
        {
          title: '商务负责人邮箱',
          dataIndex: 'trackerEmail',
          width: 250
        },
        {
          title:'供应商简称',
          dataIndex:'supplierType',
          render: (text, record, index )=> <span>{record.supplierType} - {record.secondName}</span>,
          width:200
        },
        {
          title: '需求类别',
          dataIndex: 'requireType',
          width: 160
        },
        {
          title: '二级类目',
          dataIndex: 'secondType',
          width: 160
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: 160
        },
        {
          title: '操作',
          width: 130,
          render: (text, record) => {
            if (record.auth && record.auth.includes('报价')) {
              return <Link
                to={`/resourcesQuoteDetail/${record.applicationId}/${record.trackerEmail}/${record.supplierId}/${record.id}/edit`}
                key={text}
                style={{ wordWrap: "break-word", wordBreak: "break-all" }}
              >报价</Link>
            } else if (record.auth && record.auth.includes('查看')) {
              return <Link
                to={`/resourcesQuoteDetail/${record.applicationId}/${record.trackerEmail}/${record.supplierId}/${record.id}/detail`}
                key={text}
                style={{ wordWrap: "break-word", wordBreak: "break-all" }}
              >查看</Link>
            }else if(record.auth && record.auth.includes('再次报价')){
              return <Link
                to={`/resourcesQuoteDetail/${record.applicationId}/${record.trackerEmail}/${record.supplierId}/${record.id}/edit`}
                key={text}
                style={{ wordWrap: "break-word", wordBreak: "break-all" }}
              >再次报价</Link>
            }
          }
        },
      ]

      const columnsItem = {
        title: '计费项编号',
        dataIndex: 'purchaseIds',
        width: 160,
        render: (text, record) => {
          if (record.purchaseIds) {
            const list = _.get(record, 'purchaseIds', [])
            return list.map(item => <div key={item}>{item}</div>)
          }
        }
      };
      const { searchParams, page, data, stateList, requireTypeList, stateDataList } = this.state;
      if (searchParams.state === '已失效') {
        columns.pop()
      }
      if (["已报价"].includes(searchParams.state)) {
        columns.splice(1, 0, columnsItem);
      };
      return (
        <Content size="full">
          <div className="g-quote-resources">
            <div className="m-search-state">
              <Tabs activeKey={searchParams.state} onChange={(value) => { this.onSearchStateChange(value, 'state') }}>
                {
                  stateList.map(item =>
                    <TabPane
                      tab={
                        <span>
                          <span className="status-point" style={{ background: item.color }}></span>
                          {
                            `${item.name}
                           ${!_.isEmpty(stateDataList) && stateDataList[item.value] ? stateDataList[item.value].count === undefined ? '' : stateDataList[item.value].count : ''}
                          `
                          }
                        </span>
                      }
                      key={item.value}
                    >
                    </TabPane>)
                }
              </Tabs>
            </div>
            <div className="m-search">
              <div className="search-item">
                <label>需求类型</label>
                <Select
                  className="u-search-item"
                  value={searchParams.requireType}
                  onChange={(value) => { this.onSearchParamsChange(value, 'requireType') }}
                  allowClear
                  placeholder="请选择"
                >
                  {
                    requireTypeList.map(item =>
                      <Option
                        value={item}
                        key={item}
                      >
                        {item}
                      </Option>)
                  }
                </Select>
              </div>
              <div className="search-item">
                <label>申请编号</label>
                <Input
                  className="u-search-item"
                  value={searchParams.applicationId}
                  onChange={(e) => { this.onSearchParamsChange(e.target.value, 'applicationId') }}
                  allowClear
                  placeholder="请输入"
                ></Input>
              </div>
              <div className="search-item">
                <Button type="primary" onClick={this.onSearch} className="u-search" >搜索</Button>
                <Button onClick={this.onReset} className="u-reset">重置</Button>
              </div>

            </div>
            <div className="m-page-content">
              <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                scroll={{ y: 500 }}
                locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
                pagination={{
                  showSizeChanger: true,
                  onShowSizeChange: this.pageSizeChange,
                  total: page.total,
                  current: page.current,
                  onChange: this.onPageChange,
                  showTotal: (total, range) => `共有${total}条`,
                  pageSize: page.pageSize
                }}
                className="m-table"
              />
            </div>
          </div>

        </Content>
      )
    }
}

const mapStateToProps = () => ({})

const QuoteWithConnect = connect(mapStateToProps, dispatchs('quoteResources'))(Quote)

export default function QuoteWithConnectPage(props) { return <QuoteWithConnect {...props} />; }
