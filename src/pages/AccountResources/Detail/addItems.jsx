/**
 * @file  导入账单
 * @author olgaWu
 * 
 */

import React, { Component } from 'react';
import { Button, Input, Select, Cascader, DatePicker, InputNumber, Popover } from 'antd';
import { ModalEx, ControlledForm, FormEx2 } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import './Detail.scss';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

const FormItem = ControlledForm.Item;
const { TextArea } = Input;
const { Option, OptGroup } = Select;
const { MonthPicker, RangePicker } = DatePicker;
const { Item } = FormEx2

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class AddItemsComponent extends Component {
  constructor(props) {
    super(props)
    const { data = {} } = props;
    this.state = {
      loading: false,
      addItemData: data,
      itemId: "",
      data,
      formValidate: false,
      flag: true,
      items: [],
    }
  }
  componentDidMount() {
  }
    onClose = () => {
      this.props.modal.close();
    }
    onFormChange = (values, key, v) => {
      console.log(values);


    }
    onSubmit = (values) => {  //提交修改
      const { callback } = this.props;
      callback(values);
      console.log(values);
      this.onClose();
    }

    render() {
      const { addItemData, items, loading, fileList, data } = this.state;
      let textLabel = '';
      if (data.type == 'IDC') {
        textLabel = '二级计费项/三级计费项/四级计费项/机房全称';
      } else if (data.type == '海外资源') {
        textLabel = '二级计费项/三级计费项/四级计费项/机房全称/专线名称';
      } else {
        textLabel = '二级计费项/三级计费项/四级计费项';
      }
      return (
        <FormEx2
          onSubmit={(values) => {
            this.onSubmit(values);
          }}
          itemProps={formItemLayout}
          onChange={this.onFormChange}
          ref={(f) => { this.form = f }}
          className="m-account-r-eidt-remark"
        >
          <div className="search-item">
            <Item
              label={textLabel}
              className="u-search-item add-item-fix"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
              dataIndex='items'
              rules={[
                { required: true, message: '计费项不得为空' },
              ]}
              decorator={
                <Cascader options={addItemData.option} placeholder="请选择" />
              }>
            </Item>

          </div>
          <div id="m-remark-add">
            <div className="ant-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
              <Button onClick={this.onClose}>取消</Button>
              <Button type="primary" htmlType='submit' loading={loading}>确定</Button>
            </div>
          </div>
        </FormEx2>

      )
    }

}

export default function addItems(data = [], callback) {
  const title = `新增账单条目`;
  ModalEx.confirm({
    title,
    content: <AddItemsComponent data={data} callback={callback} />,
    width: 428,
    footer: null,
  });
}