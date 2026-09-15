<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.name"
        placeholder="策略名称"
        class="search-input"
        allow-clear
      />
      <a-select
        v-model:value="searchForm.status"
        placeholder="状态"
        class="search-select"
      >
        <a-select-option value="">全部</a-select-option>
        <a-select-option value="1">启用</a-select-option>
        <a-select-option value="0">禁用</a-select-option>
      </a-select>
      <a-button type="primary" @click="handleSearch">
        <SearchOutlined />
        查询
      </a-button>
      <a-button @click="handleReset">重置</a-button>
      <a-button class="push-right" type="primary" @click="handleAdd">
        <PlusOutlined />
        新增策略
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
        <template v-if="column.key === 'status'">
          <a-tag :color="record.enabled ? 'green' : 'red'">
            {{ record.enabled ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space :size="4">
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
            <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    
    <a-modal
      v-model:open="viewModalVisible"
      title="策略详情"
      :footer="null"
      width="800px"
    >
      <a-descriptions :column="2" :data="viewData">
        <a-descriptions-item label="策略名称">{{ viewData.name }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ viewData.enabled ? '启用' : '禁用' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ viewData.createTime }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ viewData.updateTime }}</a-descriptions-item>
        <a-descriptions-item label="策略内容" :span="2">
          <pre class="code-pre">{{ viewData.content }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal as aModal } from 'ant-design-vue'
import { strategyApi } from '../../api'
import {
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const viewModalVisible = ref(false)
const viewData = ref({})

const searchForm = reactive({
  name: '',
  status: ''
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
    title: '策略名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

const dataSource = ref([])

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  router.push('/strategies/add')
}

const handleEdit = (record) => {
  router.push(`/strategies/edit/${record.name}`)
}

const handleView = async (record) => {
  try {
    loading.value = true
    const data = await strategyApi.query({ name: record.name })
    viewData.value = data
    viewModalVisible.value = true
  } catch (error) {
    message.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = (record) => {
  aModal.confirm({
    title: '确认删除',
    content: `确定要删除策略「${record.name}」吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        loading.value = true
        await strategyApi.delete({ name: record.name })
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
      queryName: searchForm.name,
      state: searchForm.status ? parseInt(searchForm.status) : null,
      page: pagination.current,
      pageNum: pagination.pageSize
    }
    const result = await strategyApi.list(params)
    if (result && result.list) {
      dataSource.value = result.list
      pagination.total = result.total || 0
    }
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>

.code-pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
}
</style>