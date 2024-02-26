import React, {useState, useEffect, useMemo} from 'react';
import { Tabs, Input, Select, Button, Table, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {actions, asyncActions} from './reduxJs';
import { useSelector, useDispatch } from 'react-redux'
import BatchQuote from './BatchQuote'
import style from './style.module.scss';
import api from 'src/api';

const { TabPane } = Tabs;

export function TableComplexItem(data = {}) {
  
  const {title, standard} = Array.isArray(data) ? {standard: data} : (data || {});

  const getValue = ({type, value}, item) => {
    if (type === 'link') {
      const url = value.trim();
      return (
        <span
          style={item?.valueStyle}
          className={style.link}
          onClick={() =>
            window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
          }>
            查看
        </span>
      )
    }
  }

  return (
    <div>
      {title && <h4>{title}</h4>}
      {
        standard?.length ?
          standard?.map?.((item) => {
            return (
              <div key={item.label}>
                <span className={style.tableComplexItemLabel}>{item.label}</span>
                {
                  Object.prototype.toString.call(item.value) === '[object Object]' ?
                    getValue(item.value, item) :
                    <span style={item?.valueStyle} >{item.value}</span>
                }
              </div>
            )
          })
          : '-'
      }
    </div>
  )
}



export default function QuoteCommon (props) {
  const dispatch = useDispatch();
  const state = useSelector(state => state.quoteCommon);
  const { email: companyEmail } = useSelector(state => state.app?.userInfo?.emailAccount)
  function confirm() {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: '您即将下载与网易公司合作期间的询报价信息表，请注意信息保密谨防泄露，如出现该信息泄露而引起的纠纷和一切后果与网易公司无关。',
      okText: '同意并导出',
      cancelText: '取消',
      cancelButtonProps: {
        type: "ghost",
      //   shape: "round"
      },
      okButtonProps: {
        danger: true,
        type: "primary",
      //   shape: "round"
      },
      onOk: () => {
        const data = {
          displayStatus: state.activeTab,
          keyword: state.keywords,
          ownerEmail: state.ownerEmail,
          supplierEmail: companyEmail,
          type: '0',
          urge: state.urge,
          pageSize: state.quoteList.pageSize,
          pageNo: state.quoteList.pageNo,
        }
        api.exportFile(data, {
          responseType: 'blob',
        }).then(r => ({
          blob: r.data,
          filename: r.headers['content-disposition'].match(/filename(\*=utf-8'')?(.+)/)[2]
        }))
          .then(({ blob, filename }) => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = decodeURIComponent(filename)
            a.click()
            window.URL.revokeObjectURL(blob)
          })
      },
      autoFocusButton: null
    });
  }

  async function batchQuoteSubmit(files) {

    const {data} = files;
    const errData = [{ rowNum: '-', bizCode: '-', errorMsg: '系统错误，请联系管理员' }]

    return api.uploadBatchQuotationList({
      file: data[0].originFileObj,
      enquiryType: 'online_quotation',
      attachmentUrl: '',
    }, { errorHandling: false })
      .then(res => {
        if (res?.code === '0') {
          dispatch(asyncActions.getQuoteList())
          return { state: true, data: `您已成功上传 ${res.data?.length} 行需求详情 !` }
        }

        const errRes = () => {
          if (Array.isArray(res?.data)) return res.data;
          if (typeof res?.msg === 'string') return [{ rowNum: '-', bizCode: '-', errorMsg: res?.msg }]

          return errData
        }

        return {
          state: false,
          data: errRes()
        }
      })
      .catch((err) => {
        console.log(err)
        return { state: false, data: errData }
      })
  }

  const [selectedKeys, setSelectedKeys] = useState([])

  function onDownloadTemplate() {
    api.downloadBatchQuotationList2({
      enquiryTaskCodeList: selectedKeys,
      type: "supplier",
      supplierCode: companyEmail
    }, {
      responseType: 'blob',
    })
      .then(r => ({
        blob: r.data,
        filename: r.headers['content-disposition']?.match(/filename=(.+)/)[1]
      }))
      .then(({ blob, filename }) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = decodeURIComponent(filename)
        a.click()
        window.URL.revokeObjectURL(blob)
      })
  }

  useEffect(() => {
    dispatch(asyncActions.getQuoteList())
    dispatch(asyncActions.getEnquiryOwners())
    return () =>  dispatch(actions.resetState())
  }, [dispatch])

  const rowSelection = useMemo(() => {
    const hasRowSelection = state.activeTab === 'waiting_quotation'

    if (hasRowSelection) {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          setSelectedKeys(selectedRows.map(el => el.enquiryTaskCode))
        }
      }
    } else {
      setSelectedKeys([])
      return false
    }
  }, [state.activeTab])

  return (
    <div>
      <div className={style.content}>
        <div className={style.tabs}>
          <Tabs
            onChange={activeKey => {
              dispatch(actions.setActiveTab(activeKey));
              dispatch(actions.updateQuoteCommon({
                sort: '',
                orderByQ: '',
              }))
              dispatch(asyncActions.getQuoteList({pageNo: 1, pageSize: 10}));
            }}
            activeKey={state.activeTab}>
            <TabPane
              tab={
                <span className={style.tab}>
                  待报价
                  <i className={style.message}>
                    {
                      state.waitHandleTotal > 99 ?
                        '99+' :
                        state.waitHandleTotal
                    }
                  </i>
                </span>
              }
              key="waiting_quotation"
            >
            </TabPane>
            <TabPane
              tab={
                <span className={style.tab}>
                已报价
                </span>
              }
              key="already_quotation"
            >
            </TabPane>
            <TabPane
              tab={
                <span className={style.tab}>
                已失效
                </span>
              }
              key="overtime"
            >
            </TabPane>
          </Tabs>
        </div>
        <div className={style.search}>
          <Input
            allowClear
            className={style.searchInput}
            value={state.keywords || ''}
            onChange={(e) => dispatch(actions.setSearchKeywords(e.currentTarget.value))}
            placeholder='请输入询价商品名称、品牌、规格、需求ID、需求子单ID' />
          <Select 
            allowClear
            showSearch
            optionFilterProp="children"
            value={state.ownerEmail || void 0}
            onClear={() => dispatch(actions.setOwnerEmail(null))}
            onSelect={(value) => dispatch(actions.setOwnerEmail(value))}
            className={style.searchSelect}
            placeholder='采购员'>
            {
              state.ownerList.map(el => (
                <Select.Option key={el.ownerEmail}>
                  {el.ownerUserName}
                </Select.Option>
              ))
            }
          </Select> 
          <Select
            allowClear
            value={
              typeof state.urge === 'boolean' ?
                Number(state.urge).toString() :
                void 0
            }
            onClear={() => dispatch(actions.setUrge(null))}
            onSelect={(value) => dispatch(actions.setUrge(value))}
            className={style.searchSelect}
            placeholder='紧急状态'>
            <Select.Option key='0'>普通</Select.Option>
            <Select.Option key='1'>紧急</Select.Option>
          </Select>
          <Button
            className={style.searchButton}
            onClick={() => {
              dispatch(asyncActions.getQuoteList({ pageNo: 1, pageSize: 10 }))
            }}
            type="primary">
              搜索
          </Button>
          <Button
            onClick={() => {
              dispatch(actions.resetFilter());
              dispatch(asyncActions.getQuoteList({ pageNo: 1, pageSize: 10 }));
            }}
            className={style.searchButton}
            type="ghost">
            重置
          </Button>
        </div>
        <div className={style.list}>
          <div className={style.listButton}>
            <Button type="primary" ghost onClick={confirm}>导出</Button>
            {
              state.activeTab === 'waiting_quotation' &&
              <div style={{marginLeft: 10}}>
                <BatchQuote onSubmit={batchQuoteSubmit} onDownloadTemplate={onDownloadTemplate} />
              </div>
            }
          </div>
          <Table
            key={state.activeTab}
            rowKey={record => record.enquiryCode}
            dataSource={state.quoteList.data}
            rowSelection={rowSelection}
            columns={[
              {
                title: '询价需求',
                dataIndex: 'quote',
                key: 'quote',
                width: '24%',
                render: TableComplexItem
              },
              {
                title: '询价商品',
                dataIndex: 'inquiryProduct',
                key: 'inquiryProduct',
                width: '26%',
                render: TableComplexItem
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: '12%',
                render(status) {
                  return <span>• {status}</span>
                }
              },
              {
                title: '时间',
                dataIndex: 'times',
                key: 'times',
                width: '26%',
                sorter: true,
                render: TableComplexItem
              },
              {
                title: '操作',
                key: 'operation',
                width: '16%',
                render(record) {
                  return (
                    <>
                      <a
                        onClick={() => props.history.push(`/quoteCommonQuotation/${record.enquiryTaskCode}/${record.enquiryCode}`)}
                        style={{marginRight: 8, display: state.activeTab === 'waiting_quotation' ? null: 'none'}}>报价</a>
                      <a onClick={() => props.history.push(`/quoteCommonDetail/${record.enquiryTaskCode}/${record.enquiryCode}`)}>查看</a>
                    </>
                  )
                }
              },
            ]}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条数据`,
              total: state.quoteList.total,
              pageSize: state.quoteList.pageSize,
              current: state.quoteList.pageNo,
            }}
            onChange = { ({current, pageSize}, filters, {field, order}) => {
              const query = { pageNo: current, pageSize }
              dispatch(actions.updateQuoteCommon({
                sort: order === 'descend' ? 'desc' : 'asc',
                orderByQ:  state.activeTab === 'overtime' ? 'expire_date' : 'create_time'
              }))
              dispatch(asyncActions.getQuoteList(query));
            }}
          />
        </div>
      </div>
    </div>
  )
}


export function Card(props) {
  const {
    title,
    children,
    h = 3
  } = props;
  
  return (
    <div className={style.card}>
      {React.createElement(`h${h}`, {className: style.cardTitle}, title)}
      {children}
    </div>
  )
}