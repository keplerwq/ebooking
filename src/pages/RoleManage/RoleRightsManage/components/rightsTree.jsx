import React, {useState, useCallback, useMemo, useEffect} from 'react';
import { Tree, Input } from 'antd';
import _ from 'lodash';

const { Search } = Input;

export default function RightsTree({data, onLeafClick, onLeafCheck, checkable = false, disabled = false, checkedKeys: outerCheckedKeys}) {

  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const dataList = useMemo(() => [], []);
  const leafList = useMemo(() => [], []);

  
  const onExpand = (expandedKeys) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };
  
  const onSelect = (selectedKeys, info) => {
    const {selectedNodes, selected} = info;
    const [selectedItem] = selectedNodes;
    if (typeof onLeafClick === 'function' && selectedItem?.isLeaf && selected) {
      // 不直接使用 antd 提供的 selectedNodes，因为它和原数据 unconnected
      const selectedNodes = leafList.filter(el => el.key === selectedKeys[0]);
      onLeafClick(selectedNodes);
    } else if (typeof onLeafClick === 'function') {
        
      onLeafClick([]);
    }
  
    setSelectedKeys(selectedKeys);
  };

  const onCheck = (checkedKeys, resetValues = true) => {
    if (typeof onLeafCheck === 'function') {
      // 不直接使用 antd 提供的 selectedNodes，因为它和原数据 unconnected
      const checkedKeysLikeSet = new Set(checkedKeys)
      const checkedNodes = leafList?.filter(el => checkedKeysLikeSet.has(el.key)) || [];
      onLeafCheck(checkedNodes, resetValues);
    }

    setCheckedKeys(checkedKeys);
  };

  useEffect(() => {
    let time;
    if (Array.isArray(outerCheckedKeys)) {
      const keys = [...outerCheckedKeys]
      time = setTimeout(() => {
        onCheck(keys, false)
      }, 300)
    }

    return () => clearTimeout(time)
    // eslint-disable-next-line
  }, [outerCheckedKeys]);

  const generateList = useCallback(
    data => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const { key, title } = node;
        dataList.push({ key, title });
        // 如果是叶子节点，存储起来，在 onLeafClick 时用来匹配返回 node
        if (node.isLeaf)
          leafList.push(node);
  
        if (node.children)
          generateList(node.children);
      }
    }, [dataList, leafList]
  );
    
  useEffect(() => generateList(data), [data, generateList]);
  
  const getParentKey = useCallback((key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }, []);
  
  const generateExpandedKeys = useCallback(function(value = '') {
    return dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, data);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
  }, [dataList, data, getParentKey])
    
  
  function onSearchChange(e) {
    const { value } = e.target;
  
    const expandedKeys = generateExpandedKeys(value);
  
    setExpandedKeys(expandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  }
    
  useEffect(() => {
    const expandedKeys = generateExpandedKeys();
    setExpandedKeys(expandedKeys);
  }, [generateExpandedKeys, data]);
  
  const loop = useCallback(
    data =>
      data.map(item => {
        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        const title =
            index > -1 ? (
              <span>
                {beforeStr}
                <span style={{color: '#f50'}}>{searchValue}</span>
                {afterStr}
              </span>
            ) : (
              <span>{item.title}</span>
            );
  
        if (item.children) {
          return { ...item, title, children: loop(item.children) };
        }
  
        return {
          ...item, 
          title,
        };
      }), [searchValue]
  );
  
  return (
    <>
      <Search onChange={onSearchChange} placeholder="请输入" style={{marginBottom: '20px'}} />
      <Tree
        checkable={checkable}
        disabled={disabled}
        height={400}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onSelect={onSelect}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        selectedKeys={selectedKeys}
        treeData={loop(data)} />
    </>
  )
}
  