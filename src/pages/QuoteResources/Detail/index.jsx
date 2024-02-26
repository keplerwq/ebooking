import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { message } from 'src/components';
import {
  Button,
  Row,
  Col,
  Table,
  Upload,
} from 'antd';
import {
  IdcSubject,
  IdcPeripheral,
  IdcCircuit,
  Other,
  ForeignResources,
  CloudServices,
  CDN
} from './form';
import {columnsFactory} from './tables';
import api from 'src/api';
import dispatchs from 'src/redux/dispatchs';
import {
  regQuoteResourcesFormSubmit,
  regQuoteResourcesFormReverse,
} from 'src/helps/regFormSubmit';
import './Detail.scss';
import moment from 'moment';
import downloadIcon from 'src/resource/img/info/download.png';
import uploadIcon from 'src/resource/img/upload-icon.png';

class AccountResourcesDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceRequireList: [],
      slaList: [],
      useDescriptionList: [],
      remarkList: [],
      templateName: 'IDC-主体机房',
      baseInfo: {},
      detailInfo: [],
      tableColumns: [],
      supplementShow: '',
      supplierName: '',
      secondName:'',
      formList: {},
      formListKey: 0,
      visible: false,
      supplierType: '',
      secondType: '',
      firstTypeList: [],
      /* 当前仅有idc有细分类 */
      secondTypeIDCList: [],
      // 二三级计费项等权限联动
      idcSub: {}, //IDC-主体机房
      idcPer: {}, //IDC-外围机房
      idcCir: {}, //IDC-线路
      cloudSer: {}, //云服务类
      foreignRes: {}, //海外资源类
      cdn: {}, //CDN类
      other: {}, //固网及文印和其他
      optionsForSelect: {},
      type: 'detail',
      isEditing: false,
      id: 0,
      email: '',
      supplierId:0,
      applicationId:'',
      provinceCityOptions: [],
      operatorsList: ['电信', '联通', '移动', '双线', '三线'],
    };
  }

  componentDidMount() {
    let query = this.props.match.params;
    const { getAuth } = this.props.actions;
    let { id, type, email,supplierId,applicationId} = query;
    let isEditing = false;
    if (type === 'edit') {
      // getAuth(() => this.setAuth());
      isEditing = true;
      let allListObj = {};
      let fixListObj = {};
      this.Save = setInterval(()=> {
        // 备注：之前数组迭代只留下 再次报价 和 草稿 的数据，但是会造成下标错乱的bug（不能编辑状态下的单子如果有阶梯单价，提交之后阶梯单价会消失）
        // 所以将迭代的条件去除，进行全部循环
        // Object.values(this.state.formList).filter(item => item.statusName === '再次报价' || item.statusName === '草稿').find((item, index) => {
        Object.values(this.state.formList).map((item, index) => {
          const key = item.key;
          allListObj[`refForm${key}`] = this[
            `refForm${key}`
          ].state.priceForm;
          fixListObj[`refForm${key}`] = this[
            `refForm${key}`
          ].state.fixForm;
        });
        const allList = Object.values(allListObj);
        const fixList = Object.values(fixListObj);
        const formDataObj = _.cloneDeep(this.props.updateForm);
        Object.values(formDataObj).forEach((item,index) => {
          let str = '';
          item.validityPeriod = moment(item.validityPeriod).format("YYYY-MM-DD");
          if (item.model === '阶梯单价' || item.model === '阶梯累计单价') {
            // https://sentry.n.netease.com/organizations/sentry/issues/1111/?project=1&query=is%3Aunresolved
            // 修复Cannot convert undefined or null to object 问题
            if (allList[index]) {
              Object.values(allList[index]).forEach((itemList, subIndex) => {
                let priceItem = itemList;
                if (priceItem) {
                  str += priceItem.min + priceItem.maze1 + 'x' + priceItem.maze2 + priceItem.max + ':' + priceItem.cost;
                  if (subIndex !== Object.values(allList[index]).length - 1) {
                    str += ','
                  }
                }
              })
            }
            item.price = str;
          } else if (item.model === '固定+阶梯单价') {
            if (fixList[index]) {
              Object.values(fixList[index]).forEach((fixItem, subIndex) => {
                str += 'x=' + fixItem.xprice + ':' + fixItem.totalprice + ','
              })
            }
            if (allList[index]) {
              Object.values(allList[index]).forEach((itemList, subIndex) => {
                let priceItem = itemList;
                str += priceItem.min + priceItem.maze1 + 'x' + priceItem.maze2 + priceItem.max + ':' + priceItem.cost;
                if (subIndex != Object.values(allList[index]).length - 1) {
                  str += ','
                }
              })
            }
            item.price = str;
          }
        })
        localStorage.setItem('UPDATEFORM', JSON.stringify(formDataObj));
        localStorage.setItem('FROMLIST', JSON.stringify(this.state.formList));
        localStorage.setItem('FROMLISTKEY', this.state.formListKey);
        localStorage.setItem('ID', id)
      }, 5000);
    }
    this.getDetail(id, email,supplierId,applicationId);
    this.setProvinceCityOptions();
    this.setState({ type, id, email, supplierId,applicationId,isEditing});
  }

  componentWillUnmount() {
    const { resetForm, saveFile } = this.props.actions;
    resetForm();
    saveFile('supplement', []);
    clearInterval(this.Save)
  }
  toggleDetail = ({type, key, id}) => {
    const list = [...this.state[key]]
    if (type === 'show') {
      this.setState({
        [key]: list.concat(id)
      })
    } else {
      const index = list.indexOf(id)
      list.splice(index, 1)
      this.setState({
        [key]: list
      })
    }
  }
  /* 设置用户新增报价的权限 */
  setAuth = () => {
    const { auth } = this.props;
    const firstTypeList = [];
    const secondTypeIDCList = [];
    const tempArr = Object.keys(auth);
    tempArr.forEach((item) => {
      const tempItem = item.split('-');
      if (!firstTypeList.includes(tempItem[0])) firstTypeList.push(tempItem[0]);
      if (tempItem[1]) secondTypeIDCList.push(tempItem[1]);
    });
    this.setState({ firstTypeList, secondTypeIDCList });
  };

  setProvinceCityOptions() {
    api.getProvinceCity().then((res) => {
      const provinceCityOptions = res.msg;
      this.setState({ provinceCityOptions });
    });
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
    switch (e.target.value) {
      case 1:
        this.supplierType = 'IDC-主体机房';
        break;
      case 2:
        this.supplierType = 'IDC-外围机房';
        break;
      case 3:
        this.supplierType = 'IDC-线路';
        break;
      case 4:
        this.supplierType = 'CDN';
        break;
      case 5:
        this.supplierType = '云服务';
        break;
      case 6:
        this.supplierType = '海外资源';
        break;
      case 7:
        this.supplierType = '固网及文印';
        break;
      case 8:
        this.supplierType = '其他';
        break;
      default:
        break;
    }
  };
  getDetail = (id, email,supplierId,applicationId) => {
    const { freshForm, saveFile } = this.props.actions;
    const params = {
      id:id,
      applicationId: applicationId,
      trackerEmail: email,
      supplierId:supplierId
    };
    api.getIDCQuoteDetail(params).then((res) => {
      //报价详情
      if (res.code === 0) {
        let baseInfo = res.msg.baseInfo;
        this.setTableColumns(res.msg.baseInfo.requireType, res.msg.baseInfo?.secondType);
        let detailInfo = res.msg.detailInfo;
        let supplementShow = res.msg.supplement;
        let uploadList = res.msg.uploadList;
        if ( uploadList && uploadList.length > 0) {
          saveFile('supplement', uploadList);
        }
        let secondName = res.msg.secondName; //变为二级简称
        this.setState({ detailInfo, baseInfo, supplementShow,secondName});
        let updateForm = {};
        let formList = {};
        let formListKey = 0;
        let quoteListInfo = res.msg.quoteListInfo;
        // 获取表单数据
        let query = this.props.match.params;
        if( localStorage.getItem('FROMLISTKEY') && localStorage.getItem('ID') === query.id && query.type === 'edit') {
          updateForm = JSON.parse(localStorage.getItem('UPDATEFORM'));
          formList = JSON.parse(localStorage.getItem('FROMLIST'));
          formListKey = localStorage.getItem('FROMLISTKEY');
          // updateForm = regQuoteResourcesFormReverse(updateForm);
          freshForm(updateForm);
        } else {
          if (quoteListInfo.length) {
            this.setState({
              secondEdit: true
            })
          }
          quoteListInfo.map((item, index) => {
            item.secondName = secondName;
            if( item.statusName === '草稿' || item.statusName === '再次报价') {
              item.city = item.city && item.city.split('-')
            }
            formList[index] = {
              supplierType: item.supplierType.split('-')[0] || item.supplierType,
              secondType: item.secondType || item.supplierType.split('-')[1] || '',
              statusName: item.statusName,
              key: formListKey
            }
            formListKey++;
            let params = {
              firstType: formList[index].supplierType,
              secondType: formList[index].secondType,
            };
            // debugger
            api.getSupplierLinkage(params).then((res) => {
              if (res.code == 0) {
                this.setState({
                  optionsForSelect: res.msg
                })
                // if (params.firstType === 'IDC') {
                //   if (params.secondType == '主体机房') {
                //     this.setState({ idcSub: res.msg });
                //   } else if (params.secondType == '外围机房') {
                //     this.setState({ idcPer: res.msg });
                //   } else if (params.secondType == '线路') {
                //     this.setState({ idcCir: res.msg });
                //   }
                // } else if (params.firstType === '云服务') {
                //   this.setState({ cloudSer: res.msg });
                // } else if (params.firstType === '海外资源') {
                //   this.setState({ foreignRes: res.msg });
                // } else if (params.firstType === 'CDN') {
                //   this.setState({ cdn: res.msg });
                // } else if (
                //   params.firstType === '固网及文印' ||
                //   params.firstType === '其他'
                // ) {
                //   this.setState({ other: res.msg });
                // }
              }
            });
            /* 格式化数据 */
            updateForm[index] = regQuoteResourcesFormReverse(item);
          });
          freshForm(updateForm);
        }
        this.setState({ formList, formListKey });
      }
    });
  };
  setTableColumns(type, subType) {
    /* 该逻辑摘自pcs，新建idc采购单 */
    let t = type;
    if (subType) {
      t += '+' + subType
    }
    let tableColumns = []
    switch (t) {
      case '线路类+电路':
        tableColumns = columnsFactory.call(this).lineClassCircuit
        break;
      case '线路类+裸纤':
        tableColumns = columnsFactory.call(this).lineClassBareFiber
        break;
      case '海外资源+IDC海外节点':
        tableColumns = columnsFactory.call(this).overseasResourcesIdc
        break;
      case '海外资源+国际电路':
        tableColumns = columnsFactory.call(this).overseasResourcesCircuit
        break;
      case '海外资源+国际裸纤':
        tableColumns = columnsFactory.call(this).overseasResourcesBareFiber
        break;
      case '云服务':
        tableColumns = columnsFactory.call(this).cloudServices
        break;
      case 'IDC主体机房':
        tableColumns = columnsFactory.call(this).mainEngineRoom
        break;
      case 'IDC边缘机房':
        tableColumns = columnsFactory.call(this).peripheralNode
        break;
      case '其他':
        tableColumns = columnsFactory.call(this).other
        break;
      case '裸纤类':
        tableColumns = columnsFactory.call(this).bareFiber
        break;
      case '国际专线':
        tableColumns = columnsFactory.call(this).internationalRoutes
        break;
      case 'IDC-主体机房':
        tableColumns = columnsFactory.call(this).oldMainEngineRoom
        break;
      case 'IDC-外围节点机房':
        tableColumns = columnsFactory.call(this).oldPeripheralNode
        break;
      case '国内专线-电路':
        tableColumns = columnsFactory.call(this).domesticRoute
        break;
      case 'DX专线':
        tableColumns = columnsFactory.call(this).DXRoute
        break;
      case '海外设备托管或租用':
        tableColumns = columnsFactory.call(this).overseas
        break;
      case 'CDN&P2P类':
        tableColumns = columnsFactory.call(this).CDNAndP2p
        break;
      default:
        break;
    }
    this.setState({ tableColumns });
  }

  addForm = () => {
    let { formList, formListKey, secondName } = this.state;
    const { freshForm } = this.props.actions;
    const newForm = {
      [formListKey]: {
        estimateIs: false,
        secondName,
        // tax: null,
        statusName: '再次报价',
      }
    };
    freshForm(newForm);
    formList[formListKey] = {
      key: formListKey,
      supplierType: '未知',
      secondType: '未知',
      statusName: '再次报价'
    };
    formListKey++;
    this.setState({ formList, formListKey }, () => {this.forceUpdate()});
  };

  delForm = (key) => {
    let {  formList , formListKey } = this.state;
    const { delForm } = this.props.actions;
    delete formList[key]
    formListKey --;
    this.setState({ formList, formListKey });
    delForm(key);
  };
  copyForm = (key) => {
    const { formList } = this.state;
    const { updateForm } = this.props;
    const { freshForm } = this.props.actions;
    let { formListKey } = this.state;

    let copyForm = Object.assign({}, updateForm[key]);
    copyForm.id && delete copyForm.id;
    copyForm.purchaseId && delete copyForm.purchaseId;
    copyForm.planId && delete copyForm.planId;
    copyForm.applicationId && delete copyForm.applicationId;
    let newForm = {
      [formListKey]: {...copyForm},
    };
    freshForm(newForm);
    const { supplierType, secondType } = updateForm[key];
    formList[formListKey] = {
      supplierType: (supplierType || '').split('-')[0] ,
      secondType: secondType || (supplierType || '').split('-')[1] || '',
      key: formListKey,
      statusName: '再次报价'
    };
    formListKey++;
    this.setState({ formList, formListKey });
    // copyForm(key)
  };
  submit = (type) => {
    const { formList, id, email,supplierId,applicationId} = this.state;
    const { updateForm, supplement } = this.props;
    if (Object.values(formList).length < 1) {
      message.info('请填写报价');
      return;
    }

    //  再次报价 和 草稿 状态的单子需要进行检测

    let allListObj = {};
    let fixListObj = {};
    // 备注：之前数组迭代只留下 再次报价 和 草稿 的数据，但是会造成下标错乱的bug（不能编辑状态下的单子如果有阶梯单价，提交之后阶梯单价会消失）
    // 所以将迭代的条件去除，进行全部循环
    // let isPass = Object.values(formList).filter(item => item.statusName === '再次报价' || item.statusName === '草稿').find((item, index) => {
    let isPass = Object.values(formList).map((item, index) => {
      let flag = true;
      const key = item.key;
      
      allListObj[`refForm${key}`] = this[
        `refForm${key}`
      ].state.priceForm;
      fixListObj[`refForm${key}`] = this[
        `refForm${key}`
      ].state.fixForm;

      if (item.statusName === '再次报价' || item.statusName === '草稿') {
  
        this[`refForm${key}`].form.submit(() => {
          flag = false;
        });
        return flag;
      }
    });

    console.log(isPass)

    const result = isPass.some(item => {return item})

    // const allList = this[`refForm${key}`].form.state.data;
    // const formDataObj = _.cloneDeep(updateForm);
    // const formArr = regQuoteResourcesFormSubmit(formDataObj,allList);

    // 备注： 之前有状态迭代时，isPass会返回true或者undefined，现在的isPass会返回一个数组
    // 所以需要对isPass进行二次处理成result再进行后续逻辑判断

    // if (!isPass) {
    if (!result) {
      /* 全部验证通过 */
      const formDataObj = _.cloneDeep(updateForm);
      const formArr = regQuoteResourcesFormSubmit(
        formDataObj,
        allListObj,
        fixListObj
      );
      console.log(updateForm)
      console.log(formArr)
      let url = '';
      let uploadArr =[];
      if (supplement.length > 0) {
        url = supplement[0].url ? supplement[0].url : supplement[0].response.data;
        uploadArr = supplement.map((item)=> {
          return {
            name: item.name,
            url: item.url ? item.url : item.response.data
          }
        })
      }
      const params = {
        baseInfo: {
          applicationId: applicationId,
          trackerEmail: email,
          id:id
        },
        quoteListInfo: formArr,
        supplement: url,
        uploadList: uploadArr || [],
        supplierId:supplierId,
        type
      };
      api.getIDCSubmitQuote(params).then((res) => {
        message.success(res.msg);
        localStorage.removeItem('UPDATEFORM')
        localStorage.removeItem('FROMLISTKEY')
        localStorage.removeItem('FROMLIST')
        localStorage.removeItem('ID')
        clearInterval(this.Save)
        this.props.history.goBack();
      });
    }
  };
  onUploadChange = (name, info) => {
    const { saveFile } = this.props.actions;
    let fileList = info.fileList.slice(-1);
    let url = '';
    fileList = fileList.filter((file) => {
      if (file.response) {
        if (file.response.errorCode === 0) {
          //如果上传成功，则加到文件列表中，否则不加
          url = file.response.data;
        }
        return file.response.errorCode === 0;
      }
      return true;
    });

    saveFile(name, fileList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
    }
  };
  render() {
    const col12 = {
      span: 12,
    };
    const {
      baseInfo,
      detailInfo,
      type,
      formList,
      isEditing,
      // supplierType,
      // secondType,
      supplementShow,
      tableColumns,
      // firstTypeList,
      // secondTypeIDCList,
      provinceCityOptions,
      operatorsList,
    } = this.state;
    const {
      // idcSub,
      // idcPer,
      // idcCir,
      // cloudSer,
      // foreignRes,
      // cdn,
      // other,
      optionsForSelect
    } = this.state;
    const { supplement, uploadProps } = this.props;
    return (
      <div className="g-quote-res-detail">
        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">采购申请基本信息</span>
          </div>
          <div className="m-order-info">
            <Row>
              <Col {...col12}>项目名称：</Col>
              <Col {...col12}>{baseInfo.projectName}</Col>
            </Row>
            <Row>
              <Col {...col12}>预计开始时间：</Col>
              <Col {...col12}>{baseInfo.planStartTime}</Col>
            </Row>
            <Row>
              <Col {...col12}>需求类型：</Col>
              <Col {...col12}>{baseInfo.requireType}</Col>
            </Row>
          </div>
        </section>

        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">询价详情</span>
          </div>

          <Table
            rowKey="_index"
            columns={tableColumns}
            dataSource={detailInfo}
            pagination={false}
          />
        </section>

        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">报价详情</span>
            {isEditing ? (
              <Button onClick={this.addForm} style={{ marginLeft: '10px' }}>
                新增报价
              </Button>
            ) : null}
          </div>
          {
            Object.values(formList).map((item, index) => {
              const { supplierType, secondType, key, statusName } = item;
              if (statusName === '再次报价' || statusName === '草稿') {
                return <CDN
                  provinceCityOptions={provinceCityOptions}
                  delForm={this.delForm}
                  copyForm={this.copyForm}
                  key={key}
                  formListIndex={index + 1}
                  formListKey={key}
                  autoComplete={optionsForSelect}
                  isEditing={isEditing}
                  ref={(ref) => (this[`refForm${key}`] = ref)}
                />
              } else {
                switch (supplierType) {
                  case 'IDC':
                    switch (secondType) {
                      case '主体机房':
                        return (
                          <IdcSubject
                            delForm={this.delForm}
                            copyForm={this.copyForm}
                            key={key}
                            formListIndex={index + 1}
                            formListKey={key}
                            autoComplete={optionsForSelect}
                            isEditing={isEditing}
                            provinceCityOptions={provinceCityOptions}
                            operatorsList={operatorsList}
                            ref={(ref) => (this[`refForm${key}`] = ref)}
                          />
                        );
                      case '外围机房':
                        return (
                          <IdcPeripheral
                            delForm={this.delForm}
                            copyForm={this.copyForm}
                            key={key}
                            formListIndex={index + 1}
                            formListKey={key}
                            autoComplete={optionsForSelect}
                            isEditing={isEditing}
                            provinceCityOptions={provinceCityOptions}
                            operatorsList={operatorsList}
                            ref={(ref) => (this[`refForm${key}`] = ref)}
                          />
                        );
                      case '线路':
                        return (
                          <IdcCircuit
                            delForm={this.delForm}
                            copyForm={this.copyForm}
                            key={key}
                            formListIndex={index + 1}
                            formListKey={key}
                            autoComplete={optionsForSelect}
                            isEditing={isEditing}
                            ref={(ref) => (this[`refForm${key}`] = ref)}
                          />
                        );
                      default:
                    }
                    break;
                  case 'CDN':
                    return (
                      <CDN
                        delForm={this.delForm}
                        copyForm={this.copyForm}
                        key={key}
                        formListIndex={index + 1}
                        formListKey={key}
                        autoComplete={optionsForSelect}
                        isEditing={isEditing}
                        ref={(ref) => (this[`refForm${key}`] = ref)}
                      />
                    );
                  case '云服务':
                    return (
                      <CloudServices
                        delForm={this.delForm}
                        copyForm={this.copyForm}
                        key={key}
                        formListIndex={index + 1}
                        formListKey={key}
                        autoComplete={optionsForSelect}
                        isEditing={isEditing}
                        ref={(ref) => (this[`refForm${key}`] = ref)}
                      />
                    );
                  case '海外资源':
                    return (
                      <ForeignResources
                        delForm={this.delForm}
                        copyForm={this.copyForm}
                        key={key}
                        formListIndex={index + 1}
                        formListKey={key}
                        autoComplete={optionsForSelect}
                        isEditing={isEditing}
                        provinceCityOptions={provinceCityOptions}
                        operatorsList={operatorsList}
                        ref={(ref) => (this[`refForm${key}`] = ref)}
                      />
                    );
                  case '固网及文印':
                    return (
                      <Other
                        delForm={this.delForm}
                        copyForm={this.copyForm}
                        key={key}
                        formListIndex={index + 1}
                        formListKey={key}
                        autoComplete={optionsForSelect}
                        isEditing={isEditing}
                        ref={(ref) => (this[`refForm${key}`] = ref)}
                      />
                    );
                  case '其他':
                    return (
                      <Other
                        delForm={this.delForm}
                        copyForm={this.copyForm}
                        key={key}
                        formListIndex={index + 1}
                        formListKey={key}
                        autoComplete={optionsForSelect}
                        isEditing={isEditing}
                        ref={(ref) => (this[`refForm${key}`] = ref)}
                      />
                    );
                  default:
                }
              }
            })
          }

        </section>
        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">报价资料</span>
          </div>

          {isEditing ? (
            <div className="m-upload-wrapper">
              <Upload
                {...uploadProps}
                fileList={supplement}
                onChange={(...args) => {
                  this.onUploadChange('supplement', ...args);
                }}
              >
                <Button className="u-uploader">
                  <img src={uploadIcon} alt="" />
                </Button>
              </Upload>
              <div className="u-upload-desc">
                <p>多个文件上传压缩后上传</p>
              </div>
            </div>
          ) : (
            <span>
              {supplementShow ? (
                <a href={supplementShow} target="_blank" download="附件">
                  {' '}
                  <img src={downloadIcon} alt="" />
                  下载附件{' '}
                </a>
              ) : (
                <span>未上传</span>
              )}
            </span>
          )}

        </section>

        <div className="m-operation">
          <Button
            onClick={() => {
              this.props.history.goBack();
              if (type === 'edit') {
                // localStorage.removeItem('UPDATEFORM');
                // localStorage.removeItem('FROMLISTKEY')
                // localStorage.removeItem('FROMLIST')
                clearInterval(this.Save)
              }
            }}
          >
            返回
          </Button>
          {type === 'edit' ? (
            <span>
              <Button type="primary" onClick={()=> this.submit(1)}>
              提交
              </Button>
              <Button onClick={() => this.submit(0)}>
              保存
              </Button>
            </span>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initFormData: state.quoteResources.initFormData,
    updateForm: state.quoteResources.updateForm,
    auth: state.quoteResources.auth,
    uploadProps: state.app.uploadProps,
    supplement: state.quoteResources.supplement,
  };
};

const AccountResourcesDetailWithConnect = connect(
  mapStateToProps,
  dispatchs('app', 'quoteResources')
)(AccountResourcesDetail)

export default function AccountResourcesDetailWithConnectPage(props) { return <AccountResourcesDetailWithConnect {...props} />; }
