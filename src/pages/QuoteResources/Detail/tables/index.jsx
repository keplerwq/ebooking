
/* 处理选择其他时的显示 */
import React from 'react';
import {
  Button,
} from 'antd';
const newIDCFormMultiple = (value, otherValue) => {
  if (!value) return ''
  if (value.indexOf('其他') === -1) {
    return value.replace(/,/g, '；')
  }

  return value.replace(/,/g, '；').replace(/其他/, `其他：（${otherValue}）`)
}
function viewMore ({ str, key, id }) {
  if (!str) {
    return ''
  }
  if (str && str.length < 12) {
    return str
  }
  if (!this.state[key].includes(id)) {
    return <div>
      {str.slice(0, 12)}...<Button type="link" onClick={() => this.toggleDetail({ type: 'show', key, id })}>展示更多</Button>
    </div>
  } else {
    return <div>
      {str}<Button type="link" onClick={() => this.toggleDetail({ type: 'hide', key, id })}>收起</Button>
    </div>
  }
}
export const columnsFactory = function () {
  return {
    lineClassCircuit: [
      { title: 'A端地址', dataIndex: 'portAddressA', width: 150 },
      { title: 'Z端地址', dataIndex: 'portAddressZ', width: 150 },
      { title: '带宽要求(M)', dataIndex: 'bandwidthRequire', width: 150 },
      { title: '网络要求', dataIndex: 'netWorkRequire', width: 150 },
      { title: '用途说明', dataIndex: 'useDescription', width: 150, slot: '' },
      { title: 'SLA', dataIndex: 'sla', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: '备注', dataIndex: 'remark', width: 100, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    lineClassBareFiber: [
      { title: 'A端地址', dataIndex: 'portAddressA', width: 150 },
      { title: 'Z端地址', dataIndex: 'portAddressZ', width: 150 },
      {
        title: '路由选择',
        width: 150,
        dataIndex: 'routeChoose'
      },
      {
        title: '接口类型',
        dataIndex: 'interfaceType',
        width: 150,
        render: (text, record) => {
          let content = newIDCFormMultiple(
            record.interfaceType,
            record.interfaceTypeOther
          )
          return content
        }
      },
      { title: '用途说明', dataIndex: 'useDescription', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: 'SLA', dataIndex: 'sla', width: 150,render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: '备注', dataIndex: 'remark', width: 100,render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    overseasResourcesIdc: [
      { title: '区域/国家', dataIndex: 'area', width: 200 },
      { title: 'Z端城市', dataIndex: 'portAddressZ', width: 150 },
      { title: '带宽要求(M)', dataIndex: 'bandwidthRequire', width: 150 },
      { title: '网络要求', dataIndex: 'netWorkRequire', width: 150 },
      { title: '设备要求', dataIndex: 'deviceRequire', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.deviceRequire, key:'deviceRequireList', id: index})
    },
      { title: '用途说明', dataIndex: 'useDescription', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: 'SLA', dataIndex: 'sla', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: '备注', dataIndex: 'remark', width: 100, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    overseasResourcesCircuit: [
      { title: 'A端城市', dataIndex: 'portAddressA', width: 150 },
      { title: 'Z端城市', dataIndex: 'portAddressZ', width: 150 },
      { title: '带宽要求(M)', dataIndex: 'bandwidthRequire', width: 150 },
      { title: '网络要求', dataIndex: 'netWorkRequire', width: 150 },
      { title: '用途说明', dataIndex: 'useDescription', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: 'SLA', dataIndex: 'sla', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: '备注', dataIndex: 'remark', width: 100, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    overseasResourcesBareFiber: [
      { title: 'A端城市', dataIndex: 'portAddressA', width: 150 },
          { title: 'Z端城市', dataIndex: 'portAddressZ', width: 150 },
          {
            title: '路由选择',
            width: 150,
            dataIndex: 'routeChoose'
          },
          {
            title: '接口类型',
            dataIndex: 'interfaceType',
            width: 150,
            render: (text, record) => {
              let content = newIDCFormMultiple(
                record.interfaceType,
                record.interfaceTypeOther
              )
              return content
            }
          },
          { title: '用途说明', dataIndex: 'useDescription', width: 150 , slot: ''},
          { title: 'SLA', dataIndex: 'sla', width: 150 ,render: (text, record, index) =>
          viewMore.call(this, {str: record.sla, key:'slaList', id: index})
        },
          { title: '备注', dataIndex: 'remark', width: 100,render: (text, record, index) =>
          viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
        },
    ],
    mainEngineRoom: [
      { title: '城市', dataIndex: 'city', width: 150 },
      {
        title: '运营商',
        width: 150,
        dataIndex: 'operators'
      },
      { title: '机房名称', dataIndex: 'machineRoomName', width: 150 },
      { title: '带宽要求（M）', dataIndex: 'bandwidthRequire', width: 150 },
      { title: '预估机架用量（KW/个）', dataIndex: 'estimatedRackUsage', width: 150 },
      { title: 'IP数量（个）', dataIndex: 'ipCount', width: 150 },
      { title: '其他服务', dataIndex: 'serviceTypeOther', width: 150 },
      { title: '用途说明', dataIndex: 'useDescription', width: 150, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: 'SLA要求', dataIndex: 'sla', width: 150,render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: '备注', dataIndex: 'remark', width: 100, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    peripheralNode: [
      { title: '城市', dataIndex: 'city', width: 150 },
          { title: '机房名称', dataIndex: 'machineRoomName', width: 150 },
          { title: '带宽要求（M）', dataIndex: 'bandwidthRequire', width: 150 },
          { title: '设备数量', dataIndex: 'deviceNum', width: 150 },
          { title: 'IP数量（个）', dataIndex: 'ipCount', width: 150 },
          { title: '用途说明', dataIndex: 'useDescription', width: 150, render: (text, record, index) =>
            viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
          },
          { title: 'SLA要求', dataIndex: 'sla', width: 150, render: (text, record, index) =>
            viewMore.call(this, {str: record.sla, key:'slaList', id: index})
          },
          { title: '备注', dataIndex: 'remark', width: 100, render: (text, record, index) =>
          viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
        },
    ],
    oldPeripheralNode: [
      { title: "城市", dataIndex: "city", width: 200 },
      { title: "机房名称", dataIndex: "machineRoomName", width: 200 },
      {
        title: "服务类型", dataIndex: "serviceType", width: 250,
        render: (text, record) => {
          let content = newIDCFormMultiple(
            record.serviceType,
            record.serviceTypeOther
          )
          return content
        }
      },

      {
        title: "带宽类型", dataIndex: "bandwidthType", width: 200,
      },
      {
        title: "宽带要求（M）", dataIndex: "bandwidthRequire", width: 200,
      },
      {
        title: "可接受保底带宽（M）", dataIndex: "bottomBandwidth", width: 200,
      },
      {
        title: "端口数量&速率", dataIndex: "portNum", width: 200,
      },
      {
        title: "设备数量", dataIndex: "deviceNum", width: 200,
      },
      {
        title: "运营商&数量", dataIndex: "operatorNum", width: 200,
      },
      { title: "期望完成日期", dataIndex: "plannedCompletionTime", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200 },
      { title: "SLA要求", dataIndex: "sla", width: 200, render: (text, record, index) =>
        viewMore.call(this, {str: record.sla, key:'sla', id: index})
      },
      { title: "备注", dataIndex: "remark", width: 200, render: (text, record, index) =>
        viewMore.call(this, {str: record.remark, key:'remark', id: index})
      },
    ],
    bareFiber: [
      { title: "A端地址", dataIndex: "portAddressA", width: 200 },
      { title: "Z端地址", dataIndex: "portAddressZ", width: 200 },
      { title: "路由选择", dataIndex: "routeChoose", width: 200 },
      {
        title: "接口类型", dataIndex: "interfaceType", width: 200,
        render: (text, record) => {
          let content = newIDCFormMultiple(
            record.interfaceType,
            record.interfaceTypeOther
          )
          return content
        }
      },
      { title: "期望完成日期", dataIndex: "plannedCompletionTime", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: "SLA要求", dataIndex: "sla", width: 200,render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: "备注", dataIndex: "remark", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    cloudServices: [
      { title: "意向供应商", dataIndex: "intentionalSupplier", width: 280 },
      { title: "区域", dataIndex: "area", width: 250 },
      { title: "使用周期", dataIndex: "useCycle", width: 250 },
      { title: "用量说明", dataIndex: "useInstruction", width: 250 },
      { title: "用途说明", dataIndex: "useDescription", width: 250 },
      { title: "备注", dataIndex: "remark", width: 250 , render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    internationalRoutes: [
      { title: "A端地址", dataIndex: "portAddressA", width: 200 },
      { title: "Z端地址", dataIndex: "portAddressZ", width: 200 },
      { title: "传输带宽要求（M）", dataIndex: "bandwidthRequire", width: 200 },
      { title: "A端网络", dataIndex: "portAnetWork", width: 200 },
      { title: "A端设备要求", dataIndex: "portADeviceRequire", width: 200 },
      // A端设备要求选项不同对应不同
      {
        title: "A端托管数量",dataIndex: "portAtrusteeship", width: 200,
      },
      {
        title: "A端服务器租用配置", dataIndex: "portADeviceConfiguration", width: 200,
      },
      {
        title: "A端服务器租用数量", dataIndex: "portADeviceNum", width: 200,
      },
      {
        title: "A端虚机配置", dataIndex: "portAvirtualMachineConfiguration", width: 200,
      },
      {
        title: "A端虚机数量", dataIndex: "portAvirtualMachineNum", width: 200,
      },

      { title: "A端宽带要求（M）", dataIndex: "portAbandwidthRequire", width: 200 },
      { title: "A端IP数量", dataIndex: "portAipNum", width: 200 },
      { title: "z端网络", dataIndex: "portZnetWork", width: 200 },
      { title: "Z端设备要求", dataIndex: "portZDeviceRequire", width: 200 },
      // Z端设备要求选项不同对应不同
      {
        title: "Z端托管数量", dataIndex: "portZtrusteeship", width: 200,
      },
      {
        title: "Z端服务器租用配置", dataIndex: "portZDeviceConfiguration", width: 200,
      },
      {
        title: "Z端服务器租用数量", dataIndex: "portZDeviceNum", width: 200,
      },
      {
        title: "Z端虚机配置", dataIndex: "portZvirtualMachineConfiguration", width: 200,
      },
      {
        title: "Z端虚机数量", dataIndex: "portZvirtualMachineNum", width: 200,
      },
      { title: "Z端宽带要求（M）", dataIndex: "portZbandwidthRequire", width: 200 },
      { title: "z端IP数量", dataIndex: "portZipNum", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200 , render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: "SLA", dataIndex: "sla", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
    ],
    domesticRoute: [
      { title: "A端地址", dataIndex: "portAddressA", width: 200 },
      { title: "Z端地址", dataIndex: "portAddressZ", width: 200 },
      { title: "是否带保护（多条路由可达）", dataIndex: "protectIs", width: 200 },
      { title: "线路类型", dataIndex: "routeType", width: 200 },
      { title: "带宽要求（M）", dataIndex: "bandwidthRequire", width: 200 },
      {
        title: "接口类型", dataIndex: "interfaceType", width: 200,
        render: (text, record) => {
          let content = newIDCFormMultiple(
            record.interfaceType,
            record.interfaceTypeOther
          )
          return content
        }
      },
      { title: "期望完成日期", dataIndex: "plannedCompletionTime", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200 , render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: "SLA要求", dataIndex: "sla", width: 200 , render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: "备注", dataIndex: "remark", width: 200 , render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    DXRoute: [
      { title: "A端地址", dataIndex: "portAddressA", width: 200 },
      { title: "Z端地址", dataIndex: "portAddressZ", width: 200 },
      { title: "带宽要求（M）", dataIndex: "bandwidthRequire", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 220 },
      { title: "场地合同期", dataIndex: "poTime", width: 220 },
      { title: "供应商", dataIndex: "supplier", width: 220 },
      { title: "备注", dataIndex: "remark", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    CDNAndP2p: [
      {
        title: "意向厂家",
        dataIndex: "intentionManufacturer",
        width: 200,
        render: (text, record) => {
          return newIDCFormMultiple(
            record.intentionManufacturer,
            record.intentionManufacturerOther
          );
        }
      },
      {
        title: "服务区域",
        dataIndex: "serviceArea",
        width: 200,
        render: (text, record) => {
          return newIDCFormMultiple(
            record.serviceArea,
            record.serviceAreaOther
          );
        }
      },
      {
        title: "服务类型",
        dataIndex: "serviceType",
        width: 200,
        render: (text, record) => {
          let content = newIDCFormMultiple(
            record.serviceType,
            record.serviceTypeOther
          );
          return content;
        }
      },
      { title: "预估用量", dataIndex: "estimatedCount", width: 200 },
      { title: "技术要求", dataIndex: "technicalRequirement", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: "SLA要求", dataIndex: "sla", width: 200 , render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: "备注", dataIndex: "remark", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    oldMainEngineRoom: [
      { title: "城市", dataIndex: "city", width: 200 },
      { title: "运营商", dataIndex: "operators", width: 200 },
      { title: "机房名称", dataIndex: "machineRoomName", width: 200 },
      {
        title: "服务类型", dataIndex: "serviceType", width: 200,
        render: (text, record) => {
          let content = newIDCFormMultiple(
            record.serviceType,
            record.serviceTypeOther
          )
          return content
        }
      },

      {
        title: "带宽类型", dataIndex: "bandwidthType", width: 200,
      },
      {
        title: "宽带要求（M）", dataIndex: "bandwidthRequire", width: 200,
      },
      {
        title: "IP数量（个）", dataIndex: "ipCount", width: 200,
      },
      {
        title: "预估机架用量（KW/个）", dataIndex: "estimatedRackUsage", width: 200,
      },
      { title: "期望完成日期", dataIndex: "plannedCompletionTime", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: "SLA要求", dataIndex: "sla", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
      { title: "备注", dataIndex: "remark", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.remark, key:'remarkList', id: index})
    },
    ],
    other: [{ title: '备注', dataIndex: 'remark' }],
    overseas: [
      { title: "区域/国家", dataIndex: "area", width: 200 },
      { title: "Z端地址", dataIndex: "portAddressZ", width: 200 },
      { title: "出口带宽要求（M）", dataIndex: "bandwidthRequire", width: 200 },
      { title: "网络类型", dataIndex: "netWorkType", width: 200 },
      { title: "设备要求", dataIndex: "deviceRequire", width: 200 },
      { title: "托管数量", dataIndex: "trusteeship", width: 200,
        render: (text, record) => {
          if(record.deviceRequire) {
            if(record.deviceRequire.indexOf('托管') !== -1) {
              return record.trusteeship
            }else{
              record.trusteeship = ""
            }
          }
        }
      },
      { title: "服务器租用配置", dataIndex: "deviceConfiguration", width: 200,
        render: (text, records) => {
          if(records.deviceRequire) {
            if(records.deviceRequire.indexOf('服务器租用') !== -1) {
              return records.deviceConfiguration
            }else{
              records.deviceConfiguration = ""
            }
          }
        }
      },
      { title: "服务器租用数量", dataIndex: "deviceNum", width: 200,
        render: (text, records) => {
          if(records.deviceRequire) {
            if(records.deviceRequire.indexOf('服务器租用') !== -1) {
              return records.deviceNum
            }else{
              records.deviceNum = ""
            }
          }
        }
      },
      { title: "虚机配置", dataIndex: "virtualMachineConfiguration", width: 200,
        render: (text, records) => {
          if(records.deviceRequire) {
            if(records.deviceRequire.indexOf('虚机') !== -1) {
              return records.virtualMachineConfiguration
            }else{
              records.virtualMachineConfiguration = ""
            }
          }
        }
      },
      { title: "虚机数量", dataIndex: "virtualMachineNum", width: 200,
        render: (text, records) => {
          if(records.deviceRequire) {
            if(records.deviceRequire.indexOf('虚机') !== -1) {
              return records.virtualMachineNum
            }else{
              records.virtualMachineNum = ""
            }
          }
        }
      },
      { title: "其他设备要求", dataIndex: "deviceRequireOther", width: 200,
        render: (text, records) => {
          if(records.deviceRequire) {
            if(records.deviceRequire.indexOf('其他') !== -1) {
              return records.deviceRequireOther
            }else{
              records.deviceRequireOther = ""
            }
          }
        }
      },
      { title: "IP数量", dataIndex: "ipNum", width: 200 },
      { title: "用途说明", dataIndex: "useDescription", width: 200, render: (text, record, index) =>
      viewMore.call(this, {str: record.useDescription, key:'useDescriptionList', id: index})
    },
      { title: "SLA要求", dataIndex: "sla", width: 200 , render: (text, record, index) =>
      viewMore.call(this, {str: record.sla, key:'slaList', id: index})
    },
    ],
  }
}
