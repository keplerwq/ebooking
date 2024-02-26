import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, InputNumber, Row, Col, Cascader, DatePicker, Popover, Spin } from 'antd';
import { FormEx2, message, } from 'src/components';
import { Card } from 'src/containers';
import moment from 'moment';
import api from 'src/api';
import { map } from './index';

const { Option } = Select;
const { Item } = FormEx2;

const maxLength = 50;
const item2Content = <div>
  <div>请填写加速类型等，如合并带宽/点播/下载/直播/页面/流量/....... </div>
  <div></div>
</div>
const item3Content = <div>
  <div>请填写区域，如服务内容属于合并带宽则补充填写包含的加速类型；如大陆区域或下载海外</div>
  <div></div>
</div>
const modelContent = <div>
  <div>价格计费模式</div>
  <div>1、固定单价：数量*单价得出总价</div>
  <div>2、固定单价（按年）：单价请输入月单价。 当输入计费天数=当月总天数，计算公式为：数量*单价（元/月）；当输入计费天数≠当月总天数，计算公式为：数量*单价（元/月）*12/365*计费天数</div>
  <div>3、阶级单价：每个数量阶梯对应一个单价，实际使用数量*该阶梯单价，得出总价</div>
  <div>4、阶梯累计单价：每个数量阶梯对应一个单价，每个阶梯内的使用数量*该阶梯单价，累加后得出总价</div>
  <div>5、固定+阶梯单价：不同固定数量对应不同固定总价格，超出最大固定数量部分对应一个单价，固定总价格+超出数量*单价，得出总价</div>
</div>



class CDN extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      checkEdit: false,
      fieldList: [],
      mapList: [],
      isEditing: false,
      formItem: {},
      priceForm: {
        priceForm0:{
          min: 0,
          maze1: '<',
          maze2: '<',
          max: "∞",
          cost: 0
        }
      },
      fixForm: {
        fixForm0: {
          xprice: 0,
          totalprice: 0
        }
      },
      formKey: 0,
      fixFormKey: 0,
      priceFormList: [0],
      fixFormList: [0]
    }
  }
  componentDidMount() {
    const { updateForm = {}, isEditing = false, formListKey } = this.props;
    const { supplierType, statusName } = updateForm[formListKey];
    let checkEdit;
    if(statusName !== '再次报价' && statusName !== '草稿'){
      checkEdit = false;
    } else{
      checkEdit = isEditing;
    }
    this.setState({
      checkEdit
    })
    if (checkEdit) {
      if (supplierType) {
        this.getDetailNew(null, null, true);
      } else {
        this.getDetailNew();
      }
    }

    if(isEditing) {
      if(updateForm[formListKey].model == '阶梯单价' ||
        updateForm[formListKey].model == '阶梯累计单价'){
        let list = updateForm[formListKey].price && updateForm[formListKey].price.split(',');
        // console.log('list', list)
        let xform = {};
        const key = [];
        list && list.map((item,index) => {
          let arr = item.split(':');
          let all = arr[0] && arr[0].split('x');
          let all0 = all[0] && all[0].split('');
          let all1 = all[1] && all[1].split('');
          let front = '';
          let maze1 = '';
          let maze2 = '';
          let end = '';
          all0 && all0.map((i,index0)=> {
            if(i !== '<' && i !== '='){
              front+= i;
            }else{
              maze1 += i
            }
          })
          all1 && all1.map((x,index2) => {
            if(x != '<' && x!='='){
              end+=x;
            }else{
              maze2 += x
            }
          })
          // console.log(front,'front',maze1,'maze1',maze2,'maze2',end,'end');
          let arr1 = arr[1];
          xform[`priceForm${index}`] = {
            min: front,
            maze1: maze1,
            maze2: maze2,
            max: end,
            cost: arr1
          }
          key.push(index);
        })
        this.setState({
          priceForm: {...xform},
          priceFormList: key
        },()=>{
          // console.log(this.state.priceForm);
        })
        // this.form1.setValues(xform)
      }else if(updateForm[formListKey].model == '固定+阶梯单价'){
        let listAll = updateForm[formListKey].price && updateForm[formListKey].price.split(',');
        let list = [];
        let fixList = [];
        if (Array.isArray(listAll) && listAll.length) {
          listAll.map((listItem,listIndex) => {
            let liItem = listItem.split('');
            if(liItem.indexOf('<') !== -1){
              list.push(listAll[listIndex]);
            }else{
              fixList.push(listAll[listIndex]);
            }
          })
          let fform = {};
          let fkey = [];
          let xform = {};
          let key = [];
          fixList.map((item,index) => {
            let all = item.split(':');
            let xItem = all[0].split('=');
            let count = all[1];
            fform[`fixForm${index}`] = {
              xprice: xItem[1],
              totalprice: count
            }
            fkey.push(index);
          })
          this.setState({
            fixForm: {...fform},
            fixFormList: fkey
          })
          list && list.map((item,index) => {
            let arr = item.split(':');
            let all = arr[0].split('x');
            let all0 = all[0].split('');
            let all1 = all[1].split('');
            let front = '';
            let maze1 = '';
            let maze2 = '';
            let end = '';
            all0.map((i,index0)=> {
              if(i !== '<' && i !== '='){
                front+= i;
              }else{
                maze1 += i
              }
            })
            all1.map((x,index2) => {
              if(x != '<' && x!='='){
                end+=x;
              }else{
                maze2 += x
              }
            })
            let arr1 = arr[1];
            xform[`priceForm${index}`] = {
              min: front,
              maze1: maze1,
              maze2: maze2,
              max: end,
              cost: arr1
            }
            key.push(index);
          })
          this.setState({
            priceForm: {...xform},
            priceFormList: key
          })
        }
      }
    }
  }


  componentWillReceiveProps(props) {
    const { updateForm} = props;
    // const statusName = updateForm[formListKey].statusName;
    // const {checkEdit } = this.state;
    // if(statusName !== '再次报价'){
    //   this.setState({
    //     checkEdit:false
    //   })
    // }else{
    //   this.setState({
    //     checkEdit:isEditing
    //   })
    // }
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  changeDetail = (fieldName, values) => {
    if (fieldName ==='supplierType'){
      this.resetDetail(values);
    } else if (fieldName === 'item2') {
      this.resetDetail(values);
    }
  };

  resetDetail(values) {
    const { formListKey } = this.props;
    const { supplierType, item2 } = values[formListKey];
    if (supplierType && item2) {
      const { fieldList } = this.state;

      const str = (supplierType.includes('IDC') || supplierType.includes('海外资源')) ? supplierType + '-' + item2 : supplierType + '-';
      const data = fieldList.find((item) => {
        return item.scope === str;
      })
      if (data) {
        this.setState({
          mapList: data.data
        });
      } else {
        this.getDetailNew(supplierType, values);
      }
    } else if(supplierType) {
      this.getDetailNew(supplierType, values);
    }
  };

  getDetailNew = (templateName=null, values, forShow) => {
    this.setState({
      loading: true
    });
    const params = {
      templateName,
    };
    api.getIDCQuoteDetailNew(params).then((res) => {
      //报价详情新接口
      if (res.code === 0) {
        const dataList = res.msg.supplierTypeId;
        const detailList = dataList.map((item, index) => {
          const data = item.baseList
            .concat(item.paramList)
            .concat(item.otherList);
          data.forEach((son) => {
            son.name = map[son.fieldName];
          })
          item.data = data;

          return item.data;
        });
        if (forShow) {
          this.setState({
            fieldList: dataList
          })
          const { updateForm } = this.props;
          this.resetDetail(updateForm);
        } else {
          const {updateForm, formListKey} = this.props
          const { supplierType, item2 } = updateForm[formListKey];
          let data
          // 根据传入的业务类型 二级计费项匹配
          if (supplierType && item2) {
            data = dataList.find((item) => {
              const str = (supplierType.includes('IDC') || supplierType.includes('海外资源')) ? supplierType + '-' + item2 : supplierType + '-';
              return item.scope === str;
            })
            // 如果没有匹配到正常情况下应该把二级计费项的value清空，这里开发同学设计不合理，不应该直接操作props的updateForm，因此没有清空，所以存在问题
            if (data) {
              data = data.data
            } else {
              // 如果没有匹配，说明业务类型和二级计费项不匹配，正常情况下应该重新选择二级计费项
              // 这里兜底默认取第一个，设计不合理
              data = detailList[0]
            }
          } else {
            data = detailList[0]
          }
          this.setState({
            mapList: data,
            fieldList: dataList
          },()=>{
            this.forceUpdate();
          })
        }
        this.setState({
          loading: false
        });
      }
    }).catch((e) => {
      this.setState({
        loading: false
      });
    });
  };

  onFormChange = (values, key, val) => {
    const temp = String(key).split('[')[2];
    const fieldName = String(temp).split(']')[0];
    this.changeDetail(fieldName, values);
    /* 赋值至redux */
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  areaFilter = (obj) => {
    if (obj && obj !== 'null') return obj;
    return '';
  }
  onPriceFormChange = (values,key) => {      //重要!!!!!
    // console.log(values,'PriceFormChange');
    this.form1.setValues(values);
    this.setState({
      priceForm: values
    })
  }
  onFixFormChange = (val) => {
    // console.log(val);
    this.form2.setValues(val);
    this.setState({
      fixForm: val
    })
  }
  addPriceForm = () => {
    const { priceFormList,priceForm ,formKey} = this.state;
    let key = formKey + 1;
    priceForm[`priceForm${key}`] = {
      min: 0,
      maze1: '<',
      maze2: '<',
      max: "∞",
      cost: 0
    }
    this.setState({
      priceFormList: [...priceFormList, key],
      priceForm,
      formKey: key
    })
    this.form1.setValues(priceForm);
  }
  addFixForm = () => {
    const { fixFormList,fixForm ,fixFormKey} = this.state;
    let key = fixFormKey + 1;
    fixForm[`fixForm${key}`] = {
      xprice: 0,
      totalprice: 0
    }
    this.setState({
      fixFormList: [...fixFormList, key],
      fixForm,
      fixFormKey: key
    })
    this.form2.setValues(fixForm);
    this.setState({
      fixForm
    })
  }
  delPriceForm = (val) => {
    const { priceFormList,priceForm,formKey } = this.state;
    let index = priceFormList.indexOf(val);
    priceFormList.splice(index,1)
    priceForm[`priceForm${val}`] = null
    this.setState({
      priceFormList,
      priceForm
    })
  }
  delFixForm = (val) => {
    const { fixFormList,fixForm,fixFormKey } = this.state;
    let index = fixFormList.indexOf(val);
    fixFormList.splice(index,1)
    fixForm[`fixForm${val}`] = null
    this.setState({
      fixFormList,
      fixForm
    })
  }
  checkMax = (values,key,value) => {
    var re = /^[0-9]+.?[0-9]*/;
    const { priceForm,formKey } = this.state;
    let min = priceForm[`priceForm${formKey}`].min;
    let max = priceForm[`priceForm${formKey}`].max;
    if(max !== '∞' && !re.test(max)) {
      message.error('区间只能输入数字');
      priceForm[`priceForm${formKey}`].max = '';
      this.form1.setValues(priceForm,true);
    }else if(max < min){
      message.error('该数字必须大于最小值');
      priceForm[`priceForm${formKey}`].max = '';
      this.form1.setValues(priceForm,true);
    }else{}
  }
  validFunction = (rule, value, callback) => {
    if (!value || (value !== "∞" && isNaN(value))) {
      callback(new Error(" "));
    } else {
      callback();
    }
  }
  // 获得焦点时回调
  getPriceUnit = (index) => {
    const { updateForm,autoComplete,formListKey } = this.props;
    const itemFlag = updateForm[formListKey].item2 == undefined ? '' : updateForm[formListKey].item2[0];
    let autoList = Object.keys(autoComplete);
    autoList.splice(autoList.indexOf('自定义'),1);
    if(updateForm[index].currency && updateForm[index].unit) {
      let params = {
        currency: updateForm[index].currency,
        unit: updateForm[index].unit[0]
      };
      api.getFindPriceUnit(params).then((res) => {
        if(res.code == 0){
          if(autoList.indexOf(itemFlag) == -1){
            autoComplete['自定义'].priceUnits = res.msg;
          }else{
            autoComplete[itemFlag].priceUnits = res.msg;
          }
          this.setState({autoComplete})
        }
      })
    }else{
      message.warn('请先选择数量单位和币种！');
    }
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xl: { span: 10 },
        xxl: { span: 8 },
      },
      wrapperCol: {
        xl: { span: 14 },
        xxl: { span: 16 },
      },
    };
    const formItemLayout3 = {
      labelCol: { span: 8},
      wrapperCol: { span: 16 },
    };
    const formItemLayout4 = {
      labelCol: { span: 4},
      wrapperCol: { span: 20 },
    };
    const col6 = {
      span: 6
    }
    const col8 = {
      span: 8
    }
    const col24 = {
      span: 24
    }
    const { updateForm = {}, formListKey,formListIndex,autoComplete, provinceCityOptions } = this.props;
    // console.log(updateForm)
    const { priceFormList,fixForm,fixFormList,priceForm,checkEdit, mapList} = this.state;
    /* 获取当前表单select的option */
    // const first = updateForm[formListKey].supplierType;
    // const second = updateForm[formListKey].secondType === "N" ? '' : `-${updateForm[formListKey].secondType}`;
    // const selectsList = auth[`${first}${second}`];
    const otherObj = autoComplete['自定义'];
    const statusName = updateForm[formListKey].statusName;
    const itemFlag = updateForm[formListKey].item2;
    let autoList = Object.keys(autoComplete);
    autoList.splice(autoList.indexOf('自定义'),1);
    // console.log('mapList', mapList)
    // console.log(provinceCityOptions)
    return (
      <div className="g-quote-from-res">
        <Card
          formListIndex={formListIndex}
          supplierType={updateForm[formListKey].supplierType}
          secondType={updateForm[formListKey].secondType}
          statusName={updateForm[formListKey].statusName}
          isEditing={checkEdit}
          del={() => { this.props.delForm(formListKey) }}
          copy={() => { this.props.copyForm(formListKey) }}
        />
        <Spin spinning={this.state.loading}>
          <FormEx2
            defaultValues={updateForm}
            onChange={(values, key, value) => { this.onFormChange(values, key, value) }}
            ref={(f) => { this.form = f }}
            layout="inline"
          >
            {/*{console.log('statusName', statusName)}*/}
            {statusName === '再次报价' || statusName === '草稿' ? <React.Fragment><Row className="dynamic-row">
              <Col {...col8}>
                <Item {...formItemLayout} label="供应商简称"
                  dataIndex={`[${formListKey}].secondName`}
                  decorator={ <span>{_.get(updateForm, `[${formListKey}].secondName`, '')}</span>}
                />
              </Col>
              {mapList.map((item, index) => {
                if((item.name === 'item2' && !item.fieldType.includes('自定义')) || (['item2', 'roomName', 'estimatePrice', 'supplierName'].indexOf(item.name) < 0)) {return (
                  <Col {...col8} key={item.id}>
                    <Item
                      required = {item.requiredFlag}
                      {...formItemLayout}
                      label={
                        item.name === 'model'
                          ? (<Popover content={modelContent} trigger="hover">
                            <span>价格计费模式 <QuestionCircleOutlined /></span>
                          </Popover>)
                          : (item.name === 'item2'
                            ? (<Popover content={item2Content} trigger="hover">
                              <span>{item.fieldName} <QuestionCircleOutlined /></span>
                            </Popover>)
                            : (item.name === 'item3'
                              ? (<Popover content={item3Content} trigger="hover">
                                <span>{item.fieldName} <QuestionCircleOutlined /></span>
                              </Popover>)
                              : (item.name === 'tax'
                                ? `${item.fieldName}(%)`
                                : item.fieldName)))}
                      dataIndex={`[${formListKey}][${item.name}]`}
                      rules={item.fieldType.includes('自定义')? [{ required: item.requiredFlag, message: '该字段必填' }, { type: 'array', len: 1, message: '请选择单个' }]:[{ required: item.requiredFlag, message: '该字段必填' }]}
                      decorator={
                        item.fieldType.includes('自定义') ? <Select
                          mode="tags"
                          placeholder="请选择/自定义"
                        >
                          {
                            item.optionContent && item.optionContent.map((son, sonIndex) =>
                              <Option value={son} key={son} > {son} </Option>)
                          }
                        </Select>
                          :item.fieldType.includes('输入') ?
                            item.name === 'tax' ? <InputNumber min={0} style={{width: '100%'}} placeholder="请输入" /> : <Input maxLength={100} placeholder="请输入" />
                            : (
                              <Select
                                placeholder="请下拉选择"
                              >
                                {
                                  item.optionContent && item.optionContent.map((son, sonIndex) =>
                                    <Option value={son} key={son} > {son} </Option>)
                                }
                              </Select>
                            )
                      }
                    />
                  </Col>
                ); } else if (item.fieldType.includes('国家')) {
                  return (
                    <Col key={item.id} {...col24} style={{display: 'flex', justifyContent: 'flex-start'}}>
                      <Col {...col8}>
                        <Item
                          {...formItemLayout}
                          label="机房名称"
                          dataIndex={`[${formListKey}].city`}
                          required={item.requiredFlag}
                          rules={[{ required: item.requiredFlag, message: '该字段必填' },]}
                          decorator={
                            (_.get(updateForm, `[${formListKey}].supplierType`, '')).includes('海外') ? <Cascader  options={provinceCityOptions} placeholder="请选择" /> : <Cascader  options={provinceCityOptions.slice(0, 1)} placeholder="请选择" />
                          }
                        />
                      </Col>
                      {_.get(updateForm, `[${formListKey}].city`, '') == '海外' && <Col {...col8}>
                        <Item
                          dataIndex={`[${formListKey}].area`}
                          // trigger='onBlur'
                          required={item.requiredFlag}
                          rules={[{ required: item.requiredFlag, message: '该字段必填' },]}
                          decorator={
                            <Input maxLength={maxLength} placeholder="请输入国家" />
                          }
                        />
                      </Col>}
                      {_.get(updateForm, `[${formListKey}].city`, '') != '海外' &&  item.fieldType.includes('地名') &&<Col {...col8}>
                        <Item
                          dataIndex={`[${formListKey}].area`}
                          // trigger='onBlur'
                          required={item.requiredFlag}
                          rules={[{ required: item.requiredFlag, message: '该字段必填' },]}
                          decorator={
                            <Input maxLength={maxLength} placeholder="请输入地名" />
                          }
                        />
                      </Col>}
                      { (!item.fieldType.includes('地名') || _.get(updateForm, `[${formListKey}].city`, '') == '海外') &&<Col {...col8}>
                        <Item
                          dataIndex={`[${formListKey}].roomName`}
                          // trigger='onBlur'
                          required={item.requiredFlag}
                          rules={[{ required: item.requiredFlag, message: '该字段必填' },]}
                          decorator={
                            <Input maxLength={maxLength} placeholder="请输入机房名称" />
                          }
                        />
                      </Col>}
                      {item.fieldType.includes('地名') && _.get(updateForm, `[${formListKey}].city`, '') != '海外' && (
                        <Col {...col8}>
                          <Item
                            dataIndex={`[${formListKey}].operators`}
                            // trigger='onBlur'
                            required={item.requiredFlag}
                            rules={[{ required: item.requiredFlag, message: ' ' }, { type: 'array', len: 1, message: '请选择单个' }]}
                            decorator={
                              //  optionFilterProp='children'  mode='tags'
                              <Select mode="tags" allowClear placeholder="请选择/自定义运营商">
                                <Option value={"电信"} key={"电信"} label={"电信"}> {"电信"} </Option>
                                <Option value={"联通"} key={"联通"} label={"联通"}> {"联通"} </Option>
                                <Option value={"移动"} key={"移动"} label={"移动"}> {"移动"} </Option>
                                <Option value={"双线"} key={"双线"} label={"双线"}> {"双线"} </Option>
                                <Option value={"三线"} key={"三线"} label={"三线"}> {"三线"} </Option>
                              </Select>
                            }
                          />
                        </Col>
                      )}
                    </Col >)
                } else if (item.name === 'item2' && item.fieldType.includes('自定义')) {
                  return (
                    <React.Fragment key={item.id}>
                      <Col {...col8}>
                        <Item
                          required = {item.requiredFlag}
                          {...formItemLayout}
                          label={<Popover content={item2Content} trigger="hover">
                            <span>{item.fieldName} <QuestionCircleOutlined /></span>
                          </Popover>}
                          dataIndex={`[${formListKey}][${item.name}]`}
                          rules={[{ required: item.requiredFlag, message: '该字段必填' }]}
                          decorator={<Select placeholder="请下拉选择">
                            {
                              item.optionContent && item.optionContent.map((son, sonIndex) =>
                                <Option value={son} key={son} > {son} </Option>)
                            }
                          </Select>}
                        />
                      </Col>
                      {_.get(updateForm, `[${formListKey}].item2`, '') === '自定义' && <Col {...col8}>
                        <Item
                          dataIndex={`[${formListKey}].item2Copy`}
                          required
                          rules={[{ required: true, message: '该字段必填' },]}
                          decorator={
                            <Input maxLength={100} placeholder="请输入自定义的二级计费项名称" />
                          }
                        />
                      </Col>}
                    </React.Fragment>
                  );
                }
              })}
            </Row>
            <Row className="dynamic-row">
              <Col {...col8} key={1}>
                <Item {...formItemLayout} label="报价有效期限" required
                  useMoment
                  dataIndex={`[${formListKey}].validityPeriod`}
                  defaultValue={moment(new Date())}
                  rules={[{ required: true, message: '该字段必填' },]}
                  decorator={ checkEdit ?
                    <DatePicker  placeholder="请选择日期" format={"YYYY-MM-DD"}/>
                    :
                    <span>{moment(_.get(updateForm, `[${formListKey}].validityPeriod`, '')).format("YYYY-MM-DD")}</span>
                  }
                />
              </Col>
            </Row>
            <Row style={{height: 'auto'}}>
              {(() => {
                switch (updateForm[formListKey].model){
                  case '固定单价' :
                  case '固定单价(按年)':
                    return (
                      <Col {...col8} key={1}>
                        <Item {...formItemLayout} label="含税价格" required
                          dataIndex={`[${formListKey}].price`}
                          rules={[{ required: true, message: '该字段必填' },]}
                          decorator={ checkEdit ?
                            <InputNumber min={0} style={{width: '100%'}} placeholder="请输入" />
                            :
                            <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                          }
                        />
                      </Col>
                    )
                  case '官网折扣' :
                    return (
                      <Col {...col8} key={4}>
                        <Item {...formItemLayout} label="折扣率" required
                          dataIndex={`[${formListKey}].discountRate`}
                          rules={[{ required: true, message: '该字段必填' },]}
                          decorator={ checkEdit ?
                            <Input maxLength={100} placeholder="请输入" />
                            :
                            <span>{_.get(updateForm, `[${formListKey}].discountRate`, '')}</span>
                          }
                        />
                      </Col>
                    )
                  case '阶梯单价' :
                  case '阶梯累计单价':
                    return (
                      <Col  span={20} key={2}>
                        <Item label="价格区间" {...formItemLayout4}
                        // dataIndex={`[${formListKey}].price`}
                        // onChange={() => this.getPrice(`[${formListKey}].price`)}
                        // rules={[{ required: true, message: ' ' },]}
                          decorator={ checkEdit ?
                            (
                              <FormEx2 defaultValues={priceForm} layout="inline"
                                ref={(f) => { this.form1 = f }}
                                onChange={(values) => { this.onPriceFormChange(values,formListKey)}}>
                                {
                                  Object.values(priceFormList).map((item,index) =>{
                                    return (
                                      <Col span={20}
                                        style={{
                                          height: '60px',
                                          display: 'flex',
                                          justifyContent: 'flex-start',
                                        }}
                                        key={index}>
                                        <Col span={5}>
                                          <Item {...formItemLayout3} label="数量" dataIndex={`[priceForm${item}].min`}
                                            rules={[{ required: true, message: ' ' },]} required
                                            decorator={
                                              <InputNumber style={{width:'100%'}}/>
                                            }
                                          />
                                        </Col>
                                        <Col span={3}>
                                          <Item  dataIndex={`[priceForm${item}].maze1`}
                                            rules={[{ required: true, message: ' ' },]}
                                            decorator={
                                              <Select >
                                                <Option value="<">{'<'} </Option>
                                                <Option value="<=">{'<='} </Option>
                                              </Select>
                                            }
                                          />
                                        </Col>
                                        <div style={{cssFloat:'left',display:'inline-block',width:'10px',marginTop: '10px'}}>X</div>
                                        <Col span={3}>
                                          <Item dataIndex={`[priceForm${item}].maze2`}
                                            rules={[{ required: true, message: ' ' },]}
                                            decorator={
                                              <Select>
                                                <Option value="<">{'<'} </Option>
                                                <Option value="<=">{'<='} </Option>
                                              </Select>
                                            }
                                          />
                                        </Col>
                                        <Col span={3}>
                                          <Item dataIndex={`[priceForm${item}].max`} required
                                            // trigger='onChange'
                                            rules={[{ required: true, message: ' ' },{validator: this.validFunction}]}
                                            // onChange={() => {this.checkMax()}}
                                            decorator={
                                              <Input onBlur={() => {this.checkMax()}}/>
                                            }
                                          />
                                        </Col>
                                        <Col span={5}>
                                          <Item label="价格" dataIndex={`[priceForm${item}].cost`} {...formItemLayout}
                                            rules={[{ required: true, message: ' ' },]} required
                                            decorator={
                                              <InputNumber />
                                            }
                                          />
                                        </Col>
                                        {
                                          index < 1 ?
                                            (
                                              <div style={{ width: '30px',height: '30px',marginTop: '4px',marginLeft: '25px', lineHeight: '28px',
                                                textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                              onClick={() => this.addPriceForm()}>
                                                <PlusOutlined />
                                              </div>
                                            ) : (
                                              <div style={{ width: '30px',height: '30px',marginTop: '4px',marginLeft: '25px', lineHeight: '28px',
                                                textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delPriceForm(item)}}>
                                                <MinusCircleOutlined className="dynamic-delete-button" />
                                              </div>
                                            )
                                        }
                                      </Col>
                                    );
                                  })
                                }
                              </FormEx2>
                            )
                            :
                            <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                          }
                        />
                      </Col>
                    );
                  case '固定+阶梯单价' :
                    return (
                      <Col span={20}  key={3}>
                        <Item {...formItemLayout4} label="价格区间"
                        // required
                        // dataIndex={`[${formListKey}].price`}
                        // rules={[{ required: true, message: ' ' },]}
                          decorator={ checkEdit ?
                            (<Col {...col24} style={{height: 'auto'}}>
                              <Row style={{height: 'auto'}} key={3}>
                                <FormEx2 defaultValues={fixForm} layout="inline"
                                  ref={(f) => { this.form2 = f}}
                                  onChange={(values) => { this.onFixFormChange(values,formListKey)}}>
                                  {
                                    Object.values(fixFormList).map((item,index) => {
                                      return (
                                        <Col span={20} style={{
                                          height: '60px',
                                          display: 'flex',
                                          justifyContent: 'flex-start',
                                        }} key={index}>
                                          <Col span={8}>
                                            <Item {...formItemLayout3} label="X=" dataIndex={`[fixForm${item}].xprice`}
                                              rules={[{ required: true, message: ' ' },]} required
                                              decorator={
                                                <InputNumber style={{marginRight: '25px'}}/>
                                              }
                                            />
                                          </Col>
                                          <Col style={{marginLeft: '25px'}} span={8}>
                                            <Item {...formItemLayout3} label="总价=" dataIndex={`[fixForm${item}].totalprice`}
                                              rules={[{ required: true, message: ' ' },]} required
                                              decorator={
                                                <InputNumber style={{marginRight: '25px'}} />
                                              }
                                            />
                                          </Col>
                                          {
                                            index < 1 ?
                                              (
                                                <div style={{ width: '30px',height: '30px',marginTop: '4px', marginLeft: '25px', lineHeight: '28px',
                                                  textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                                onClick={() => this.addFixForm()}>
                                                  <PlusOutlined />
                                                </div>
                                              ) : (
                                                <div style={{ width: '30px',height: '30px',marginTop: '4px', marginLeft: '25px', lineHeight: '28px',
                                                  textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delFixForm(item)}}>
                                                  <MinusCircleOutlined className="dynamic-delete-button" />
                                                </div>
                                              )
                                          }
                                        </Col>
                                      );
                                    })
                                  }
                                </FormEx2>
                              </Row>
                              <Row style={{height: 'auto'}} key={4}>
                                <FormEx2 defaultValues={priceForm} layout="inline"
                                  ref={(f) => { this.form1 = f }}
                                  onChange={(values) => { this.onPriceFormChange(values,formListKey)}}>
                                  {
                                    Object.values(priceFormList).map((item,index) =>{
                                      return (
                                        <Col span={24} style={{
                                          height: '60px',
                                          display: 'flex',
                                          justifyContent: 'flex-start',
                                        }} key={index}>
                                          <Col span={5}>
                                            <Item {...formItemLayout3} label="数量" dataIndex={`priceForm${item}.min`}
                                              rules={[{ required: true, message: ' ' },]} required
                                              decorator={
                                                <InputNumber style={{width:'100%', marginRight: '25px'}}/>
                                              }
                                            />
                                          </Col>
                                          <Col span={3}>
                                            <Item  dataIndex={`priceForm${item}.maze1`}
                                              rules={[{ required: true, message: ' ' },]}
                                              decorator={
                                                // style={{width: '100px'}}
                                                <Select >
                                                  <Option value="<">{'<'} </Option>
                                                  <Option value="<=">{'<='} </Option>
                                                </Select>
                                              }
                                            />
                                          </Col>
                                          <div style={{cssFloat:'left',display:'inline-block',width:'10px',marginTop: '10px'}}>X</div>
                                          <Col span={3}>
                                            <Item dataIndex={`priceForm${item}.maze2`}
                                              rules={[{ required: true, message: ' ' },]}
                                              decorator={
                                                <Select>
                                                  <Option value="<">{'<'} </Option>
                                                  <Option value="<=">{'<='} </Option>
                                                </Select>
                                              }
                                            />
                                          </Col>
                                          <Col style={{marginRight: '25px'}} span={3}>
                                            <Item dataIndex={`priceForm${item}.max`}
                                              rules={[{ required: true, message: ' ' },{validator: this.validFunction}]}
                                              // onChange={(values,key,value) => {this.checkMax(values,key,value)}}
                                              decorator={
                                                <Input onBlur={() => {this.checkMax()}}/>
                                              }
                                            />
                                          </Col>
                                          <Col style={{marginRight: '25px'}} span={5}>
                                            <Item label="价格" dataIndex={`priceForm${item}.cost`} {...formItemLayout}
                                              rules={[{ required: true, message: ' ' },]} required
                                              decorator={
                                                <InputNumber />
                                              }
                                            />
                                          </Col>
                                          {
                                            index < 1 ?
                                              (
                                                <div style={{ minWidth: '30px',height: '30px',marginTop: '4px', marginLeft: '25px', lineHeight: '28px',
                                                  textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                                onClick={() => this.addPriceForm()}>
                                                  <PlusOutlined />
                                                </div>
                                              ) : (
                                                <div style={{ minWidth: '30px',height: '30px',marginTop: '4px', marginLeft: '25px', lineHeight: '28px',
                                                  textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delPriceForm(item)}}>
                                                  <MinusCircleOutlined className="dynamic-delete-button" />
                                                </div>
                                              )
                                          }
                                        </Col>
                                      );
                                    })
                                  }
                                </FormEx2>
                              </Row>
                            </Col>
                            )
                            :
                            <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                          }
                        />
                      </Col>
                    );
                  default:
                }
              })()}
            </Row>
            </React.Fragment>
              : <React.Fragment>
                <Row>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="供应商简称"
                      dataIndex={`[${formListKey}].secondName`}
                      decorator={ <span>{_.get(updateForm, `[${formListKey}].secondName`, '')}</span>}
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="服务区域" required
                      dataIndex={`[${formListKey}].serviceArea`}
                      rules={[{ required: true, message: ' ' },]}
                      decorator={ checkEdit ?
                        <Select allowClear placeholder="请选择" >
                          <Option value='国内'>国内</Option>
                          <Option value='海外'>海外</Option>
                          <Option value='全球'>全球</Option>
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].serviceArea`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} required dataIndex={`[${formListKey}].item2`}
                      label={
                        <Popover content={item2Content} trigger="hover">
                          <span>二级计费项 <QuestionCircleOutlined /></span>
                        </Popover>
                      }
                      rules={[{ required: true, message: ' ' }, { type: 'array', len: 1, message: '请选择单个' }]}
                      decorator={ checkEdit ?
                        <Select mode='tags' optionFilterProp='children' allowClear
                          placeholder="请下拉选择或自定义"
                        >
                          { autoList.map(item =>
                            <Option value={item} key={item} >
                              {item}
                            </Option>)
                          }
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].item2`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} dataIndex={`[${formListKey}].item3`} required
                      label={
                        <Popover content={item3Content} trigger="hover">
                          <span>三级计费项 <QuestionCircleOutlined /></span>
                        </Popover>
                      }
                      rules={[{ required: true, message: ' ' }]}
                      decorator={ checkEdit ? <Input maxLength={maxLength} placeholder="请输入服务内容细分" />
                        :
                        <span>{_.get(updateForm, `[${formListKey}].item3`, '')}</span>
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col {...col6}>
                    <Item {...formItemLayout} required dataIndex={`[${formListKey}].item4`}
                      label={"四级计费项"}
                      rules={[{ required: true, message: ' ' }]}
                      decorator={ checkEdit ?
                        <Select allowClear placeholder="请选择" >
                          <Option value={'带宽类'} key={'带宽类'}>{'带宽类'}</Option>
                          <Option value={'流量类'} key={'流量类'}>{'流量类'}</Option>
                          <Option value={'其他'} key={'其他'}>{'其他'}</Option>
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].item4`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="数量单位" required
                      dataIndex={`[${formListKey}].unit`}
                      rules={[{ required: true, message: ' ' },{ type: 'array', len: 1, message: '请选择单个' }]}
                      decorator={checkEdit ?
                        <Select mode='tags' optionFilterProp='children' allowClear
                          placeholder="请下拉选择或输入" >
                          {
                            autoList.indexOf(itemFlag) !== -1 ?
                              autoComplete[itemFlag] && autoComplete[itemFlag].unit && autoComplete[itemFlag].unit.map(item =>
                                <Option value={item} key={item} > {item} </Option>)
                              :
                              otherObj&&otherObj.unit&&otherObj.unit.map(item => <Option value={item} key={item}> {item} </Option>)
                          }
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].unit`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="币种" required
                      dataIndex={`[${formListKey}].currency`}
                      rules={[{ required: true, message: ' ' },]}
                      decorator={ checkEdit ?
                        <Select allowClear placeholder="请选择" >
                          { autoList.indexOf(itemFlag) !== -1 ?
                            autoComplete[itemFlag] && autoComplete[itemFlag].currency && autoComplete[itemFlag].currency.map(item =>
                              <Option value={item} key={item} > {item} </Option>)
                            :
                            otherObj && otherObj.currency && otherObj.currency.map(item => <Option value={item} key={item} > {item} </Option>)
                          }
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].currency`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="用量计费模式" required
                      dataIndex={`[${formListKey}].usageUnit`}
                      rules={[{ required: true, message: ' ' },{ type: 'array',len: 1,message: '请选择单个'}]}
                      decorator={ checkEdit ?
                        <Select allowClear mode='tags' optionFilterProp='children' placeholder="请下拉选择或自定义">
                          {
                            autoList.indexOf(itemFlag) !== -1?
                              autoComplete[itemFlag] && autoComplete[itemFlag].usageUnit&&autoComplete[itemFlag].usageUnit.map(item =>
                                <Option value={item} key={item}> {item} </Option>)
                              :
                              otherObj&&otherObj.usageUnit&&otherObj.usageUnit.map(item => <Option value={item} key={item} > {item} </Option>)
                          }
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].usageUnit`, '')}</span>
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col {...col6}>
                    <Item {...formItemLayout} required
                      label={
                        <Popover content={modelContent} trigger="hover">
                          <span>价格计费模式 <QuestionCircleOutlined /></span>
                        </Popover>
                      }
                      dataIndex={`[${formListKey}].model`}
                      rules={[{ required: true, message: ' ' },]}
                      decorator={ checkEdit ?
                        <Select allowClear placeholder="请选择" >
                          { autoList.indexOf(itemFlag) !== -1?
                            autoComplete[itemFlag] && autoComplete[itemFlag].model&&autoComplete[itemFlag].model.map(item =>
                              <Option value={item} key={item} > {item} </Option>)
                            :
                            otherObj&&otherObj.model&&otherObj.model.map(item => <Option value={item} key={item} > {item} </Option>)
                          }
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].model`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="价格单位" required
                      dataIndex={`[${formListKey}].priceUnit`}
                      rules={[{ required: true, message: ' ' },]}
                      decorator={ checkEdit ?
                        <Select allowClear placeholder="请选择" mode='tags' optionFilterProp='children'
                          onFocus={() => this.getPriceUnit(formListKey)}>
                          { autoList.indexOf(itemFlag) !== -1 ?
                            autoComplete[itemFlag] &&autoComplete[itemFlag].priceUnits&&autoComplete[itemFlag].priceUnits.map(item =>
                              <Option value={item} key={item} >
                                {item}
                              </Option>)
                            :
                            otherObj && otherObj.priceUnits && otherObj.priceUnits.map(item => <Option value={item} key={item} > {item} </Option>)
                          }
                        </Select>
                        :
                        <span>{_.get(updateForm, `[${formListKey}].priceUnit`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="税率(%)" required
                      dataIndex={`[${formListKey}].tax`}
                      rules={[{ required: true, message: ' ' },]}
                      decorator={
                        checkEdit ?
                          <InputNumber style={{width: '100%'}} placeholder="请输入"/>
                          :
                          <span>{_.get(updateForm, `[${formListKey}].tax`, '')}%</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="报价有效期限" required
                      useMoment
                      dataIndex={`[${formListKey}].validityPeriod`}
                      defaultValue={moment(new Date())}
                      rules={[{ required: true, message: ' ' },]}
                      decorator={checkEdit ?
                        <DatePicker placeholder="请选择日期" format={"YYYY-MM-DD"}/>
                        :
                        <span>{moment(_.get(updateForm, `[${formListKey}].validityPeriod`, '')).format("YYYY-MM-DD")}</span>
                      }
                    />
                  </Col>
                </Row>
                <Row style={{height: 'auto'}}>
                  { (() => {
                    switch (updateForm[formListKey].model){
                      case '固定单价' :
                      case '固定单价(按年)':
                        return (
                          <Col {...col6} key={1}>
                            <Item {...formItemLayout} label="含税价格" required
                              dataIndex={`[${formListKey}].price`}
                              rules={[{ required: true, message: ' ' },]}
                              decorator={ checkEdit ?
                                <InputNumber min={0} style={{width: '100%'}} placeholder="请输入" />
                                :
                                <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                              }
                            />
                          </Col>
                        )
                      case '阶梯单价' :
                      case '阶梯累计单价':
                        return (
                          <Col  span={13} key={2}>
                            <Item label="价格区间" {...formItemLayout4}

                              // dataIndex={`[${formListKey}].price`}
                              // onChange={() => this.getPrice(`[${formListKey}].price`)}
                              // rules={[{ required: true, message: ' ' },]}

                              decorator={ checkEdit ?
                                (
                                  <FormEx2 defaultValues={priceForm} layout="inline"
                                    ref={(f) => { this.form1 = f }}
                                    onChange={(values) => { this.onPriceFormChange(values,formListKey)}}>
                                    {
                                      Object.values(priceFormList).map((item,index) =>{
                                        return (
                                          <Col span={12} style={{height: '60px'}} key={index}>
                                            <Col span={5}>
                                              <Item {...formItemLayout3} label="数量" dataIndex={`[priceForm${item}].min`}
                                                rules={[{ required: true, message: ' ' },]} required
                                                decorator={
                                                  <InputNumber style={{width:'100%'}}/>
                                                }
                                              />
                                            </Col>
                                            <Col span={3}>
                                              <Item  dataIndex={`[priceForm${item}].maze1`}
                                                rules={[{ required: true, message: ' ' },]}
                                                decorator={
                                                  <Select >
                                                    <Option value="<">{'<'} </Option>
                                                    <Option value="<=">{'<='} </Option>
                                                  </Select>
                                                }
                                              />
                                            </Col>
                                            <div style={{cssFloat:'left',display:'inline-block',width:'10px',marginTop: '10px'}}>X</div>
                                            <Col span={3}>
                                              <Item dataIndex={`[priceForm${item}].maze2`}
                                                rules={[{ required: true, message: ' ' },]}
                                                decorator={
                                                  <Select>
                                                    <Option value="<">{'<'} </Option>
                                                    <Option value="<=">{'<='} </Option>
                                                  </Select>
                                                }
                                              />
                                            </Col>
                                            <Col span={3}>
                                              <Item dataIndex={`[priceForm${item}].max`} required
                                                // trigger='onChange'
                                                rules={[{ required: true, message: ' ' },{validator: this.validFunction}]}
                                                // onChange={() => {this.checkMax()}}
                                                decorator={
                                                  <Input onBlur={() => {this.checkMax()}}/>
                                                }
                                              />
                                            </Col>
                                            <Col span={5}>
                                              <Item label="价格" dataIndex={`[priceForm${item}].cost`} {...formItemLayout}
                                                rules={[{ required: true, message: ' ' },]} required
                                                decorator={
                                                  <InputNumber />
                                                }
                                              />
                                            </Col>
                                            {
                                              index < 1 ?
                                                (
                                                  <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                                    textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                                  onClick={() => this.addPriceForm()}>
                                                    <PlusOutlined />
                                                  </div>
                                                ) : (
                                                  <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                                    textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delPriceForm(item)}}>
                                                    <MinusCircleOutlined className="dynamic-delete-button" />
                                                  </div>
                                                )
                                            }
                                          </Col>
                                        );
                                      })
                                    }
                                  </FormEx2>
                                )
                                :
                                <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                              }
                            />
                          </Col>
                        );
                      case '固定+阶梯单价' :
                        return (
                          <Col span={13}  key={3}>
                            <Item {...formItemLayout4} label="价格区间"
                            // required
                            // dataIndex={`[${formListKey}].price`}
                            // rules={[{ required: true, message: ' ' },]}
                              decorator={ checkEdit ?
                                (<Col {...col24} style={{height: 'auto'}}>
                                  <Row style={{height: 'auto'}} key={3}>
                                    <FormEx2 defaultValues={fixForm} layout="inline"
                                      ref={(f) => { this.form2 = f}}
                                      onChange={(values) => { this.onFixFormChange(values,formListKey)}}>
                                      {
                                        Object.values(fixFormList).map((item,index) => {
                                          return (
                                            <Col span={20} style={{height: '60px'}} key={index}>
                                              <Col span={8}>
                                                <Item {...formItemLayout3} label="X=" dataIndex={`[fixForm${item}].xprice`}
                                                  rules={[{ required: true, message: ' ' },]} required
                                                  decorator={
                                                    <InputNumber/>
                                                  }
                                                />
                                              </Col>
                                              <Col span={8}>
                                                <Item {...formItemLayout3} label="总价=" dataIndex={`[fixForm${item}].totalprice`}
                                                  rules={[{ required: true, message: ' ' },]} required
                                                  decorator={
                                                    <InputNumber />
                                                  }
                                                />
                                              </Col>
                                              {
                                                index < 1 ?
                                                  (
                                                    <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                                      textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                                    onClick={() => this.addFixForm()}>
                                                      <PlusOutlined />
                                                    </div>
                                                  ) : (
                                                    <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                                      textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delFixForm(item)}}>
                                                      <MinusCircleOutlined className="dynamic-delete-button" />
                                                    </div>
                                                  )
                                              }
                                            </Col>
                                          );
                                        })
                                      }
                                    </FormEx2>
                                  </Row>
                                  <Row style={{height: 'auto'}} key={4}>
                                    <FormEx2 defaultValues={priceForm} layout="inline"
                                      ref={(f) => { this.form1 = f }}
                                      onChange={(values) => { this.onPriceFormChange(values,formListKey)}}>
                                      {
                                        Object.values(priceFormList).map((item,index) =>{
                                          return (
                                            <Col span={24} style={{height: '60px'}} key={index}>
                                              <Col span={5}>
                                                <Item {...formItemLayout3} label="数量" dataIndex={`priceForm${item}.min`}
                                                  rules={[{ required: true, message: ' ' },]} required
                                                  decorator={
                                                    <InputNumber style={{width:'100%'}}/>
                                                  }
                                                />
                                              </Col>
                                              <Col span={3}>
                                                <Item  dataIndex={`priceForm${item}.maze1`}
                                                  rules={[{ required: true, message: ' ' },]}
                                                  decorator={
                                                    // style={{width: '100px'}}
                                                    <Select >
                                                      <Option value="<">{'<'} </Option>
                                                      <Option value="<=">{'<='} </Option>
                                                    </Select>
                                                  }
                                                />
                                              </Col>
                                              <div style={{cssFloat:'left',display:'inline-block',width:'10px',marginTop: '10px'}}>X</div>
                                              <Col span={3}>
                                                <Item dataIndex={`priceForm${item}.maze2`}
                                                  rules={[{ required: true, message: ' ' },]}
                                                  decorator={
                                                    <Select>
                                                      <Option value="<">{'<'} </Option>
                                                      <Option value="<=">{'<='} </Option>
                                                    </Select>
                                                  }
                                                />
                                              </Col>
                                              <Col span={3}>
                                                <Item dataIndex={`priceForm${item}.max`}
                                                  rules={[{ required: true, message: ' ' },{validator: this.validFunction}]}
                                                  // onChange={(values,key,value) => {this.checkMax(values,key,value)}}
                                                  decorator={
                                                    <Input onBlur={() => {this.checkMax()}}/>
                                                  }
                                                />
                                              </Col>
                                              <Col span={5}>
                                                <Item label="价格" dataIndex={`priceForm${item}.cost`} {...formItemLayout}
                                                  rules={[{ required: true, message: ' ' },]} required
                                                  decorator={
                                                    <InputNumber />
                                                  }
                                                />
                                              </Col>
                                              {
                                                index < 1 ?
                                                  (
                                                    <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                                      textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                                    onClick={() => this.addPriceForm()}>
                                                      <PlusOutlined />
                                                    </div>
                                                  ) : (
                                                    <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                                      textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delPriceForm(item)}}>
                                                      <MinusCircleOutlined className="dynamic-delete-button" />
                                                    </div>
                                                  )
                                              }
                                            </Col>
                                          );
                                        })
                                      }
                                    </FormEx2>
                                  </Row>
                                </Col>
                                )
                                :
                                <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                              }
                            />
                          </Col>
                        );
                      default:
                    }
                  })()}
                </Row>
                <Row>
                  <Col {...col6}>
                    <Item
                      {...formItemLayout}
                      label="保底情况"
                      dataIndex={`[${formListKey}].bottom`}
                      decorator={
                        checkEdit ?
                          <Input maxLength={maxLength} placeholder="请输入" />
                          :
                          <span>{_.get(updateForm, `[${formListKey}].bottom`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item {...formItemLayout} label="备注"
                      dataIndex={`[${formListKey}].remark`}
                      decorator={ checkEdit ?
                        <Input maxLength={maxLength} placeholder="请输入" />
                        :
                        <span>{_.get(updateForm, `[${formListKey}].remark`, '')}</span>
                      }
                    />
                  </Col>
                  <Col {...col6}>
                    <Item
                      {...formItemLayout}
                    />
                  </Col>
                  <Col {...col6}>
                    <Item
                      {...formItemLayout}
                    />
                  </Col>
                </Row>
              </React.Fragment>}
          </FormEx2>
        </Spin>
      </div >
    );
  }
}


const mapStateToProps = (state) => {
  return {
    updateForm: state.quoteResources.updateForm,
    auth: state.quoteResources.auth
  };
}

export default connect(mapStateToProps, dispatchs('app', 'quoteResources'), null, { forwardRef: true })(CDN);
