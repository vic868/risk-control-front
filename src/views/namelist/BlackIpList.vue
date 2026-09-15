<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.ip"
        placeholder="IP地址"
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
      title="添加黑名单IP"
      @ok="handleAddSubmit"
      @cancel="addModalVisible = false"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="IP地址" :rules="[{ required: true }]">
          <a-input v-model:value="addForm.ip" placeholder="请输入IP地址" />
        </a-form-item>
        <a-form-item label="拉黑原因">
          <a-select v-model:value="addForm.reason">
            <a-select-option value="attack">攻击行为</a-select-option>
            <a-select-option value="spam">垃圾来源</a-select-option>
            <a-select-option value="proxy">代理IP</a-select-option>
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
  ip: ''
})

const addForm = reactive({
  ip: '',
  reason: 'attack',
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
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip'
  },
  {
    title: '拉黑原因',
    dataIndex: 'reason',
    key: 'reason',
    width: 120,
    customRender: ({ text }) => ({
      text: { attack: '攻击行为', spam: '垃圾来源', proxy: '代理IP', other: '其他' }[text] || text
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
    ip: '192.168.1.100',
    reason: 'attack',
    createTime: '2024-01-15 10:30:00',
    expireTime: '2025-01-15 10:30:00',
    remark: '暴力破解攻击'
  },
  {
    id: 2,
    ip: '10.0.0.50',
    reason: 'spam',
    createTime: '2024-01-18 09:00:00',
    expireTime: '2024-07-18 09:00:00',
    remark: '垃圾邮件来源'
  },
  {
    id: 3,
    ip: '172.16.0.200',
    reason: 'proxy',
    createTime: '2024-01-20 11:15:00',
    expireTime: '2024-01-25 09:30:00',
    remark: '已知代理IP'
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
  searchForm.ip = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  addModalVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addForm.ip.trim()) {
    message.error('请输入IP地址')
    return
  }
  
  loading.value = true
  try {
    await namelistApi.blackIpAdd({
      ip: addForm.ip,
      reason: addForm.reason,
      expireTime: addForm.expireTime,
      remark: addForm.remark
    })
    message.success('添加成功')
    addModalVisible.value = false
    addForm.ip = ''
    addForm.reason = 'attack'
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
    content: `确定要从黑名单中移除IP「${record.ip}」吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        loading.value = true
        await namelistApi.blackIpDelete({ id: record.id })
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
      ip: searchForm.ip
    }
    const result = await namelistApi.blackIpList(params)
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