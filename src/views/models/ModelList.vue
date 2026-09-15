<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.name"
        placeholder="模型名称"
        class="search-input"
        allow-clear
      />
      <a-select
        v-model:value="searchForm.status"
        placeholder="状态"
        class="search-select"
      >
        <a-select-option value="">全部</a-select-option>
        <a-select-option value="online">在线</a-select-option>
        <a-select-option value="offline">离线</a-select-option>
        <a-select-option value="training">训练中</a-select-option>
      </a-select>
      <a-button type="primary" @click="handleSearch">
        <SearchOutlined />
        查询
      </a-button>
      <a-button @click="handleReset">重置</a-button>
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
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusName(record.status) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'accuracy'">
          <a-progress :percent="record.accuracy" :show-info="false" stroke-width="8" />
          <span class="accuracy-text">{{ record.accuracy }}%</span>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space :size="4">
            <a-button type="link" size="small" @click="handleUpdate(record)">更新模型</a-button>
            <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
            <a-button type="link" size="small" @click="handleView(record)">查看详情</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    
    <a-modal
      v-model:open="viewModalVisible"
      title="模型详情"
      :footer="null"
      width="800px"
    >
      <a-descriptions :column="2" :data="viewData">
        <a-descriptions-item label="模型名称">{{ viewData.name }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ getStatusName(viewData.status) }}</a-descriptions-item>
        <a-descriptions-item label="准确率">{{ viewData.accuracy }}%</a-descriptions-item>
        <a-descriptions-item label="版本号">{{ viewData.version }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ viewData.createTime }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ viewData.updateTime }}</a-descriptions-item>
        <a-descriptions-item label="模型描述" :span="2">{{ viewData.description }}</a-descriptions-item>
        <a-descriptions-item label="特征数量" :span="2">
          <a-tag color="blue">{{ viewData.featureCount }} 个特征</a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal as aModal } from 'ant-design-vue'
import { modelApi } from '../../api'
import {
  SearchOutlined
} from '@ant-design/icons-vue'

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
    title: '模型名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '版本号',
    dataIndex: 'version',
    key: 'version',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '准确率',
    dataIndex: 'accuracy',
    key: 'accuracy',
    width: 150
  },
  {
    title: '特征数量',
    dataIndex: 'featureCount',
    key: 'featureCount',
    width: 100
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

const dataSource = ref([
  {
    id: 1,
    name: '反欺诈模型_V1',
    version: '1.0.0',
    status: 'online',
    accuracy: 95,
    featureCount: 24,
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-20 14:30:00',
    description: '基于XGBoost的反欺诈检测模型，用于识别欺诈交易行为'
  },
  {
    id: 2,
    name: '信用评估模型_V2',
    version: '2.1.0',
    status: 'online',
    accuracy: 89,
    featureCount: 18,
    createTime: '2024-01-12 10:15:00',
    updateTime: '2024-01-18 11:20:00',
    description: '用户信用评分模型，评估用户信用等级'
  },
  {
    id: 3,
    name: '风险预测模型_V3',
    version: '3.0.0',
    status: 'training',
    accuracy: 0,
    featureCount: 32,
    createTime: '2024-01-15 08:30:00',
    updateTime: '2024-01-25 09:30:00',
    description: '实时风险预测模型，正在训练中'
  },
  {
    id: 4,
    name: '异常检测模型_V1',
    version: '1.2.0',
    status: 'offline',
    accuracy: 82,
    featureCount: 15,
    createTime: '2024-01-18 11:00:00',
    updateTime: '2024-01-22 09:15:00',
    description: '异常行为检测模型，已下线维护'
  }
])

const statusMap = {
  online: '在线',
  offline: '离线',
  training: '训练中'
}

const statusColorMap = {
  online: 'green',
  offline: 'red',
  training: 'orange'
}

const getStatusName = (status) => statusMap[status] || status
const getStatusColor = (status) => statusColorMap[status] || 'default'

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

const handleUpdate = (record) => {
  aModal.confirm({
    title: '确认更新',
    content: `确定要更新模型「${record.name}」吗？`,
    onOk: async () => {
      try {
        loading.value = true
        await modelApi.update({ name: record.name })
        message.success('更新成功')
        loadData()
      } catch (error) {
        message.error('更新失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleView = (record) => {
  viewData.value = record
  viewModalVisible.value = true
}

const handleDelete = (record) => {
  aModal.confirm({
    title: '确认删除',
    content: `确定要删除模型「${record.name}」吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        loading.value = true
        await modelApi.delete({ name: record.name })
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
      name: searchForm.name,
      status: searchForm.status
    }
    const result = await modelApi.list(params)
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

.accuracy-text {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}
</style>