<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.deviceId"
        placeholder="设备ID"
        class="search-input"
        allow-clear
      />
      <a-button type="primary" @click="handleSearch">
        <SearchOutlined />
        查询
      </a-button>
      <a-button @click="handleReset">重置</a-button>
      <a-button class="push-right" type="primary" @click="handleAdd">
        <PlusOutlined />
        添加黑名单
      </a-button>
    </div>
    
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'expireTime'">
          <span :class="{ 'expired': isExpired(record.expireTime) }">
            {{ record.expireTime }}
          </span>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space :size="4">
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    
    <a-modal
      v-model:open="addModalVisible"
      title="添加黑名单设备"
      @ok="handleAddSubmit"
      @cancel="addModalVisible = false"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="设备ID" :rules="[{ required: true }]">
          <a-input v-model:value="addForm.deviceId" placeholder="请输入设备ID" />
        </a-form-item>
        <a-form-item label="设备类型">
          <a-select v-model:value="addForm.deviceType">
            <a-select-option value="mobile">手机</a-select-option>
            <a-select-option value="pc">电脑</a-select-option>
            <a-select-option value="tablet">平板</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="拉黑原因">
          <a-select v-model:value="addForm.reason">
            <a-select-option value="fraud">欺诈设备</a-select-option>
            <a-select-option value="multiAccount">多账号</a-select-option>
            <a-select-option value="risk">风险设备</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="过期时间">
          <a-date-picker v-model:value="addForm.expireTime" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="addForm.remark" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal as aModal } from 'ant-design-vue'
import { namelistApi } from '../../api'
import {
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const loading = ref(false)
const addModalVisible = ref(false)

const searchForm = reactive({
  deviceId: ''
})

const addForm = reactive({
  deviceId: '',
  deviceType: 'mobile',
  reason: 'fraud',
  expireTime: null,
  remark: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`,
  onChange: (page, pageSize) => {
    pagination.current = page
    pagination.pageSize = pageSize
    loadData()
  }
})

const columns = [
  {
    title: '设备ID',
    dataIndex: 'deviceId',
    key: 'deviceId'
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    key: 'deviceType',
    width: 100,
    customRender: ({ text }) => ({
      text: { mobile: '手机', pc: '电脑', tablet: '平板', other: '其他' }[text] || text
    })
  },
  {
    title: '拉黑原因',
    dataIndex: 'reason',
    key: 'reason',
    width: 120,
    customRender: ({ text }) => ({
      text: { fraud: '欺诈设备', multiAccount: '多账号', risk: '风险设备', other: '其他' }[text] || text
    })
  },
  {
    title: '添加时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '过期时间',
    dataIndex: 'expireTime',
    key: 'expireTime',
    width: 180
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

const dataSource = ref([
  {
    id: 1,
    deviceId: 'device_001',
    deviceType: 'mobile',
    reason: 'fraud',
    createTime: '2024-01-15 10:30:00',
    expireTime: '2025-01-15 10:30:00',
    remark: '关联欺诈行为'
  },
  {
    id: 2,
    deviceId: 'device_002',
    deviceType: 'pc',
    reason: 'multiAccount',
    createTime: '2024-01-18 09:00:00',
    expireTime: '2024-07-18 09:00:00',
    remark: '登录多个账号'
  },
  {
    id: 3,
    deviceId: 'device_003',
    deviceType: 'tablet',
    reason: 'risk',
    createTime: '2024-01-20 11:15:00',
    expireTime: '2024-01-25 09:30:00',
    remark: '风险设备识别'
  }
])

const isExpired = (expireTime) => {
  return new Date(expireTime) < new Date()
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.deviceId = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  addModalVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addForm.deviceId.trim()) {
    message.error('请输入设备ID')
    return
  }
  
  loading.value = true
  try {
    await namelistApi.blackDeviceAdd({
      deviceId: addForm.deviceId,
      deviceType: addForm.deviceType,
      reason: addForm.reason,
      expireTime: addForm.expireTime,
      remark: addForm.remark
    })
    message.success('添加成功')
    addModalVisible.value = false
    addForm.deviceId = ''
    addForm.deviceType = 'mobile'
    addForm.reason = 'fraud'
    addForm.expireTime = null
    addForm.remark = ''
    loadData()
  } catch (error) {
    message.error('添加失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (record) => {
  message.info('编辑功能开发中')
}

const handleDelete = (record) => {
  aModal.confirm({
    title: '确认删除',
    content: `确定要从黑名单中移除设备「${record.deviceId}」吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        loading.value = true
        await namelistApi.blackDeviceDelete({ id: record.id })
        message.success('删除成功')
        loadData()
      } catch (error) {
        message.error('删除失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageNum: pagination.pageSize,
      deviceId: searchForm.deviceId
    }
    const result = await namelistApi.blackDeviceList(params)
    if (result && result.list) {
      dataSource.value = result.list
      pagination.total = result.total || 0
    } else {
      dataSource.value = []
      pagination.total = 0
    }
  } catch (error) {
    message.error('加载失败')
    dataSource.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>

.expired {
  color: #ff4d4f;
}
</style>