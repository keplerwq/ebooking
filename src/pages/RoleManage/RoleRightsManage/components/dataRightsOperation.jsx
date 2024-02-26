import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {
  Table,
  Checkbox,
} from 'antd';
import _ from 'lodash';
import Empty from './empty';

export default function DataRightsOperation({callback, data, disabled}) {

  const [dataSource, setDataSource] = useState(data);
  
  useEffect(() => setDataSource(data), [data]);
  
  const onCallback = useCallback(() => {
    const returnData = _.cloneDeep(dataSource);
  
    returnData.forEach(el => {
      if (el.checked === false) {
        el.subset.forEach(subEl => subEl.checked = false);
      }
    })
  
    callback(returnData);
     
  }, [dataSource, callback])
  
  // 横向全选 checkbox Node
  const CheckboxRowGeneralControl = useCallback(({text, index}) => {
    return (
      <Checkbox
        disabled={disabled}
        onChange={(e) => {
          dataSource[index].checked = e.target.checked;
          setDataSource([...dataSource]);
          onCallback();
        }}
        checked={dataSource?.[index]?.checked}
      >
        {text}
      </Checkbox>
    )
  }, [dataSource, onCallback, disabled]);
  
  // 纵向全选 checkbox Node
  const CheckboxColGeneralControl = function ({title, dataIndex}) {
    const col = dataSource.map(({subset}) => subset.find(el => el.dataIndex === dataIndex));
  
    const checkedWithMemo = useMemo(() => col.every(el => el.checked), [col]);
  
    const [checked, setChecked] = useState(checkedWithMemo);
  
    useEffect(() => {
      setChecked(checkedWithMemo);
    }, [checkedWithMemo])
  
    const onChange = (e) => {
      col.forEach(el => el.checked = e.target.checked);
      setDataSource([...dataSource]);
      onCallback();
    };
  
    return <Checkbox onChange={onChange} checked={checked} disabled={disabled}>
      {title}
    </Checkbox>
  };
  
  // checkbox Node in table；表单中的 checkbox Node
  const CheckboxItemNode = useCallback(({dataIndex, rowItem}) => {
    const item = rowItem?.subset?.find(el => el.dataIndex === dataIndex);
  
    if (!item) return '-';
  
    return (
      <Checkbox
        disabled={!rowItem.checked || disabled}
        onChange={(e) => {
          item.checked = e.target.checked;
          setDataSource([...dataSource]);
          onCallback();
        }}
        checked={item.checked && rowItem.checked}
      />
    )
  }, [dataSource, onCallback, disabled]);
  
  const columns = useMemo(() => {
    if (!dataSource?.length) return null;
    // 列头
    const columns = [];
    // 列元素
    const colSets = {};
  
    dataSource.forEach(el => {
      if (!columns.length) {
        const firstOneCountFromLeft = {
          title: '数据名称',
          width: 40,
          dataIndex: 'label',
          fixed: 'left',
          render: (text, item, index) => <CheckboxRowGeneralControl text={text} index={index} />,
        }
        columns.push(firstOneCountFromLeft);
      }
    
      const {subset} = el;
    
      subset?.forEach?.(subEl => {
  
        /* 已经生成过 col 的，不再生成 */
        if (colSets[subEl.dataIndex])
          return colSets[subEl.dataIndex].push(subEl);
  
        colSets[subEl.dataIndex] = [subEl];
    
        const col = {
          dataIndex: subEl.dataIndex,
          title: () => <CheckboxColGeneralControl dataIndex={subEl.dataIndex} title={subEl.title} />,
          render: (noop, item) => <CheckboxItemNode dataIndex={subEl.dataIndex} rowItem={item} />,
          width: 60
        }
    
        columns.push(col);
      })
    })
  
    return columns;
  }, [dataSource]);
  
  return (
    <Table
      locale={{ emptyText: <Empty/> }}
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: 600, y: 400 }}
      size="middle"
      bordered
      pagination={false} />
  )
}
  
  