

import React, { Component } from 'react';
import {  message } from 'src/components';
import { PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Modal, Popover, Table, Popconfirm, ConfigProvider } from 'antd';
import { ControlledForm } from 'src/components';
import api from 'src/api';
import api_config from 'src/api/api-config'
import './Detail.scss';
import moment from 'moment';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import editAccountDetail from './editAccountSetail';
import addItems from './addItems';
import UploadModal from './uploadModal'
const { confirm } = Modal;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class AccountResourcesDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editDate: {
        billType: '',
        billTypeSubs: [],
        flag: false,
        filePath: '',
      },
      list: [],
      billType: '',
      billTypeSubs: '',
      type: 'edit',
      tableType: '',
      orderType: [],
      id: 0,
      fileList: '',
      fileurl: '',
      filePath: '', //详情附件
      status: '',
      options:[],
      reviewFile: '', // bps端上传的文件下载地址
      reviewFileName: '', // bps端上传的文件名称
      reviewFileStatus: 1,
      uploadSupplier: {
        visible: false,
        index: 0
      }
    };
  }
  componentDidMount() {
    let query = this.props.match.params;
    let { id, type } = query;
    id = parseInt(id);
    this.setState({ type, id });
    this.getDetail(id);
    this.getOrderType();

  }

  componentWillReceiveProps(props) {
  }

  getDetail = (id) => {
    api.getIDCApproveDetail({ id }).then((res) => {
      if (res.code === 0) {
        let id = res.msg.id;
        let billNo = res.msg.billNo;
        let supplierEmail = res.msg.supplierEmail;
        let createTime = res.msg.createTime;
        let updateTime = res.msg.updateTime;
        let billType = res.msg.billType;
        let billTypeSubs = res.msg.billTypeSubs;
        let filePath = res.msg.filePath;
        let status = res.msg.status;
        let list = res.msg.list;
        let reviewFile = res.msg.reviewFile;
        let reviewFileName = res.msg.reviewFileName;
        let reviewFileStatus = res.msg.reviewFileStatus;
        this.setTotal(list)
        // this.setState({ list: list })
        // this.setState({ list, id, billType,supplierEmail, updateTime,createTime,filePath, status, billNo, billTypeSubs });
        this.setState({ id, billType,supplierEmail, updateTime,createTime,filePath, status, billNo, billTypeSubs, reviewFile, reviewFileName, reviewFileStatus });
        const params = {
          type:billType,
          typeSubs: ''
        }
        api.getIDCAccountAllItem(params).then((res) => {
          if (res.code === 0) {
            let list = res.msg.list;
            let deepList = JSON.parse(JSON.stringify(list))
            this.setState({ deepList:deepList })
          }
        });
      }
    });

  }

  setTotal = (list) => {
    if (!list.length) {
      this.setState({
        list: []
      })
      return false
    }
    // 应收
    let applyAmount = 0
    // 实收
    let actualAmount = 0
    // 商务复核费用
    let reviewAmount = 0
    list.map(item => {
      applyAmount += item.applyAmount ? parseFloat(item.applyAmount) : 0
      actualAmount += item.actualAmount ? parseFloat(item.actualAmount) : 0
      reviewAmount += item.reviewAmount ? parseFloat(item.reviewAmount) : 0
    })
    list.push({
      itemId: '合计',
      applyAmount: this.setDigital(applyAmount).toFixed(2),
      actualAmount: this.setDigital(actualAmount).toFixed(2),
      reviewAmount: this.setDigital(reviewAmount).toFixed(2)
    })
    this.setState({list})
  }

  setDigital = (digital) => {
    if (isNaN(digital)) {
      return ''
    } else {
      return digital
    }
  }

  getAfterChoose = () => {

  }
  onDownloadAccountDetail = () => {
    const { filePath } = this.state;

    window.open(filePath, '_blank');
  }
  // 确认
  onConfirmItem(record, index) {
    api.confirmItemInfo({
      billingItem: record
    }).then(res => {
      console.log(res)
      if (res.code === 0) {
        let list = [...this.state.list]
        list[index] = res.msg
        this.setState({
          list
        }, () => {
          const list = this.state.list.slice(0, this.state.list.length - 1)
          this.setTotal(list)
        })
      }
    })
  }
  //编辑
  onEditAccountDetail(record, index) {
    editAccountDetail(record, index, (values, index) => { this.handleEditAccountDetail(values, index) })
  }
  handleEditAccountDetail(values, index) {
    // const { list } = this.state;
    const list = this.state.list.slice(0, this.state.list.length - 1)
    values.billMonth = moment(values.billMonth).valueOf();
    list[index] = values;
    // this.setState({
    //   list: [...list]
    // })
    this.setTotal(list)
  }
  //删除
  onArrayChildDel(index) {
    // const { list } = this.state;
    const list = this.state.list.slice(0, this.state.list.length - 1)
    const filter = list.filter((item, i) => index !== i)
    // this.setState({
    //   list: filter
    // })
    this.setTotal(filter)
  }

  onFormChange = (values, key, v) => {
    console.log(values, 'values')

  }
  handleChange = (values) => {  //账单类型选择
    console.log(values, 'values')

    this.setState({
      editDate: {
        type: Array.isArray(values) ? values.join(',') : ''
      }
    });
  }
  getOrderType = () => { //获取账单类型
    api.getIDCAccountType().then((res) => {
      if (res.code === 0) {
        let list = res.msg.list.map(item => {
          return item
        })
        this.setState({ orderType: list })

      } else {
        this.setState({ orderType: [] })
      }
    });
  }
  onDownloadAccount = () => { //文件
    const { filePath } = this.state;
    window.open(filePath, '_blank');
  }
  onDownloadBpsFile = () => {
    const { reviewFile, reviewFileStatus } = this.state
    if (reviewFile && reviewFileStatus) {
      window.open(reviewFile, '_blank')
    }
  }
  onDownloadReviewFile = (res) => {
    const { cloudReviewSupplierFile, cloudReviewFileStatus } = res
    if (cloudReviewSupplierFile && cloudReviewFileStatus) {
      window.open(cloudReviewSupplierFile, '_blank')
    }
  }
  onuploadReviewFile = (res, index) => {
    const uploadSupplier = {
      visible: true,
      index,
      cloudSupplierFile: res.cloudSupplierFile,
      cloudSupplierFileName: res.cloudSupplierFileName
    }
    this.setState({
      uploadSupplier
    })
  }
  onUploadChange = (name, info) => {  //上传文件

  }
  handleTypeChange = (name, value) => {
    console.log(value, 'vvv');

    const { editDate } = this.state;
    if (name === 'checkbox') {
      this.setState({
        editDate: {
          ...editDate,
          billTypeSubs: value
        }
      });
      return
    }

    const _this = this;
    confirm({
      title: "提示",
      content: '更改账单类型，账单详情所填写内容将会丢失，是否继续',
      onOk() {
        if (name === 'radio') {
          _this.setState({
            editDate: {
              ...editDate,
              billType: value,
              flag: true
            }
          }, () => _this.getDetail());
        }
      },
      onCancel() { }
    })

  }
  onSubmit = () => {//提交复核
    const { editDate } = this.state;
    let params = {
      id: this.state.id,
      billNo: this.state.billNo,
      billType: editDate.billType || '',
      billTypeSubs: Array.isArray(editDate.billTypeSubs) ? editDate.billTypeSubs.join(',') : '',
      filePath: (this.state.fileurl && this.state.fileurl.length) ? this.state.fileurl[0].url : '',
      status: 'submit',
      // list: this.state.list
      list: this.state.list.slice(0, this.state.list.length - 1)
    };
    let paramsDraft = {
      id: this.state.id,
      status:'草稿',
      billNo: this.state.billNo,
      supplierEmail:this.state.supplierEmail,
      createTime:this.state.createTime,
      updateTime:this.state.updateTime,
      billType: editDate.billType || '',
      billTypeSubs: Array.isArray(editDate.billTypeSubs) ? editDate.billTypeSubs.join(',') : '',
      filePath: (this.state.fileurl  && this.state.fileurl.length) ? this.state.fileurl[0].url : '',
      // list: this.state.list
      list: this.state.list.slice(0, this.state.list
        .length - 1)
    };
    this.state.status ==='草稿' ?
      api.updateBillToWaitCheck(paramsDraft).then(res => {
        if (res.code == 0) {
          this.props.history.goBack()
        } else {
          return
        }
      })
      :
      api.getIDCApproveDetailPost(params).then(res => {
        if (res.code == 0) {
          this.props.history.goBack()
        } else {
          return
        }
      })
  }
  onDraft = () =>{
    const { billType, billTypeSubs } = this.state;
    let params = {
      id: this.state.id,
      status:'草稿',
      billNo: this.state.billNo,
      supplierEmail:this.state.supplierEmail,
      createTime:this.state.createTime,
      updateTime:this.state.updateTime,
      billType: billType || '',
      billTypeSubs: Array.isArray(billTypeSubs) ? billTypeSubs.join(',') : '',
      filePath: this.state.fileurl ? this.state.fileurl[0].url : '',
      // list: this.state.list
      list: this.state.list.slice(0, this.state.list.length - 1)
    };
    api.updateBillStillDraft(params).then(res => {
      if (res.code == 0) {
        // this.props.history.goBack()
        message.success('操作成功')
      } else {
        return
      }
    })
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
      fileurl: fileList
    })
  }
  addShows = () => {
    const { billType, billTypeSubs } = this.state;
    const params = {
      type: billType || '',
      typeSubs: Array.isArray(billTypeSubs) ? billTypeSubs.join(',') : '',
    }
    api.getIDCAccountAllItem(params).then((res) => {

      if (res.code === 0) {
        let options = res.msg.addItems;
        let obj = {
          option: options,
          type: params.type
        }
        addItems(obj,(values,index) => {this.handleAddItems(values, index)})
      }
    });

  }
  handleAddItems = values => {
    // const { list,deepList } = this.state;
    const { deepList } = this.state;
    const list = this.state.list.slice(0, this.state.list.length - 1)
    let item2 = values.items[0] || '';
    let item3 = values.items[1] || '';
    let item4 = values.items[2] || '';
    let roomName = values.items[3]  || '';
    let temp = deepList.filter(item=>{
      return item.item2 === item2 && item.item3 === item3 && item.item4 === item4 && item.roomName === roomName // 第四个计费项是全称，这里调整了字段匹配逻辑原来是line 或者 line === ''
    })
    // http://jira.netease.com/browse/PURCHASE-369?filter=-1 ebooking-pre账务管理,草稿账单计费项编辑--新增后白屏
    if (temp.length) {
      const listTemp = temp.map(item=>{
        return item
      })

      list.push(listTemp[0])
      // this.setState({
      //   list:  [...list]
      // })
      this.setTotal(list)
    }

  }

  popArr (arr) {
    arr.pop()
    return arr
  }

  uploadOkClick = (res) => {
    if (res) {
      const { cloudSupplierFile, cloudSupplierFileName } = res
      const list = [...this.state.list];
      this.setState({
        list: list.map((item,index) => index === this.state.uploadSupplier.index ?
          {...item, cloudSupplierFile, cloudSupplierFileName} : item)
      });
    }
  }

  uploadCancel = () => {
    const uploadSupplier = {
      visible: false,
      index: 0,
      cloudSupplierFile: this.state.uploadSupplier.cloudSupplierFile,
      cloudSupplierFileName: this.state.uploadSupplier.cloudSupplierFileName
    }
    this.setState({
      uploadSupplier
    })
  }

  render() {
    const { billType, list,status, type, editDate, billTypeSubs, filePath, uploadSupplier } = this.state;

    //IDC类 海外资源
    const goodsColumns = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        key: 'itemId',
        width:100,
        align:'center'
      },
      {
        title:'供应商名称',
        dataIndex:'supplierType',
        // key:'supplierType',
        width:180,
        align:'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      {
        title: '机房简称/专线名称',
        dataIndex: 'roomNameShort',
        align:'center',
        width: 180,
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          if(record.privateLineName&&record.roomNameShort){
            return <div>{record.roomNameShort}/{record.privateLineName}</div>
          }else if(record.privateLineName){
            return <div>{record.privateLineName}</div>
          }else if(record.roomNameShort){
            return <div>{record.roomNameShort}</div>
          }else{
            return <div>无</div>
          }
        }
      },
      {
        title: '计费二级项目',
        dataIndex: 'item2',
        key: 'item2',
        align:'center',
        width: 130,

      },
      {
        title: '计费三级项目',
        dataIndex: 'item3',
        align:'center',
        width:130
      },
      {
        title: '计费四级项目',
        dataIndex: 'item4',
        align:'center',
        width:130
      },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        align:'center',
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span style={{ overflow: 'hidden' }}><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        align:'center',
        dataIndex: 'model',
        width: 130
      },
      {
        title: '价格单位',
        align:'center',
        dataIndex: 'unit',
        width: 130
      },
      {
        title: '币种',
        align:'center',
        dataIndex: 'currency',
        width: 130
      },
      {
        title: '使用月份',
        align:'center',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM');
        }
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        align:'center',
        width: 130
      },
      {
        title: '计费天数',
        align:'center',
        dataIndex: 'actualDay',
        width: 130
      },
      {
        title: '当月总天数',
        align:'center',
        dataIndex: 'totalDay',
        width: 130
      },
      {
        title: '应收金额',
        align:'center',
        dataIndex: 'applyAmount',
        width: 130
      },
      {
        title: '实收金额',
        align:'center',
        dataIndex: 'actualAmount',
        width: 130
      },
      {
        title: '备注',
        align:'center',
        dataIndex: 'remark',
        width: 130
      },
      {
        title: '监控用量',
        align:'center',
        dataIndex: 'monitorQuantity',
        width: 130
      },
      {
        title: '监控计费天数',
        align:'center',
        dataIndex: 'monitorDays',
        width: 130
      },
      {
        title: '商务复核用量',
        align:'center',
        dataIndex: 'reviewQuantity',
        width: 130
      },
      {
        title: '商务复核计费天数',
        align:'center',
        dataIndex: 'reviewDay',
        width: 150
      },
      {
        title: '实收商务复核费用',
        align:'center',
        dataIndex: 'reviewAmount',
        width: 150
      },
      {
        title: '商务备注',
        align:'center',
        dataIndex: 'reviewRemark',
        width: 130
      }
    ];
    //云服务 CDN
    const goodsColumns1 = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 100,
        align:'center'
      },
      {
        title:'供应商名称',
        dataIndex:'supplierType',
        key:'supplierType',
        width:180,
        align:'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      // {
      //   title: '机房简称/专线名称',
      //   dataIndex: 'roomNameShort',
      //   key: 'roomNameShort',
      //   align:'center',
      //   width: 180
      // },
      {
        title: editDate.type === 'CDN' ? '服务内容' : '计费二级项目',
        dataIndex: 'item2',
        width: 130,
        align:'center'
      },
      {
        title: editDate.type === 'CDN' ? '服务内容细分' : '计费三级项目',
        dataIndex: 'item3',
        width: 130,
        align:'center'

      },
      // {
      //   title: '计费四级项目',
      //   dataIndex: 'item4',
      //   width: 130,
      //   align:'center'

      // },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        align:'center',
        width: 130,
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span style={{ overflow: 'hidden' }}><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        align:'center',
        width: 130,
      },
      {
        title: '价格单位',
        align:'center',
        dataIndex: 'unit',
        width: 130,
      },
      {
        title: '币种',
        align:'center',
        dataIndex: 'currency',
        width: 130,
      },
      {
        title: '使用月份',
        align:'center',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        align:'center',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        align:'center',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        align:'center',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        align:'center',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        align:'center',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        align:'center',
        dataIndex: 'remark',
        width: 130,
      },
      {
        title: '监控用量',
        align:'center',
        dataIndex: 'monitorQuantity',
        width: 130,
      },
      {
        title: '监控计费天数',
        align:'center',
        dataIndex: 'monitorDays',
        width: 130
      },
      {
        title: '商务复核用量',
        align:'center',
        dataIndex: 'reviewQuantity',
        width: 130,
      },
      {
        title: '商务复核计费天数',
        align:'center',
        dataIndex: 'reviewDay',
        width: 150,
      },
      {
        title: '实收商务复核费用',
        align:'center',
        dataIndex: 'reviewAmount',
        width: 150,
      },
      {
        title: '商务备注',
        align:'center',
        dataIndex: 'reviewRemark',
        width: 130,
      }
    ];
    //固网及文印、其他类
    const goodsColumns2 = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 130,
        align:'center',
      },
      {
        title:'供应商名称',
        dataIndex:'supplierName',
        key:'supplierName',
        width:180,
        align:'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      // {
      //   title: '机房简称/专线名称',
      //   dataIndex: 'roomNameShort',
      //   key: 'roomNameShort',
      //   align:'center',
      //   width: 180
      // },
      {
        title: '计费二级项目',
        dataIndex: 'item2',
        width: 130,
        align:'center',
      },
      {
        title: '计费三级项目',
        dataIndex: 'item3',
        width: 130,
        align:'center',
      },
      {
        title: '计费四级项目',
        dataIndex: 'item4',
        width: 130,
        align:'center',
      },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        // width: 130,
        align:'center',
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span>
            <Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        align:'center',
        width: 130,
      },
      {
        title: '价格单位',
        dataIndex: 'unit',
        align:'center',
        width: 130,
      },
      {
        title: '币种',
        dataIndex: 'currency',
        align:'center',
        width: 130,
      },
      {
        title: '使用月份',
        align:'center',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        align:'center',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        align:'center',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        align:'center',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        align:'center',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        align:'center',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        align:'center',
        dataIndex: 'remark',
        width: 130,
      },
      {
        title: '监控用量',
        align:'center',
        dataIndex: 'monitorQuantity',
        width: 130,
      },
      {
        title: '监控计费天数',
        align:'center',
        dataIndex: 'monitorDays',
        width: 130
      },
      {
        title: '商务复核用量',
        align:'center',
        dataIndex: 'reviewQuantity',
        width: 130,
      },
      {
        title: '商务复核计费天数',
        dataIndex: 'reviewDay',
        width: 150,
      },
      {
        title: '实收商务复核费用',
        align:'center',
        dataIndex: 'reviewAmount',
        width: 150,
      },
      {
        title: '商务备注',
        align:'center',
        dataIndex: 'reviewRemark',
        width: 130,
      }
    ]
    //IDC类 海外资源
    const goodsColumnsDraft = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        key: 'itemId',
        width:100,
        align:'center'
      },
      {
        title:'供应商名称',
        dataIndex:'supplierType',
        key:'supplierType',
        width:180,
        align:'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      {
        title: '机房简称/专线名称',
        dataIndex: 'roomNameShort',
        align:'center',
        width: 180,
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          if(record.privateLineName&&record.roomNameShort){
            return <div>{record.roomNameShort}/{record.privateLineName}</div>
          }else if(record.privateLineName){
            return <div>{record.privateLineName}</div>
          }else if(record.roomNameShort){
            return <div>{record.roomNameShort}</div>
          }else{
            return <div>无</div>
          }
        }
      },
      {
        title: '计费二级项目',
        dataIndex: 'item2',
        key: 'item2',
        align:'center',
        width: 130,

      },
      {
        title: '计费三级项目',
        dataIndex: 'item3',
        align:'center',
        width:130
      },
      {
        title: '计费四级项目',
        dataIndex: 'item4',
        align:'center',
        width:130
      },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        align:'center',
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span style={{ overflow: 'hidden' }}><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        align:'center',
        dataIndex: 'model',
        width: 130
      },
      {
        title: '价格单位',
        align:'center',
        dataIndex: 'unit',
        width: 130
      },
      {
        title: '币种',
        align:'center',
        dataIndex: 'currency',
        width: 130
      },
      {
        title: '使用月份',
        align:'center',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM');
        }
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        align:'center',
        width: 130
      },
      {
        title: '计费天数',
        align:'center',
        dataIndex: 'actualDay',
        width: 130
      },
      {
        title: '当月总天数',
        align:'center',
        dataIndex: 'totalDay',
        width: 130
      },
      {
        title: '应收金额',
        align:'center',
        dataIndex: 'applyAmount',
        width: 130
      },
      {
        title: '实收金额',
        align:'center',
        dataIndex: 'actualAmount',
        width: 130
      },
      {
        title: '备注',
        align:'center',
        dataIndex: 'remark',
        width: 130
      }
    ];
    //云服务 CDN
    const goodsColumns1Draft = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 100,
        align:'center'
      },
      {
        title:'供应商名称',
        dataIndex:'supplierType',
        key:'supplierType',
        width:180,
        align:'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      // {
      //   title: '机房简称/专线名称',
      //   dataIndex: 'roomNameShort',
      //   key: 'roomNameShort',
      //   align:'center',
      //   width: 180
      // },
      {
        title: editDate.type === 'CDN' ? '服务内容' : '计费二级项目',
        dataIndex: 'item2',
        width: 130,
        align:'center'
      },
      {
        title: editDate.type === 'CDN' ? '服务内容细分' : '计费三级项目',
        dataIndex: 'item3',
        width: 130,
        align:'center'

      },
      // {
      //   title: '计费四级项目',
      //   dataIndex: 'item4',
      //   width: 130,
      //   align:'center'

      // },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        align:'center',
        width: 130,
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span style={{ overflow: 'hidden' }}><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        align:'center',
        width: 130,
      },
      {
        title: '价格单位',
        align:'center',
        dataIndex: 'unit',
        width: 130,
      },
      {
        title: '币种',
        align:'center',
        dataIndex: 'currency',
        width: 130,
      },
      {
        title: '使用月份',
        align:'center',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        align:'center',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        align:'center',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        align:'center',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        align:'center',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        align:'center',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        align:'center',
        dataIndex: 'remark',
        width: 130,
      }
    ];
    //固网及文印、其他类
    const goodsColumns2Draft = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 130,
        align:'center',
      },
      {
        title:'供应商名称',
        dataIndex:'supplierType',
        key:'supplierType',
        width:180,
        align:'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      // {
      //   title: '机房简称/专线名称',
      //   dataIndex: 'roomNameShort',
      //   key: 'roomNameShort',
      //   align:'center',
      //   width: 180
      // },
      {
        title: '计费二级项目',
        dataIndex: 'item2',
        width: 130,
        align:'center',
      },
      {
        title: '计费三级项目',
        dataIndex: 'item3',
        width: 130,
        align:'center',
      },
      {
        title: '计费四级项目',
        dataIndex: 'item4',
        width: 130,
        align:'center',
      },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        // width: 130,
        align:'center',
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span>
            <Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        align:'center',
        width: 130,
      },
      {
        title: '价格单位',
        dataIndex: 'unit',
        align:'center',
        width: 130,
      },
      {
        title: '币种',
        dataIndex: 'currency',
        align:'center',
        width: 130,
      },
      {
        title: '使用月份',
        align:'center',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        align:'center',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        align:'center',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        align:'center',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        align:'center',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        align:'center',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        align:'center',
        dataIndex: 'remark',
        width: 130,
      }
    ]

    const uploadProps = {
      action: api_config.getIDCAccountUpload.url,
      withCredentials: true,
      name: 'file',
      onChange: this.handleOnChange
    };

    const operation = {
      title: '操作',
      fixed: 'right',
      render: (text, record, index) => {
        if (text.status !== '已确认' && text.itemId !== '合计') {
          if (status === '待复核' ) {
            return (
              <span>
                <a onClick={() => { this.onConfirmItem(record, index) }}>确认</a>&nbsp;
                <a onClick={() => { this.onEditAccountDetail(record, index) }}>编辑</a>&nbsp;
                <Popconfirm placement="top" title='确定删除该条目吗？' onConfirm={() => { this.onArrayChildDel(index) }} okText="确定" cancelText="取消">
                  <a>删除</a>
                </Popconfirm>
              </span>
            )
          } else {
            return (
              <span>
                <a onClick={() => { this.onEditAccountDetail(record, index) }}>编辑</a>&nbsp;
                <Popconfirm placement="top" title='确定删除该条目吗？' onConfirm={() => { this.onArrayChildDel(index) }} okText="确定" cancelText="取消">
                  <a>删除</a>
                </Popconfirm>
              </span>
            )
          }
        }
      }
    }

    const fileColumns = [
      {
        title: '供应商附件',
        width: 130,
        render: (text, record, index) => {
          console.log(status)
          if (index === list.length - 1) {
            return null
          }
          return <span>
            <a onClick={() => {this.onuploadReviewFile(record, index)}}>
              { text.cloudSupplierFile ? text.cloudSupplierFileName : (status === '已确认' || status === '待审核') ? '' : '上传' }
            </a>
          </span>
          // return status === '已确认' || status === '待审核' ?
          //   <span>
          //     <a>
          //       { text.cloudSupplierFile ? text.cloudSupplierFileName : '' }
          //     </a>
          //   </span> :
          //   <span>
          //     <a onClick={() => {this.onuploadReviewFile(record, index)}}>
          //       { text.cloudSupplierFile ? text.cloudSupplierFileName : '上传' }
          //     </a>
          //   </span>
        }
      },
      {
        title: '复核附件',
        width: 130,
        render: (text, record, index) => {
          if (index === list.length - 1) {
            return null
          }
          return <span>
            <a onClick={() => {this.onDownloadReviewFile(record)}}>
              { text.cloudReviewSupplierFileName ? text.cloudReviewSupplierFileName : '' }
            </a>
          </span>
        }
      }
    ]

    if (type === 'edit') {   /**temp */
      goodsColumns.push(operation)
      goodsColumns1.push(operation)
      goodsColumns2.push(operation)
      goodsColumnsDraft.push(operation)
      goodsColumns1Draft.push(operation)
      goodsColumns2Draft.push(operation)
    }

    return (
      <ConfigProvider locale={zhCN}>
        <ControlledForm
          onValidate={(status) => {
            this.setState({ formValidate: status });
          }}
          ref={(f) => { this.form = f }}
          onSubmit={this.onSubmit}
          itemProps={formItemLayout}
          value={editDate}
          onChange={this.onFormChange}
          className="m-add-remark"
        >

          <div className="g-account-res-detail">
            <section className="m-section">
              <div className="m-title">
                <div className="m-title-icon"></div>
                <span className="u-title">账单类型</span>
              </div>
              <div style={{ margin: '30px' }}>{billType} {billTypeSubs}</div>
            </section >

            <section className="m-section m-account-goodsInfo">
              <div className="m-title">
                <div className="m-title-icon"></div>
                <span className="u-title">账单详情</span>
                {status === '草稿' ? <span style={{cssFloat:'right'}}><Button onClick={()=>this.addShows()}>新增</Button></span>:''}
              </div>
              {
                status === '草稿' ?
                //   <Table
                //     rowKey={(item) => Object.values(item).join()}
                //     columns={billType === 'IDC' ||
                // billType === '海外资源' ? goodsColumnsDraft :
                //       (billType === 'CDN' || billType === '云服务' ? goodsColumns1Draft : goodsColumns2Draft)}
                //     dataSource={list}
                //     pagination={false}
                //     locale={{ emptyText: '当前列表无数据' }}
                //     scroll={{ x: 'max-content' }}
                //   />

                  <Table
                    rowKey={(item) => Object.values(item).join()}
                    columns={billType === 'IDC' ||
                      billType === '海外资源' ? goodsColumnsDraft :
                      (billType === 'CDN' ? goodsColumns1Draft :
                        billType === '云服务' ? this.popArr(goodsColumns1Draft).concat(fileColumns).concat([operation]) : goodsColumns2Draft)}
                    dataSource={list}
                    pagination={false}
                    locale={{ emptyText: '当前列表无数据' }}
                    scroll={{ x: 'max-content' }}
                  />
                  :
                //   <Table
                //     rowKey={(item) => Object.values(item).join()}
                //     columns={billType === 'IDC' ||
                // billType === '海外资源' ? goodsColumns :
                //       (billType === 'CDN' || billType === '云服务' ? goodsColumns1 : goodsColumns2)}
                //     dataSource={list}
                //     pagination={false}
                //     locale={{ emptyText: '当前列表无数据' }}
                //     scroll={{ x: 'max-content' }}
                //   />

                  <Table
                    rowKey={(item) => Object.values(item).join()}
                    columns={billType === 'IDC' ||
                billType === '海外资源' ? goodsColumns :
                      billType === 'CDN' ? goodsColumns1 :
                        billType === '云服务' ? (type === 'edit' ? this.popArr(goodsColumns1).concat(fileColumns).concat([operation]) : this.popArr(goodsColumns1).concat(fileColumns)) : goodsColumns2 }
                    dataSource={list}
                    pagination={false}
                    locale={{ emptyText: '当前列表无数据' }}
                    scroll={{ x: 'max-content' }}
                  />
              }

            </section>
            <section className="m-section">
              <div className="m-title">
                <div className="m-title-icon"></div>
                <span className="u-title">账单资料</span>
              </div>
              <div>
                {
                  type === 'detail' ? (filePath ? <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F5F5F5', width: '30%' }}>
                    <div className="u-download-template"><PaperClipOutlined />附件</div>
                    <div><a onClick={this.onDownloadAccountDetail}>点击下载</a> </div>
                  </div> : '')
                    :
                    (filePath ?
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F5F5F5', width: '30%' }}>
                          <div className="u-download-template"><PaperClipOutlined />账单</div>
                          <div><a onClick={this.onDownloadAccount}>点击下载</a> </div>
                        </div>
                        <div style={{ margin: '15px 0' }}>
                          <div style={{ margin: '10px' }}>
                            <Upload
                              {...uploadProps}
                              fileList={this.state.fileurl ? this.state.fileurl : []}
                              style={{ textAlign: 'center' }}>
                              <div className="u-upload-block">
                                <Button ><UploadOutlined /> 上传文件</Button>
                                <span style={{ fontSize: '10px' }}></span>
                              </div>
                            </Upload>
                          </div>
                        </div>
                      </div> :
                      <div style={{ margin: '15px 0' }}>
                        <div style={{ margin: '10px' }}>
                          <Upload
                            {...uploadProps}
                            fileList={this.state.fileurl ? this.state.fileurl : []}
                            style={{ textAlign: 'center' }}>
                            <div className="u-upload-block">
                              <Button ><UploadOutlined /> 上传文件</Button>
                              <span style={{ fontSize: '10px' }}></span>
                            </div>
                          </Upload>
                        </div>
                      </div>)

                }
              </div>
            </section>
            { ((type === 'edit' && status === '待复核') || (type === 'detail' && status === '已确认')) || this.state.reviewFile  ?
              <section className="m-section">
                <div className="m-title">
                  <div className="m-title-icon"></div>
                  <span className="u-title">复核资料</span>
                </div>
                {
                  this.state.reviewFile ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F5F5F5', width: '30%' }}>
                        <div className="u-download-template"><PaperClipOutlined />{this.state.reviewFileName}</div>
                        <div><a onClick={this.onDownloadBpsFile}>下载文件</a> </div>
                      </div>
                    </div>
                  ) : null
                }

              </section> : null
            }

            <div className="m-operation" >
              <Button onClick={() => { this.props.history.goBack(); }}>返回</Button>
              {type === 'edit'|| status === '草稿' ? <Button type="primary" onClick={() => this.onSubmit()}>提交</Button> : ''}
              {status === '草稿' ? <Button type="primary" onClick={() => this.onDraft()}>存为草稿</Button> : ''}
            </div>
          </div >

          <UploadModal
            uploadSupplier={uploadSupplier}
            status={status}
            uploadOkClick={this.uploadOkClick.bind(this)}
            uploadCancel={this.uploadCancel.bind(this)}
          />

        </ControlledForm>
      </ConfigProvider>
    );
  }
}

export default function AccountResourcesDetailPage(props) { return <AccountResourcesDetail {...props} />; }
