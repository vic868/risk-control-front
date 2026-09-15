<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.name"
        placeholder="特征名称"
        class="search-input"
        allow-clear
      />
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
        <template v-if="column.key === 'overt'">
          <a-tag :color="record.overt ? 'green' : 'red'">
            {{ record.overt ? '是' : '否' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'io'">
          <a-tag :color="record.io ? 'blue' : 'gray'">
            {{ record.io ? '是' : '否' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space :size="4">
            <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    
    <a-modal
      v-model:open="viewModalVisible"
      title="特征详情"
      :footer="null"
      width="800px"
    >
      <a-descriptions :column="2" :data="viewData">
        <a-descriptions-item label="特征名称">{{ viewData.name }}</a-descriptions-item>
        <a-descriptions-item label="数据类型">{{ viewData.returnType }}</a-descriptions-item>
        <a-descriptions-item label="是否输出">{{ viewData.overt ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item label="是否IO型特征">{{ viewData.io ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item label="类目">{{ viewData.category }}</a-descriptions-item>
        <a-descriptions-item label="所属分组">{{ viewData.groupName }}</a-descriptions-item>
        <a-descriptions-item label="特征描述" :span="2">{{ viewData.description }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { featureApi } from '../../api'
import {
  SearchOutlined
} from '@ant-design/icons-vue'

const loading = ref(false)
const viewModalVisible = ref(false)
const viewData = ref({})

const searchForm = reactive({
  name: ''
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
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '是否输出',
    dataIndex: 'overt',
    key: 'overt'
  },
  {
    title: '是否IO型特征',
    dataIndex: 'io',
    key: 'io'
  },
  {
    title: '数据类型',
    dataIndex: 'returnType',
    key: 'returnType'
  },
  {
    title: '类目',
    dataIndex: 'category',
    key: 'category'
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions'
  }
]

const dataSource = ref([])

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  pagination.current = 1
  loadData()
}

const handleView = (record) => {
  viewData.value = record
  viewModalVisible.value = true
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      queryName: searchForm.name,
      page: pagination.current,
      pageNum: pagination.pageSize
    }
    const result = await featureApi.list(params)
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

</style>