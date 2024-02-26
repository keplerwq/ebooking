
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import qs from 'qs';
import { Content, message } from 'src/components';
import { Button, Select, Table, Tabs, DatePicker, Modal, Popconfirm } from 'antd';
import api from 'src/api';
import moment from 'moment';
import importAccount from './importAccount';
import './AccountResources.scss';
import { Link } from 'react-router-dom';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { MonthPicker } = DatePicker;


class AccountResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 'large',
      visible:false,
      searchParams: {
        type: '',
        status: '待复核',
        startTime: undefined,
        endTime: undefined,
      },
      stateDataList: {},
      stateList: [
        {
          name: "已提交账单",
          value: "待审核",
          color: "#fff"
        },
        {
          name: "待核对账单",
          value: "待复核",
          color: "#fff"
        },
        {
          name: "已确认账单",
          value: "已确认",
          color: "#fff"
        },{
          name: "草稿账单",
          value: "草稿",
          color: "#fff"
        }
      ],
      orderType: ["账单类型1", "账单类型2"],
      data: [{}],
      page: {
        current: 1,
        total: 0,
        pageSize: 10,
        total1:0,
        total2:0,
        total3:0,
        total4:0,
      },
    };

  }

  componentDidMount() {
    // let query = this.props.match.params;
    const params = qs.parse(this.props.location.search.substring(1));
    const searchParams = { ...this.state.searchParams, ...params };
    this.setState({
      searchParams, page: {
        pageNum: params.current,
        total: 0,
        pageSize:10
      }
    },
    () => this.getList()
    );
    /* 账单数量 */
    // this.getStateList();
    /* 账单类型列表 */
    this.getOrderType();
    this.gettab1();
    this.gettab2();
    this.gettab3();
    this.gettab4();


    // qs.parse(window.location.search)
  }

  componentWillReceiveProps(props) {
  }


  onSearchParamsChange = (value, name) => {
    const searchParams = { ...this.state.searchParams, [name]: value };
    this.setState({ searchParams });
  }

  onHandleDel = (id) => {
    api.deleteBillDraft({
      id
    }).then(({ code }) => {
      if (code === 0) {
        message.success('删除草稿成功')
        this.getList()
        let { page } = this.state;
        page.total4--;
        this.setState({
          page,
        });
      }
    })
  }
  onHandleWithdraw = (id) => {
    api.withdrawBillDraft({
      id
    }).then(({ code }) => {
      if (code === 0) {
        message.success('撤回账单成功')
        let { page } = this.state;
        page.total1--;
        page.total4++;
        this.setState({
          page,
        });
        this.getList()
      }
    })
  }
  /**
   * @function 切换顶部状态菜单
   * @params {String} value
   * @params {String} name
  */
  onSearchStateChange = (value, name) => {
    this.props.history.replace(this.props.history.location.pathname + `?status=${value}`)
    const searchParams = { ...this.state.searchParams, [name]: value };
    this.setState({ searchParams }, () => this.onSearch());
  }


  onSearch = () => {
    this.setState({ page: { ...this.state.page, current: 1 } }, () => {
      this.getList();
    });
  }

  getList = () => {
    const params = Object.assign({}, this.state.searchParams);
    // params.status = params.status;
    params.startTime = params.startTime ? moment(params.startTime).startOf('month').valueOf() : '';
    params.endTime = params.endTime ? moment(params.endTime).endOf('month').valueOf() : '';
    params.pageNum = this.state.page.current || '';
    params.pageSize = this.state.page.pageSize || '';

    /* 临时注释：记住搜索条件 */
    // this.props.history.replace("/resourcesAccount/" + params.state+ '?' + qs.stringify(params));

    api.getIDCAccountList(params).then((res) => {

      if (res.code === 0) {
        let { page } = this.state;
        page.total = res.msg.total;
        console.log(page)
        this.setState({
          data: res.msg.list,
          page,
        });
      } else {
        message.error(res.msg, 3);
      }
    });
  }


  gettab1 = () => {
    const params = Object.assign({}, this.state.searchParams);
    params.status = "待审核";
    params.startTime = params.startTime ? moment(params.startTime).startOf('month').valueOf() : '';
    params.endTime = params.endTime ? moment(params.endTime).endOf('month').valueOf() : '';
    params.pageNum = this.state.page.current || '';
    params.pageSize = this.state.page.pageSize || '';

    /* 临时注释：记住搜索条件 */
    // this.props.history.replace("/resourcesAccount/" + params.state+ '?' + qs.stringify(params));

    api.getIDCAccountList(params).then((res) => {

      if (res.code === 0) {
        let { page } = this.state;
        page.total1 = res.msg.total;
        this.setState({
          page,
        });
        const { status } = this.state.searchParams
        if (status === '待审核') {
          this.setState({
            data: res.msg.list,
          })
        }
      } else {
        message.error(res.msg, 3);
      }
    });
  }


  gettab2 = () => {
    const params = Object.assign({}, this.state.searchParams);
    params.status = "待复核";
    params.startTime = params.startTime ? moment(params.startTime).startOf('month').valueOf() : '';
    params.endTime = params.endTime ? moment(params.endTime).endOf('month').valueOf() : '';
    params.pageNum = this.state.page.current || '';
    params.pageSize = this.state.page.pageSize || '';

    /* 临时注释：记住搜索条件 */
    // this.props.history.replace("/resourcesAccount/" + params.state+ '?' + qs.stringify(params));

    api.getIDCAccountList(params).then((res) => {

      if (res.code === 0) {
        let { page } = this.state;
        page.total2 = res.msg.total;
        this.setState({
          page,
        });
        this.props.actions.setBillingTotal({
          billingTotal: res.msg.total
        })
        const { status } = this.state.searchParams
        if (status === '待复核') {
          this.setState({
            data: res.msg.list,
          })
        }
      } else {
        message.error(res.msg, 3);
      }
    });
  }

  gettab3 = () => {
    const params = Object.assign({}, this.state.searchParams);
    params.status = "已确认";
    params.startTime = params.startTime ? moment(params.startTime).startOf('month').valueOf() : '';
    params.endTime = params.endTime ? moment(params.endTime).endOf('month').valueOf() : '';
    params.pageNum = this.state.page.current || '';
    params.pageSize = this.state.page.pageSize || '';

    /* 临时注释：记住搜索条件 */
    // this.props.history.replace("/resourcesAccount/" + params.state+ '?' + qs.stringify(params));

    api.getIDCAccountList(params).then((res) => {

      if (res.code === 0) {
        let { page } = this.state;
        page.total3 = res.msg.total;
        this.setState({
          page,
        });
        const { status } = this.state.searchParams
        if (status === '已确认') {
          this.setState({
            data: res.msg.list,
          })
        }
      } else {
        message.error(res.msg, 3);
      }
    });
  }
  gettab4 = () => {
    const params = Object.assign({}, this.state.searchParams);
    params.status = "草稿";
    params.startTime = params.startTime ? moment(params.startTime).startOf('month').valueOf() : '';
    params.endTime = params.endTime ? moment(params.endTime).endOf('month').valueOf() : '';
    params.pageNum = this.state.page.current || '';
    params.pageSize = this.state.page.pageSize || '';

    /* 临时注释：记住搜索条件 */
    // this.props.history.replace("/resourcesAccount/" + params.state+ '?' + qs.stringify(params));

    api.getIDCAccountList(params).then((res) => {

      if (res.code === 0) {
        let { page } = this.state;
        page.total4 = res.msg.total;
        this.setState({
          page,
        });
        const { status } = this.state.searchParams
        if (status === '草稿') {
          this.setState({
            data: res.msg.list,
          })
        }
      } else {
        message.error(res.msg, 3);
      }
    });
  }
  getStateList = () => {
    api.queryOrderStateList().then((res) => {
      if (res.code === 0) {
        this.setState({
          stateDataList: res.msg
        });
      }
      else {
        this.setState({
          stateDataList: {}
        });
      }
    });
  }

  getOrderType = () => {
    api.getIDCAccountType().then((res) => {
      if (res.code === 0) {
        let list = res.msg.list.map(elem => {
          return elem.name
          // {
          //   value: elem,
          //   label: res.msg[elem]
          // }
        });
        this.setState({ orderType: list })
      } else {
        this.setState({ orderType: [] })
      }
    });
  }

  onReset = () => {
    this.setState({
      searchParams: {
        type: undefined,
        status: '待审核',
        startTime: undefined,
        endTime: undefined,
      }
    }, () => {
      this.onSearch();
    }, () => {
      console.log(this.state.searchParams);
    })
  }

  onDetail = (record, type, params) => {
    this.props.history.push({
      pathname: `/orderdetail/${record.id}/${type}?${params}`,

    })
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
  importAccount=()=>{
    this.handleCancel();
    importAccount({
      skip: this.skip.bind(this)
    }, ()=>{
      console.log('test2222');
      // this.getList();
      this.gettab4();
      message.success('导入成功!');
    })
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };


 skip = value => {
   let searchParams = this.state.searchParams;
   searchParams.status = value;
   this.setState({
     searchParams
   });
 };

 render() {
   //  const stateMap = {
   //    WAIT_DELIVER: '待发货',
   //    PART_DELIVERED: '部分发货',
   //    DELIVERED: '已发货',
   //    PART_RECEIVED: '部分签收',
   //    RECEIVED: '已签收',
   //    CANCELED: '已取消',
   //    ASS: '售后'
   //  };

   const columns =
      [{
        title: '账单编号',
        dataIndex: 'billNo',
        align:'center'
        // width:'150px'
      }, {
        title: '供应商id',
        dataIndex: 'supplierId',
        align:'center'
        // width:'120px'
      },
      {
        title: '账单类型',
        dataIndex: 'billTypes',
        align:'center',
        // width:'120px',
        render: (text, record) => {
          if(!record.billTypes) return
          return record.billTypes.join(',');
        }
      }, {
        title: '计费月份',
        dataIndex: 'billMonths',
        render: (text, record) => {
          if(!record.billMonths) return
          return record.billMonths.join(',');
        },
        // width:'120px'
      }, {
        title: '总金额',
        dataIndex: 'totalAmount',
        // width:'120px'
      }, {
        title: '币种',
        dataIndex: 'currency',
        // width:'120px'
      }, {
        title: '提交时间',
        dataIndex: 'submitTime',
        // width:'120px'
      }
      , {
        title: '操作',
        fixed: 'right',
        width: 130,
        render: (text, record) => {
          if (searchParams.status ==='待审核') {
            // return  <Link to={`/resourcesAccountDetail/${record.id}/detail`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>查看</Link>
            // return  <span>
            //   <Link to={`/resourcesAccountDetail/${record.id}/edit`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>编辑</Link>&nbsp;
            //   <Popconfirm placement="top" title='确定撤回该账单吗？' onConfirm={() => { this.onHandleWithdraw(record.id) }} okText="确定" cancelText="取消">
            //     <a>撤回</a>
            //   </Popconfirm>
            // </span>
            return text.withdrawStatus ?
              <Link to={`/resourcesAccountDetail/${record.id}/detail`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>查看</Link> :
              <span>
                <Link to={`/resourcesAccountDetail/${record.id}/detail`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>查看</Link>&nbsp;
                <Popconfirm placement="top" title='确定撤回该账单吗？' onConfirm={() => { this.onHandleWithdraw(record.id) }} okText="确定" cancelText="取消">
                  <a>撤回</a>
                </Popconfirm>
              </span>
          } else if (searchParams.status ==='待复核') {
            return <Link to={`/resourcesAccountDetail/${record.id}/edit`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>编辑</Link>
          } else if (searchParams.status ==='草稿') {
            return  <span>
              <Link to={`/resourcesAccountDetail/${record.id}/edit`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>编辑</Link>&nbsp;
              <Popconfirm placement="top" title='确定删除该账单吗？' onConfirm={() => { this.onHandleDel(record.id) }} okText="确定" cancelText="取消">
                <a>删除</a>
              </Popconfirm>
            </span>
          } else {
            return  <Link to={`/resourcesAccountDetail/${record.id}/detail`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>查看</Link>
          }
        }
      }
      ];

   //  const formItemLayout = {
   //    labelCol: {
   //      xs: { span: 12 },
   //      sm: { span: 6 },
   //    },
   //    wrapperCol: {
   //      xs: { span: 24 },
   //      sm: { span: 16 },
   //    },
   //  };

   const { searchParams, page, data, stateList, orderType, stateDataList,size  } = this.state;
   const index = columns.findIndex(column => column.title === '总金额');
   columns[index].title = '供应商账单总金额';
   columns.splice(index + 1,0, {
     title: '商务复核总金额',
     dataIndex: 'reviewTotalAmount',
     render: (text, record) => {
       if (record.reviewTotalAmount) {
         const _arr = record.reviewTotalAmount.split('+')
         function check(item) {
           return item == '0.0'
         }
         const isZero = _arr.every(check)
         if(isZero) return '-'
         return record.reviewTotalAmount
       }
     },
   })
   return (
     <Content size="full">
       <div className="g-account-resources">
         <div className="m-search-state">
           <Tabs activeKey={searchParams.status} onChange={(value) => { this.onSearchStateChange(value, 'status') }}>
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
                       {
                         (() => {
                           switch(item.name){
                             case  '已提交账单':
                               return  page.total1 && "("+page.total1+")"
                             case '待核对账单':
                               return page.total2 && "("+page.total2+")"
                             case '已确认账单':
                               return page.total3 && "("+page.total3+")"
                             case '草稿账单':
                               return page.total4 && "("+page.total4+")"
                             default:
                               return "("+0+")"
                           }
                         })()

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
             <label>开始月份</label>
             <MonthPicker
               className="u-search-item"
               format="YYYY-MM"
               value={searchParams.startTime}
               placeholder="开始"
               onChange={(value) => { this.onSearchParamsChange(value, 'startTime') }}
               allowClear={false}
             />
           </div>

           <div className="search-item">
             <label>结束月份</label>
             <MonthPicker
               className="u-search-item"
               format="YYYY-MM"
               value={searchParams.endTime}
               placeholder="结束"
               onChange={(value) => { this.onSearchParamsChange(value, 'endTime') }}
               allowClear={false}
             />
           </div>

           <div className="search-item">
             <label>账单类型</label>
             <Select
               className="u-search-item"
               value={searchParams.type}
               onChange={(value) => { this.onSearchParamsChange(value, 'type') }}
               allowClear
               placeholder="请选择"
             >
               {
                 orderType.map(item =>
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
             <Button type="primary" onClick={this.onSearch} className="u-search" >搜索</Button>
             <Button onClick={this.onReset} className="u-reset">重置</Button>
           </div>
         </div>

         <div className="m-page-content">
           <div className="m-btn">
             <Button type="primary" size={size} onClick={this.showModal} style={{width:120}}>
              新建账单
             </Button>

             <Modal
               title="请选择新建账单方式"
               visible={this.state.visible}
               footer={null}
               onCancel={this.handleCancel}
               centered
             >
               <Button type="primary"  style={{marginLeft:"100px"}}>
                 <Link to={`/resourcesAccountAdd`} >手动输入</Link>
               </Button>
               <Button type="primary" style={{marginLeft:"80px"}} onClick={this.importAccount}>批量导入</Button>
             </Modal>



           </div>
           <Table
             rowKey={record => record.id}
             columns={columns}
             dataSource={data}
             scroll={{ x: 1950, y: 500 }}
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
   );
 }
}

const mapStateToProps = () => ({})

const AccountResourcesWithConnect = connect(mapStateToProps, dispatchs('accountResources'))(AccountResources)

export default function AccountResourcesWithConnectPage(props) { return <AccountResourcesWithConnect {...props} />; }
