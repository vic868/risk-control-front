<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.userId"
        placeholder="用户ID"
        class="search-input"
        allow-clear
      />
      <a-input
        v-model:value="searchForm.phone"
        placeholder="手机号"
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
        添加白名单
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
      title="添加白名单用户"
      @ok="handleAddSubmit"
      @cancel="addModalVisible = false"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="用户ID" :rules="[{ required: true }]">
          <a-input v-model:value="addForm.userId" placeholder="请输入用户ID" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="addForm.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="白名单类型">
          <a-select v-model:value="addForm.type">
            <a-select-option value="vip">VIP用户</a-select-option>
            <a-select-option value="test">测试用户</a-select-option>
            <a-select-option value="internal">内部用户</a-select-option>
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
  userId: '',
  phone: ''
})

const addForm = reactive({
  userId: '',
  phone: '',
  type: 'vip',
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
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId'
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 130
  },
  {
    title: '白名单类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    customRender: ({ text }) => ({
      text: { vip: 'VIP用户', test: '测试用户', internal: '内部用户', other: '其他' }[text] || text
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
    userId: 'vip_001',
    phone: '138****0001',
    type: 'vip',
    createTime: '2024-01-10 09:00:00',
    expireTime: '2025-01-10 09:00:00',
    remark: 'VIP会员用户'
  },
  {
    id: 2,
    userId: 'test_001',
    phone: '139****0002',
    type: 'test',
    createTime: '2024-01-12 10:30:00',
    expireTime: '2024-06-12 10:30:00',
    remark: '测试账号'
  },
  {
    id: 3,
    userId: 'internal_001',
    phone: '137****0003',
    type: 'internal',
    createTime: '2024-01-15 08:00:00',
    expireTime: '2025-01-15 08:00:00',
    remark: '内部员工账号'
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
  searchForm.userId = ''
  searchForm.phone = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  addModalVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addForm.userId.trim()) {
    message.error('请输入用户ID')
    return
  }
  
  loading.value = true
  try {
    await namelistApi.whiteUserAdd({
      userId: addForm.userId,
      phone: addForm.phone,
      type: addForm.type,
      expireTime: addForm.expireTime,
      remark: addForm.remark
    })
    message.success('添加成功')
    addModalVisible.value = false
    addForm.userId = ''
    addForm.phone = ''
    addForm.type = 'vip'
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
    content: `确定要从白名单中移除用户「${record.userId}」吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        loading.value = true
        await namelistApi.whiteUserDelete({ id: record.id })
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
      userId: searchForm.userId,
      phone: searchForm.phone
    }
    const result = await namelistApi.whiteUserList(params)
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