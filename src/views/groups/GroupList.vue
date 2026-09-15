<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.name"
        placeholder="分组名称"
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
        新增分组
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
        <template v-if="column.key === 'actions'">
          <span>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定删除"
              ok-text="确定"
              cancel-text="取消"
              @confirm="() => handleDelete(record)"
            >
              <a style="color: #ff4d4f;">删除</a>
            </a-popconfirm>
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { groupApi } from '../../api'
import {
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)

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
    title: '分组名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '前置函数',
    dataIndex: 'preScript',
    key: 'preScript'
  },
  {
    title: '后置函数',
    dataIndex: 'postScript',
    key: 'postScript'
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    key: 'createUser'
  },
  {
    title: '修改人',
    dataIndex: 'updateUser',
    key: 'updateUser'
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

const handleAdd = () => {
  router.push('/groups/add')
}

const handleEdit = (record) => {
  router.push(`/groups/edit/${record.name}`)
}

const handleDelete = async (record) => {
  loading.value = true
  try {
    await groupApi.delete({ id: record.id, name: record.name })
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      queryName: searchForm.name,
      page: pagination.current,
      pageNum: pagination.pageSize
    }
    const result = await groupApi.list(params)
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