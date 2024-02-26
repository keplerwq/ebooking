
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Button, Input, Select,  Row, Col, Cascader, Upload } from 'antd';
import { FormEx2, Address, message, } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../Info.scss';
import downloadIcon from 'src/resource/img/info/download.png';
import api from 'src/api';
import uploadIcon from 'src/resource/img/upload-icon.png';

const { Item } = FormEx2;
const { TextArea } = Input;
const { Option } = Select;
const maxLength = 50;
const textareaSize = {
  minRows: 2,
  maxRows: 4
};

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      categoryList: [],
      showText:false,
    }
  }

  componentDidMount() {
    this.getCategoryList();
  }

  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  getCategoryList = () => {
    api.queryCategoryList().then((res) => {
      if (res.code === 0) {
        let list = res.msg;
        this.setState({ categoryList: list })
      }
    });
  }

  onFormChange = (values) => {

    const { freshForm } = this.props.actions;
    freshForm(values);
  }


  onEdit = () => {
    this.setState({
      isEditing: true
    });
    const { setEditStatus } = this.props.actions;
    setEditStatus('company', true);
    setEditStatus('qualification', true);
  }

  addItem = () => {
    let { keys, uuid, } = this.props;
    const { saveKeys } = this.props.actions;
    console.log(keys, uuid)
    const nextKeys = keys.concat(uuid);
    uuid++;
    saveKeys(nextKeys, uuid);
  }

  removeItem = (k, index) => {

    const { keys, uuid } = this.props;
    const { saveKeys } = this.props.actions;
    if (keys.length === 1) {
      return;
    }
    saveKeys(keys.filter(key => key !== k), uuid, () => {

    });

    let mainBrand = _.cloneDeep(this.form.getValue('company.mainBrand'));
    mainBrand.splice(index, 1);
    this.form.setValue('company.mainBrand', mainBrand);
    console.log(mainBrand)
  }

  addCategory = () => {
    let { categoryKeys, categoryUuid } = this.props;
    const { saveCategoryKeys } = this.props.actions;
    const nextKeys = categoryKeys.concat(categoryUuid);
    categoryUuid++;
    saveCategoryKeys(nextKeys, categoryUuid);
  }

  removeCategory = (k, index) => {

    const { categoryKeys, categoryUuid } = this.props;
    const { saveCategoryKeys } = this.props.actions;
    if (categoryKeys.length === 1) {
      return;
    }
    saveCategoryKeys(categoryKeys.filter(key => key !== k), categoryUuid);

    let category = _.cloneDeep(this.form.getValue('company.category'));
    category.splice(index, 1);
    this.form.setValue('company.category', category);
  }

  onUploadChange = (name, info) => {
    console.log(info)
    const { saveFile } = this.props.actions;

    let fileList = info.fileList;
    fileList = fileList.slice(-1);

    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.errorCode === 0;
      }
      return true;
    });

    saveFile(name, fileList);

    if (info.file.status === 'done') {
      const url = fileList[0].response.data;
      this.form.setValue(name, url);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, '');
    }
  }

  areaFilter = (obj) => {
    if (obj && obj !== 'null') return obj;
    return '';
  }

  validFunction = (rule, value, callback) => {
    if (this.form && value) {
      const catForm = this.form.getValue('company.category').filter(cat => { return cat && cat });
      let category = Array.from(new Set(_.cloneDeep(catForm.map(cat => { return cat.join('/') }))));
      if (category.length != catForm.length) {
        callback('不能选择重复的主营品类');
      }
      callback();
    }
    else if(!value) {
      callback('请选择主营品类');
    }
  }

  render() {
    const colLeft = {
      span: 11,
    }
    const colRight = {
      span: 11,
      offset: 1,
    }
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
        xl: { span: 8 },
        xxl: { span: 5 },
      },
      wrapperCol: {
        sm: { span: 16 },
        xl: { span: 16 },
        xxl: { span: 19 },
      },
    };

 
    const { updateForm={}, file, keys, uploadProps, categoryKeys, isEditing=false } = this.props;
    const { categoryList } = this.state;
    const { status } = updateForm;
    const canEdit = status !== 0;
    const province = this.areaFilter(_.get(updateForm, 'company.areaArray[0]', ''));
    const city = this.areaFilter(_.get(updateForm, 'company.areaArray[1]', ''));
    const county = this.areaFilter(_.get(updateForm, 'company.areaArray[2]', ''));
    const companyAddress = _.get(updateForm, 'company.companyAddress', '');
    const country = _.get(updateForm, 'company.area.country', '');
    const addressFullName = country === 'china' ? `${province}${city}${county}${companyAddress}` : `${companyAddress}`;
    const accountType =_.get(updateForm, 'accountType', '')
    const accountAllType = accountType===0 ? "通用类":(accountType===1?"资源类":"服务器相关类")
    const companyTypeMap = [ '其他', '原厂商', '代理商'];
    const componyType = _.get(updateForm, 'company.companyType', '')
    const componyAllType = componyType ===0?"其他":(componyType===1?"原厂商":"代理商")
    return (
      <FormEx2
        defaultValues={updateForm}
        onChange={(values) => { this.onFormChange(values) }}
        ref={(f) => { this.form = f }}
        layout="inline"
      >

        <OpHeader name="公司信息" isEditing={isEditing} onEdit={this.onEdit} canEdit={canEdit} />

        <section className={`g-wrapper ${!isEditing ? 's-edit' : ''}`}>
          <Row className="u-ct" >
            <Col {...colLeft} >
              <Item
                {...formItemLayout}
                required
                label="企业名称"
                dataIndex="company.companyName"
                decorator={
                  <span>{_.get(updateForm, 'company.companyName', '')}</span>
                }
              />
              <Item
                // className={statusNum===0? 'hide' : '' }
                {...formItemLayout}

                required
                label="公司注册地址"
                dataIndex="company.companyAddress"
                decorator={
                  <span>{_.get(updateForm, 'company.companyAddress', '')}</span>
                }
              />
              <Item
                // className={statusNum===0? 'hide' : '' }
                {...formItemLayout}
                required
                label="法定代表人"
                dataIndex="qualification.legalRepresentative"
                decorator={
                  <span>{_.get(updateForm, 'qualification.legalRepresentative', '')}</span>
                }
              />

              <Item
                {...formItemLayout}
                label="发货地"
                required
                dataIndex="company.originPlace"
                rules={[{ required: true, message: '请填写主营商品发货地' },]}
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请填写主营商品发货地" /> : <span>{_.get(updateForm, 'company.originPlace', '')}</span>
                }
              />

              {isEditing ?
                <Item
                  {...formItemLayout}
                  label="主营品牌"
                  required
                >
                  {
                    keys.map((k, index) => {
                      return (
                        <div key={k.toString() + index.toString()}>
                          <Row>
                            <Col span={8}>
                              <Item
                                dataIndex={`company.mainBrand[${index}][brand]`}
                                rules={[{ required: true, message: '请输入品牌名称' },]}
                                decorator={
                                  <Input maxLength={maxLength} placeholder="主营品牌" />
                                }
                              />
                            </Col>
                            <Col span={8} offset={1}>
                              <Item
                                dataIndex={`company.mainBrand[${index}][level]`}
                                rules={[{ required: true, message: '请输入代理等级' },]}
                                decorator={
                                  <Input maxLength={maxLength} placeholder="品牌代理等级" />
                                }
                              />
                            </Col>
                            <Col span={4} offset={1}>
                              <div className="u-operate-icon">
                                {
                                  index === 0 ? <a type="plus-circle" onClick={this.addItem} style={{ color: '#4680fe' }}>添加</a> : <a type="minus-circle" onClick={() => this.removeItem(k, index)}>删除</a>
                                }
                              </div>
                            </Col>
                          </Row>
                        </div>
                      );
                    })
                  }
                </Item> :
                <Item
                  {...formItemLayout}
                  label="主营品牌"
                  required
                >
                  <span>{_.get(updateForm, 'company.mainBrand', []).map((b, index) => <span key={index}> {`${b.brand}(${b.level}级)`} </span>)}</span>
                </Item>
              }


              <Item
                {...formItemLayout}
                label="户名"
                dataIndex="qualification.accountName"
                required
                rules={[{ required: true, message: '请填写公司户名' },]}
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请填写公司户" /> : <span>{_.get(updateForm, 'qualification.accountName', '')}</span>
                }
              />
              
              <Item
                {...formItemLayout}
                label="开户行"
                dataIndex="company.bank"
                required
                rules={[{ required: true, message: '请填写公司开户行' },]}
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请填写公司开户行" /> : <span>{_.get(updateForm, 'company.bank', '')}</span>
                }
              />

              
              <Item
                {...formItemLayout}
                label="账号"
                dataIndex="company.bankAccountId"
                required
                rules={[{ required: true, message: '请填写公司账号' },]}
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请填写公司账号" /> : <span>{_.get(updateForm, 'company.bankAccountId', '')}</span>
                }
              />

            </Col>
            <Col {...colRight}>
              <Item
                {...formItemLayout}
                label="业务范围"
                dataIndex="company.accountType"
                decorator={
                  <span>{ accountAllType }</span>}
              />
              <Item
                {...formItemLayout}
                label="供应级别"
                required
                rules={[{ required: true, message: '请选择供应级别' }]}
                dataIndex="company.companyType"
                decorator={
                  isEditing ? <Select placeholder="请选择供应级别" >
                    {companyTypeMap.map((value, index) => <Option key={index} value={index}>{value}</Option>)}
                  </Select>  :
                    <span>{componyAllType}</span>
                }
              />
              {
                !isEditing ?

                  <Item
                    {...formItemLayout}
                    label="联系地址"
                    required
                    decorator={
                      <span>{addressFullName}</span>
                    }
                  /> : 
                  <Col>
                    {
                      country === 'china' && <Item
                        {...formItemLayout}
                        label="联系地址"
                        required
                        dataIndex="company.areaArray"
                        rules={[{ required: true, message: '请选择省市区' },]}
                        decorator={
                          isEditing ? <Cascader options={Address} placeholder="省市区"/> : null
                        }
                      />
                    }
                    <Item
                      {...formItemLayout}
                      required
                      label="详细地址"
                      dataIndex="company.companyAddress"
                      rules={[{ required: true, message: '请填写详细地址' },]}
                      decorator={
                        <TextArea maxLength={maxLength} autoSize={textareaSize} placeholder="请填写详细地址，例如所在某某小区某某楼层等" />
                      }
                    />
                  </Col>
              }

              {isEditing ?
                <Item
                  {...formItemLayout}
                  label="主营品类"
                  required
                >
                  {
                    categoryKeys && categoryKeys.map((k, index) => {
                      return (
                        <div key={k.toString() + index.toString()}>
                          <Row>
                            <Col span={20}>
                              <Item
                                {...formItemLayout}
                                dataIndex={`company.category[${index}]`}
                                rules={[{ required: true, message: '请选择主营品类' }, { validator: this.validFunction }]}
                                decorator={
                                  <Cascader options={categoryList} placeholder="请选择主营品类" changeOnSelect />
                                }
                              />
                            </Col>
                            <Col span={3} offset={1}>
                              <div className="u-operate-icon">
                                {
                                  index === 0 ? <a onClick={this.addCategory} style={{ color: '#4680fe' }}>添加</a> : <a onClick={() => this.removeCategory(k, index)}>删除</a>
                                }
                              </div>
                            </Col>
                          </Row>
                        </div>)
                    })
                  }
                </Item>
                :
                <Item
                  {...formItemLayout}
                  label="主营品类"
                  required
                >
                  <span>{_.get(updateForm, 'company.category', []).map(cat => cat.join('/')).join(',')}</span>
                </Item>
              }
              <Item
                {...formItemLayout}
                label="合作意向"
                dataIndex="company.cooperationIntention"
                decorator={
                  isEditing ?
                    <TextArea maxLength={maxLength} autoSize={textareaSize} placeholder="请输入贵公司的合作意向，例如经营的品牌、品类合作目的等。" />
                    : <span>{_.get(updateForm, 'company.cooperationIntention', '')}</span>
                }
              />
              <Item
                {...formItemLayout}
                label="公司网址"
                dataIndex="company.net"
                decorator={
                  isEditing ?
                    <Input maxLength={maxLength} placeholder="请填写公司官网地址或电商旗舰店地址" /> : <span>{_.get(updateForm, 'company.net', '')}</span>
                }
              />
              <Item
                {...formItemLayout}
                label="主营类目文件"
                dataIndex="file"
              >
                {
                  isEditing ?
                    <div className="m-upload-wrapper">
                      <Upload {...uploadProps} fileList={file} onChange={(...args) => { this.onUploadChange('file', ...args) }}>
                        <Button className="u-uploader">
                          {/* <Icon type="cloud-upload" style={{ fontSize: '32px' }} /> */}
                          <img src={uploadIcon} alt=""/>
                        </Button>
                      </Upload>
                      <div className="u-upload-desc" style={{ top: 17 }}>
                        <p>上传主营商品类目文件Excle/PDF/word均可(选填)</p>
                      </div>
                    </div>
                    :
                    <span>
                      {_.get(updateForm, 'company.file', '') ?
                        <a href={_.get(updateForm, 'company.file', '')} target="_blank" download="主营类目">  <img src={downloadIcon} alt='' />下载附件 </a> : <span>未上传</span>
                      }
                    </span>
                }
              </Item>
            </Col>
          </Row>
        </section>
      </FormEx2>
    )
  }
}

// 公司信息详情
const mapStateToProps = (state) => {
  return {
    updateForm: state.info.updateForm,
    file: state.info.file,
    keys: state.info.keys,
    uuid: state.info.uuid,
    status:state.info.status,
    defaultCategory: state.app.defaultCategory,
    uploadProps: state.app.uploadProps,
    categoryKeys: state.info.categoryKeys,
    categoryUuid: state.info.categoryUuid,
  };
}

export default connect(mapStateToProps, dispatchs('app', 'info'), null, { forwardRef: true })(Company);
