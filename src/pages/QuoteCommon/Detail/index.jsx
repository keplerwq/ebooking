import React, {useEffect, useMemo} from 'react';
import {useParams} from "react-router-dom";
import {Table} from 'antd';
import {TableComplexItem, Card} from '../';
import {asyncActions} from '../reduxJs';
import { useSelector, useDispatch } from 'react-redux'
import style from './style.module.scss';


function QuoteCard({data, onceItem}) {

  const columns = useMemo(() => [
    {
      title: '询价商品/数量',
      dataIndex: 'inquiryProduct',
      key: 'inquiryProduct',
      render: TableComplexItem,
      width: '28%'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render(status) {
        return <span>{status ? `• ${status}` : '-'}</span>
      },
      width: '8%'
    },
    {
      title: '报价商品',
      dataIndex: 'quoteProduct',
      key: 'quoteProduct',
      render: TableComplexItem,
      width: '18%'
    },
    {
      title: '报价',
      dataIndex: 'quotedPrice',
      key: 'quotedPrice',
      render: TableComplexItem,
      width: '16%'
    },
    {
      title: '其他',
      dataIndex: 'otherInfo',
      key: 'otherInfo',
      render: TableComplexItem,
      width: '18%'
    },
    {
      title: '报价备注',
      dataIndex: 'quotationNotes',
      key: 'quotationNotes',
      width: '12%',
      render(remark) {
        return <span>{remark || '-'}</span>
      },
    },
  ], [])

  return (
    <Card title={onceItem ? '报价' : `第${data.inquiryNo}次报价`} >
      <div className={style.quoteInfo}>
        <span className={style.quoteInfoLabel}>询报价方式：</span>
        <span className={style.quoteInfoValue}>{data.enquiryTypeName}</span>
        <span className={style.quoteInfoLabel}>询价时间：</span>
        <span className={style.quoteInfoValue}>{data.createTime}</span>
        <span className={style.quoteInfoLabel}>报价截止时间：</span>
        <span className={style.quoteInfoValue}>{data.expireDate}</span>
        <span className={style.quoteInfoLabel}>紧急程度：</span>
        <span className={style.quoteInfoValue}>{data.urgeName}</span>
        <span className={style.quoteInfoLabel}>到货地址：</span>
        <span className={style.quoteInfoValue}>{data.deliveryAddress}</span>
        <span className={style.quoteInfoLabel}>询价备注：</span>
        <span className={style.quoteInfoValue}>{data.remark}</span>
      </div>
      <Table
        rowKey={record => record.id}
        dataSource={data.tableData}
        columns={columns}
        pagination={false}
      />
    </Card>
  )
}

export default function QuoteCommonDetail () {

  const { enquiryTaskCode, enquiryCode } = useParams();
  const dispatch = useDispatch();
  const state = useSelector(state => state.quoteCommon);
  const {quoteDetails} = state;

  useEffect(() => {
    dispatch(asyncActions.getHistoryQuote({enquiryTaskCode, enquiryCode}))
  }, [dispatch, enquiryTaskCode, enquiryCode])

  return (
    <>
      <div className={style.content}>
        <Card title='询报价详情' h='2' >
          <div className={style.quoteInfo}>
            <span className={style.quoteInfoLabel}>需求单ID：</span>
            <span className={style.quoteInfoValue}>{quoteDetails.requestId}</span>
            <span className={style.quoteInfoLabel}>需求子单ID：</span>
            <span className={style.quoteInfoValue}>{quoteDetails.requestDetailId}</span>
            <span className={style.quoteInfoLabel}>采购员：</span>
            <span className={style.quoteInfoValue}>{quoteDetails.ownerUserName}</span>
          </div>
        </Card>

        {
          quoteDetails.historyList?.map?.(item => <QuoteCard onceItem={quoteDetails.historyList.length === 1} key={item.id} data={item} />)
        }
      </div>
    </>
  )
}