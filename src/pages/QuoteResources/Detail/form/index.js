
export { default as IdcSubject } from './idcSubject';
export { default as IdcPeripheral } from './idcPeripheral';
export { default as IdcCircuit } from './idcCircuit';
export { default as CDN } from './CDN';
export { default as CloudServices } from './cloudServices';
export { default as ForeignResources } from './foreignResources';
export { default as Other } from './other';

export const map = {
  '业务类型': 'supplierType',
  '供应商简称': 'supplierName',
  '机房地址': 'roomAddress',
  '机房名称': 'roomName',
  '计费二级项目': 'item2',
  '计费三级项目': 'item3',
  '计费四级项目': 'item4',
  '数量单位': 'unit',
  '币种': 'currency',
  '用量计费模式': 'usageUnit',
  '价格计费模式': 'model',
  '价格单位': 'priceUnit',
  '含税价格': 'estimatePrice',
  '预估价格': 'estimatePrice',
  '区间价格': 'price',
  '保底': 'bottom',
  '税率': 'tax',
  '赠送条款': 'giftTerms',
  'SLA': 'sla',
  '备注': 'remark',
  '计费项总价': 'itemTotalPrice',
  '专线名称':'privateLineName',
  '服务区域':'serviceArea',
  '报价有效期限':'validityPeriod',
  '两端地址':'bothEnds',
  '机房简称':'roomNameShort',
  '服务类别':'serviceCategory',
  '折扣率':'discountRate',
}
  