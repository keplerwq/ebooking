/**
 * 基于antd Form 表单组件，目前暂不使用
 */

import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Checkbox, Input, Switch } from 'antd';
import { InputEx } from 'src/components';
import _ from 'lodash';
import Schema from 'async-validator';
import { handleTrim } from "src/libs/util";
import moment from 'moment'

// antd 4 中已经不再支持给旧版 Form 设置 labelCol 、wrapperCol 的 Grid 样式名了
// GridFactory 方法是用来计算 antd 3x 兼容版 Form 组件的 Grid 样式名的
// 新增功能因避免再使用 antd 3 中的方法
// TODO: 后续需要将该组件升级为 antd 4.x 版本
class GridFactory {
  constructor(rules) {
    this.prefix = 'ant-col-';
    this.rules = rules;
    this.rulesKeys = Object.keys(rules);
    this.result = '';
  }

  isSizeTag(key) {
    return key.match(/^(xs|sm|md|lg|xl|xxl)$/) ? RegExp.$1 : '';
  }

  isGridTag(key) {
    return key.match(/^(offset|order|pull|push|span)$/) ? RegExp.$1 : '';
  }

  handleSizeTag(sizeTag) {
    let tagItem = this.rules[sizeTag];

    if (typeof tagItem === 'number')
      tagItem = {span: this.rules[sizeTag]};

    Object.keys(tagItem).forEach((key) => {
      if (!this.isGridTag(key)) return;

      if (key === 'span')
        this.result += `${this.prefix}${sizeTag}-${tagItem[key]} `;

      else
        this.result += `${this.prefix}${sizeTag}-${key}-${tagItem[key]} `;
    });
  }

  handleGridTag(gridTag) {
    let tagItem = this.rules[gridTag];

    if (gridTag === 'span')
      this.result += `${this.prefix}${tagItem} `;
    else
      this.result += `${this.prefix}${gridTag}-${tagItem} `;
  }

  calc() {

    this.rulesKeys.forEach((key, i) => {
      const sizeTag = this.isSizeTag(key);
      const gridTag = this.isGridTag(key);

      if (sizeTag)
        this.handleSizeTag(sizeTag);
      if (gridTag)
        this.handleGridTag(gridTag);
    })

    return this.result = this.result.trimEnd();
  }
}

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const TextAreaEx = InputEx.TextAreaEx;

function isInstanceOfClass(instance, classConstructor) {
  if (_.isPlainObject(instance) && _.isFunction(instance.type)) {
    return instance.type === classConstructor;
  }
  return false;
}


class FormEx2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: _.cloneDeep(props.defaultValues)
    };
  }

  static defaultProps = {
    defaultValues: {}, // 表单初始数据
  }

  componentWillReceiveProps(nextProps) {
    // const { defaultValues } = nextProps;
    // this.setState({ data: defaultValues});
  }

  /**
   * 校验基本函数 外部请勿调用
   * @param  {String}   options.key      [本次校验的key值，将显示该内容框的校验结果]
   * @param  {Function} options.callback [校验完成后的回调函数]
   * @param  {Boolean}  options.isSubmit [是否为submit校验，sumit校验：将在页面上显示所有校验结果]
   */
  validate = ({ key = '', callback = () => {}, isSubmit = false } = {}) => {
    let validateResult = [];
    let itemLength = _.values(this.formItems).filter(x => x !== null && x !== undefined).length;

    const isAllCheck = (result) => {
      validateResult.push(result);
      // console.log(validateResult);
      if (validateResult.length === itemLength) {
        // 触发外部事件
        callback && callback(validateResult.every(x => x.status === 'success'), validateResult)
      }
    };
    for (let item of _.values(this.formItems)) {
      item && item.checkValidate(item.props.dataIndex === key || isSubmit, isAllCheck);
    }
  }

  /**
   * 设置表单的数据
   * @param  {Object} values [表单完成数据结构]
   * @param  {Boolen} isValidate [是否进行校验]
   */
  setValues = (values = {}, isValidate = false) => {
    this.setState({ data: values }, () => {
      isValidate && this.validate({ isSubmit: true });
    });
  }

  /**
   * 设置单个表单数据值，数据变更也是调用该函数
   * @param  {[String]} key   [对应数值在数据中的key,支持多层结构]
   * @param  {[Any]}    value [对应数值在数据中的value]
   */
  setValue = (key, value) => {
    let data = _.cloneDeep(this.state.data);
    _.set(data, key, value);
    // 数据未变更的情况下,不触发事件
    if (_.isEqual(data, this.state.data)) {
      return;
    }
    this.setState({ data }, () => {
      // 数据校验
      this.validate({
        key,
        callback: (isSuccess, validateResult) => {
          this.props.onValidate && this.props.onValidate(isSuccess, validateResult);
        },
        isSubmit: false
      });
      // 触发外部事件
      if (this.props.onChange) {
        // 必须拷贝数据，否则无法刷新
        this.props.onChange(_.cloneDeep(data), key, value);
      }
    });
  }

  /**
   * 获取key值对应的值
   * @param  {[String]} key          [想要获取值的key]
   * @param  {[Any]} defaultValue    [默认值]
   * @return {[Any]}
   */
  getValue = (key = null, defaultValue) => {
    if (key === null) {
      return undefined;
    }
    return _.get(this.state.data, key, defaultValue);
  }

  /**
   * 获取表单完整数据
   * @return {[Object]}
   */
  getValues = () => {
    return this.state.data;
  }

  delValue = (key) => {
    let values = this.state.data;
    let ids = key.split('.');
    if (ids.length === 1) {
      delete values[ids[0]];
    } else {
      let id = ids.splice(0, ids.length - 1).join('.');
      values = _.get(values, id, {});
      delete values[ids[ids.length - 1]];
    }
    this.setState({ data: values });
  }

  /**
   * 校验某个key的值
   * @param  {[type]} key [description]
   */
  validateValue = (key, callback) => {
    this.validate({
      key: key,
      callback: (isSuccess, validateResult) => {
        callback && callback(isSuccess, validateResult);
      },
      isSubmit: false
    });
  }

  /**
   * 外部接口 表单外部主动调用提交
   * @param  {[Function]} successCallback [校验成功后的回调函数]
   */
  submit = (successCallback) => {
    this.validate({
      key: null,
      callback: (isSuccess, validateResult) => {
        if (isSuccess) {
          successCallback && successCallback(this.state.data);
          this.props.onSubmit && this.props.onSubmit(this.state.data);
        }
      },
      isSubmit: true
    });
  }

  /**
   * 表单内按钮提交方式，将触发props上的onSubmit事件
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  handleSubmit = (e) => {
    e.preventDefault();
    this.validate({
      key: null,
      callback: (isSuccess, validateResult) => {
        // console.log(isSuccess);
        isSuccess && this.props.onSubmit && this.props.onSubmit(this.state.data);
      },
      isSubmit: true
    });
  }

  deepClone = (elements) => {
    let newElements = [];
    React.Children.toArray(elements).forEach(ele => {
      if (!_.isObject(ele)) {
        newElements.push(ele);
      } else if (isInstanceOfClass(ele, FormEx2Item) && ele.props.dataIndex) {
        // 补丁：组件设计bug，DatePicker组件需要接收moment类型的，这个组件没用考虑到，因此再加入一个useMoment由用户手动赋值，进行格式转换
        const { useMoment, decorator = {} } = ele.props
        // 补丁：mode 为 tags 时需要传Array类型，初始化时如果为空就给value设置[]
        const { mode } = decorator.props || {}
        // 补丁：各种未知来源的不统一的 Date 数据(YYYY-MM-DD 字符串、moment 类型等)，导致组件报错。
        //下面逻辑做了容错，date 字符串 + useMoment 会进行一个转换。
        const valueSource = this.getValue(ele.props.dataIndex) ;
        const isDateString = typeof valueSource === 'string' && valueSource.match(/^\d{4}-\d+-\d+$/);
        const shouldConvertToMoment = !!(isDateString && useMoment);
        const value = shouldConvertToMoment ?
          moment(new Date(valueSource.replace(/-/g, '/')), "MM/DD/YY") :
          valueSource;
        // dataIndex 未定义时不进行绑定事件
        let addProps = {
          _parent: this, // 存在该值得FromItem才进行自动事件绑定
          data: this.state.data,
          // 当点击clearable的时候需要清空DatePicker数据，实际上可以设置为undefined和null，但是编写这个组件的开发没有考虑到，因此只能设置为null
          value: useMoment
            ? (Number.isNaN(value?._i) ? null : value)
            : (mode === 'tags'
              ? (Array.isArray(this.getValue(ele.props.dataIndex))
                ? this.getValue(ele.props.dataIndex)
                : this.getValue(ele.props.dataIndex) !== '' && this.getValue(ele.props.dataIndex) !== undefined && this.getValue(ele.props.dataIndex) !== null
                  ? [this.getValue(ele.props.dataIndex)]
                  : [])
              : this.getValue(ele.props.dataIndex)), // 数据中关联的值
          handleChange: this.setValue, // 数据变更调用该事件，在form中setState
          ref: item => this.formItems[ele.props.dataIndex] = item
        };
        let item = React.cloneElement(ele, addProps);
        newElements.push(item);
      } else {
        // fixed: br must with no children
        let children = ele.props.children ? this.deepClone(ele.props.children) : null;
        newElements.push(React.cloneElement(ele, null, children));
      }
    });
    return newElements;
  }

  render() {
    this.formItems = {};
    let children = this.deepClone(this.props.children);
    return (
      <Form
        onSubmit={this.handleSubmit}
      >
        {children}
      </Form>
    )
  }
}


class FormEx2Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props
    };
  }

  static defaultProps = {
    label: '',
    rules: [],
    trigger: 'onChange',
  }

  //数据校验及是否显示校验
  checkValidate = (isShowError = true, callback) => {
    let result = {
      dataIndex: this.props.dataIndex,
      status: 'success',
      message: ''
    };
    if (!this.validator) {
      this.rules = _.cloneDeep(this.props.rules);
      if (this.props.required === true) {
        this.rules.push({ required: 'true', message: '必填项' });
      }
      let descriptor = {
        [this.props.dataIndex]: this.rules
      };
      this.validator = new Schema(descriptor);
    }
    if (this.rules.length === 0) {
      callback && callback(result);
      return;
    }
    this.validator.validate({
      [this.props.dataIndex]: this.props.value
    }, (errors, fields) => {
      if (errors) {
        result = {
          dataIndex: this.props.dataIndex,
          status: 'error',
          message: errors[0].message,
          errors: errors
        };
      }
      if (isShowError) {
        this.setState({
          validateStatus: result.status,
          help: result.message
        });
      }
      callback && callback(result);
    });
  }

  onValueChange = (e) => {
    let value = e;
    if (e && e.target) {
      if ( e.target.type === "checkbox") {
        value = e.target.checked;
      } else if (e.target.value !== undefined) {
        if (this.props.isTrim) {
          value = handleTrim(e.target.value);
        } else {
          value = e.target.value;
        }
      } else {
        value = e.target.checked;
      }
    }
    // FormItem上存在onChange时，调用，并优先使用其返回值
    if (this.props.onChange) {
      // 触发当前接口时，this.state.data为上一次的数据，如需获取本次变更后的数据，需异步处理
      let res = this.props.onChange(this.state.data, this.props.dataIndex, value);
      if (res !== undefined) {
        console.info('reset value', res);
        value = res;
      }
    }
    // 调用表单事件
    this.props.handleChange(this.props.dataIndex, value);
  }

  renderControl = (element) => {
    if (!element) {
      return null;
    }
    let newElement = element;

    // 默认值设定
    if (this.props._parent && this.props.value === undefined && this.props.defaultValue !== undefined) {
      setTimeout(() => {
        this.onValueChange(this.props.defaultValue);
      });
    }
    let props = Object.assign({}, element.props, {
      value: this.props.value,
      [this.props.trigger]: this.onValueChange
    });

    // 非Form生成的Item直接忽略
    if (!this.props._parent) {
      newElement = element;
    }
    // 替换Input为InputEx
    else if (isInstanceOfClass(element, Input)) {
      newElement = React.createElement(InputEx, props);
    }
    // TextArea为TextAreaEx
    else if (isInstanceOfClass(element, TextArea)) {
      newElement = React.createElement(TextAreaEx, props);
    }
    // checked处理
    else if (isInstanceOfClass(element, Switch) || isInstanceOfClass(element, Checkbox)) {
      newElement = React.cloneElement(element, {
        checked: this.props.value,
        [this.props.trigger]: this.onValueChange
      });
    }
    // Input,Select等组件拷贝
    else {
      // console.log(element);
      newElement = React.cloneElement(element, props);
    }
    return newElement;
  }

  enhancedFormItemProps = () => {
    const props = {};
    Object.keys(this.state).forEach(key => {
      // React 17 禁止给 Dom 添加驼峰命名的 attribute，因为 w3c 规范，html 标签只识别小写.
      // 而这个组件设计的把所有 props 都传递给了最终渲染的真实 Dom，导致 warning.
      // 所以这里对透传给 Dom 的 props 做一个拦截.
      if (key.match(/handleChange|dataIndex|isTrim|_parent|useMoment|decorator/)) return;

      props[key] = this.state[key];
    })
    return props;
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this.vNode);

    if (this.props.labelCol) {
      const labelNode = this.node.getElementsByClassName('ant-legacy-form-item-label')[0];

      if (labelNode) {
        const grid = new GridFactory(this.props.labelCol);
        labelNode.classList.add(...grid.calc().split(' '));
      }
    }

    if (this.props.wrapperCol) {
      const wrapperNode = this.node.getElementsByClassName('ant-legacy-form-item-control-wrapper')[0];
      const grid = new GridFactory(this.props.wrapperCol);
      wrapperNode.classList.add(...grid.calc().split(' '));
    }
  }

  render() {
    let decorator = this.renderControl(this.props.decorator);

    return (
      <FormItem ref={ref => (this.vNode = ref)} {...this.enhancedFormItemProps()}>
        {decorator}
        {this.props.children}
      </FormItem>
    )
  }
}
FormEx2.Item = FormEx2Item;

export default FormEx2;
