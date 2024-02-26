import React, { Component } from 'react';
import { connect } from 'react-redux';
import api from 'src/api';
import { Table } from 'antd';
import { Grid } from 'src/components';
import { Content, TableContent, MenuTitle, } from 'src/containers';
import './Quoted.scss';
import KEYS from '../config';

class Quoted extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      status: 1,
      history: []
    };
  }

  componentDidMount() {

  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {

    const { searchKeyword, status, history } = this.state;
    // const params = {
    //   searchKeyword,
    //   status,
    // };

    const nextHistory = history.concat([{
      searchKeyword,
      status
    }]);
    this.setState({
      history: nextHistory,
    });
  }

  onEditCellChange = (value, dataIndex, record) => {
    console.log(value, dataIndex, record)
    const dataSource = { ...this.state.dataSource };
    const target = dataSource.list.find(item => item.id === record.id);
    if (target) {
      target[dataIndex] = value;
      target.totalPrice = (target.count || 0) * (target.price || 0);
      this.setState({ dataSource });
    }
  }

  onQuote = (record) => {
    console.log(record);
    api.supplyQuote().then(res => {

    });
  }

  onGridChange = (pagination, filters, sorter) => {   
    const { current, pageSize, } = pagination;
    const nextPagination = {
      pageNum: current,
      pageSize,
    }
    this.setState({ pagination: nextPagination}, () => {
      this.getList();
    });
    
  }

  render() {

    const columns = [
      {
        title: '品牌',
        dataIndex: 'brand',
      }, {
        title: '设备型号',
        dataIndex: 'model',
      }, {
        title: '配置',
        dataIndex: 'configuration',

      }, {
        title: '数量',
        dataIndex: 'count',
      }, {
        title: '单价',
        dataIndex: 'price',

      }, {
        title: '总价',
        dataIndex: 'totalPrice',
      }, {
        title: '含税',
        dataIndex: 'tax',

      }, {
        title: '备注',
        dataIndex: 'supplyRemark',
      },
    ];

    const items = [
      { name: '已报价', key: '/supplier/quoted' },
    ]

    const expandedRowRender = (record) => {
      const columns = [
        { title: '到货机房', dataIndex: 'arrivalSite', },
        { title: '数量', dataIndex: 'count', },
      ];

      return (
        <Table
          columns={columns}
          pagination={false}
          dataSource={record.arrivalSiteList}
        />
      );
    }



    return (

      <Content >
        <MenuTitle items={items} />

        <div className="m-supplier-quoted">

          <TableContent search={{
            value: this.state.searchKeyword,
            onChange: (e) => this.setState({ searchKeyword: e.target.value }),
            onPressEnter: this.getList,
          }}>
            <Grid
              KEYS = {KEYS}
              columns={columns}
              history={this.state.history}
              api={api.supplyQueryPriceList}
              rowKey="id"
              expandedRowRender={expandedRowRender}
            />
          </TableContent>
        </div>


      </Content>

    );
  }
}

export default function QuotedPage(props) { return <Quoted {...props} />; }