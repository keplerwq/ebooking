import React, {useState, useMemo, useEffect, useLayoutEffect} from 'react';
import { 
  Card,
  Typography,
  Divider,
  Checkbox,
  Tabs,
} from 'antd';
import _ from 'lodash';
import RightsTree from './rightsTree';
import Empty from './empty';
import style from '../.module.scss';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function PageRightsOperation({data, onChange, disabled, leftChecked}) {
  const innerData = useMemo(() => data, [data]);
  const [activeTab, setActiveTab] = useState(null);
  const leafSets = useMemo(() => [], []);
  const leftCheckedKeys = useMemo(() => {
    const keys = {}
    Object.keys(leftChecked).forEach(k => {
      keys[k] = leftChecked[k].map(node => node.key)
    })
    return keys;
  }, [leftChecked]);
  const cachedLeftCheckItems = useMemo(() => ({}), []);

  const initOperations = useMemo(() => {
    const sets = {};
    innerData.forEach(el => sets[el.key] = []);
    return sets;
  }, [innerData])
  
  const [operations, setOperations] = useState(initOperations);

  useEffect(() => {
    setActiveTab(innerData?.[0]?.key);
  }, [innerData])
  
  function setOperationsHandler(leafs, resetValues = true) {
    const updateCheckedStatus = (el, checked) => {
      el.checked = checked
      el.operation.forEach(op => op.checked = checked)
    }

    const nodes = leafs.map(el => el.leafs).flat();

    const preVal = cachedLeftCheckItems[activeTab] || (cachedLeftCheckItems[activeTab] = [])

    if (resetValues) {
      const preValSet = new Set(preVal)
      const currValSet = new Set(nodes)

      const deletedLeafs = preVal.filter(el => !currValSet.has(el))
      const addedLeafs = nodes.filter(el => !preValSet.has(el))
      
      deletedLeafs.forEach(el => updateCheckedStatus(el, false));
      addedLeafs.forEach(el => updateCheckedStatus(el, true));
    }
  
    leafSets.push(...nodes);
  
    const newOperations = {...operations, [activeTab]: nodes || []};

    setOperations(newOperations);

    cachedLeftCheckItems[activeTab] = [...nodes]

    onChange(_.cloneDeep(innerData));
  }
  
  function onOperationChange() {
    const cachedLeafSets = _.cloneDeep(leafSets);

    leafSets.forEach((el) => {
      if (!el?.checked)
        el.operation.forEach(op => op.checked = false)
    });
  
    onChange(_.cloneDeep(innerData));
  
    cachedLeafSets.forEach((el, i) => {
      if (!el?.checked)
        leafSets[i].operation = el.operation;
    });
  }

  const pagesRefs = useMemo(() => ({}), []);

  function getPagesRefs (tabKey, value) {
    pagesRefs[tabKey] = value;
  }

  function scrollToPagePosition(selectedNodes) {
    const [ selectedNode ] = selectedNodes;

    if (!selectedNode) return;

    const { leafs } = selectedNode;

    const { value, children } = pagesRefs[activeTab];

    const node = children.find((el) => leafs.some(leaf => el?.getAttribute('data-key') === leaf.key));

    if (!node) return;
    
    const speed = 10;

    let oldScrollTop = [];

    let raf;

    function scroll() {
      const resetFn = () => {
        oldScrollTop = [];
        value.scrollTop = node?.offsetTop;
        window.cancelAnimationFrame(raf);
      }

      if ((oldScrollTop.length - [...new Set(oldScrollTop)].length) > 3) {
        return resetFn();
      }
      
      const count = 10;
      if ((node?.offsetTop - value?.scrollTop) > speed) {
        const isMultiple = (node?.offsetTop - value?.scrollTop) > (speed * (count + 1));
        value.scrollTop = value.scrollTop +  isMultiple ? (speed * count) : speed;
        oldScrollTop.push(value.scrollTop);
        raf = window.requestAnimationFrame(scroll);
      } else if ((value?.scrollTop - node?.offsetTop) > speed) {
        const isMultiple = (node?.scrollTop - value?.offsetTop) > (speed * (count + 1));
        value.scrollTop = value.scrollTop -  isMultiple ? (speed * count) : speed;
        oldScrollTop.push(value.scrollTop);
        raf = window.requestAnimationFrame(scroll);
      }

      resetFn();
    }

    raf = window.requestAnimationFrame(scroll);
  }

  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {
          innerData.map((el) => (
            <TabPane tab={el.title} key={el.key}>
              <Card>
                <Card.Grid hoverable={false} className={style.cardLeft}>
                  <RightsTree
                    data={el?.children}
                    onLeafClick={scrollToPagePosition}
                    checkedKeys={leftCheckedKeys[el.key]}
                    checkable
                    disabled={disabled}
                    onLeafCheck={setOperationsHandler} />
                </Card.Grid>
      
                <Card.Grid hoverable={false} className={style.cardRight}>
                  <PageRightsOperationBox
                    disabled={disabled}
                    getRefs={refs => getPagesRefs(el.key, refs)}
                    data={operations[activeTab]}
                    onChange={onOperationChange} />
                </Card.Grid>
              </Card>
            </TabPane>
          ))
        }
      </Tabs>
    </>
  )
}


function PageRightsOperationBox({data, onChange, disabled, getRefs}) {

  const itemRefs = useMemo(() => ([]), []);

  const [pagesData, updatePagesData] = useState(data);
  
  useEffect(() => {
    updatePagesData(data);
  }, [data])


  useEffect(() => {
    while (itemRefs.length) {
      itemRefs.pop()
    }
  }, [data, itemRefs]);

  useLayoutEffect(() => {
    if (typeof getRefs === 'function') {
      const children = [...new Set(itemRefs.filter(Boolean))];

      getRefs({
        value: children[0]?.parentNode,
        children
      });
    }
  }, [pagesData, itemRefs, getRefs]);
  
  function onPageChange(e, i, page) {
    page.checked = e.target.checked;
    updatePagesData([...pagesData]);
  
    onDataChange();
  }
  
  
  function onOperationItemChange(e, item) {
    item.checked = e.target.checked;
    updatePagesData([...pagesData]);
  
    onDataChange();
  }
  
  function onDataChange() {
    if (typeof onChange !== 'function') return;
  
    const newData = _.cloneDeep(pagesData);
  
    newData.forEach(({checked, operation}) => {
      if (!checked)
        operation.forEach(item => item.checked = false);
    })
  
    onChange(newData);
  }
  
  return (
    pagesData?.length ?
      pagesData?.map?.((page, i, arr) => {
        return (
          <div ref={el => itemRefs.push(el)} data-key={page.key} key={page.key}>
            {
              page.parentId !== arr?.[i - 1]?.parentId
                    && <Title level={4} style={{ padding: '8px 0 8px 0' }}>
                      {page.parentTitle}
                    </Title>
            }
            <Title level={5}>
              <Checkbox
                disabled={disabled}
                checked={page.checked}
                onChange={(e) => onPageChange(e, i, page)}
                style={{marginRight: '10px'}} >
                {page.title}
              </Checkbox>
            </Title>
            {
              page.operation.map(item => {
                return (
                  <React.Fragment key={item.key}>
                    <Checkbox
                      disabled={!page.checked || disabled}
                      checked={item.checked && page.checked}
                      onChange={(e) => onOperationItemChange(e, item)}
                      style={{marginRight: '10px'}} >
                      {item.title}
                    </Checkbox>
                  </React.Fragment>
                )
              })
            }
            {
              // 分割线，最后一行不需要分割线
              pagesData.length !== i +  1 &&
              <Divider /> 
            }
          </div>
        )})
      : <Empty />
  )
}