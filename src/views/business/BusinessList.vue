<template>
  <div class="page-container">
    <div class="search-bar">
      <a-input
        v-model:value="searchForm.queryName"
        placeholder="分类名称"
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
        添加分类
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
          <a-space :size="4">
            <a-button type="link" size="small" @click="handleBind(record)">绑定</a-button>
            <a-popconfirm
              title="确定删除"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:visible="showAddModal"
      title="新建分类"
      @ok="handleAddOk"
      @cancel="showAddModal = false"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="分类名称" :rules="[{ required: true, message: '请输入分类名称' }]">
          <a-input v-model:value="addForm.name" placeholder="请输入分类名称" />
        </a-form-item>
        <a-form-item label="分类描述" :rules="[{ required: true, message: '请输入分类描述' }]">
          <a-textarea v-model:value="addForm.description" placeholder="请输入分类描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="showBindModal"
      title="绑定策略"
      @ok="handleBindOk"
      @cancel="showBindModal = false"
    >
      <a-form :model="bindForm" layout="vertical">
        <a-form-item label="分类名称">
          <a-input v-model:value="bindForm.name" disabled />
        </a-form-item>
        <a-form-item label="分类描述">
          <a-textarea v-model:value="bindForm.description" placeholder="请输入分类描述" :rows="3" />
        </a-form-item>
        <a-form-item label="绑定策略">
          <a-textarea v-model:value="bindForm.bind" placeholder="请输入策略名称，多个用逗号分隔" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal as aModal } from 'ant-design-vue'
import { businessApi } from '../../api'
import {
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const loading = ref(false)
const showAddModal = ref(false)
const showBindModal = ref(false)

const searchForm = reactive({
  queryName: ''
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
    key: 'name',
    ellipsis: true
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '操作人',
    dataIndex: 'operator',
    key: 'operator',
    width: 120
  },
  {
    title: '绑定策略',
    dataIndex: 'bind',
    key: 'bind',
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

const dataSource = ref([])

const addForm = reactive({
  name: '',
  description: ''
})

const bindForm = reactive({
  name: '',
  description: '',
  bind: ''
})

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.queryName = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  addForm.name = ''
  addForm.description = ''
  showAddModal.value = true
}

const handleBind = (record) => {
  bindForm.name = record.name
  bindForm.description = record.description || ''
  bindForm.bind = record.bind || ''
  showBindModal.value = true
}

const handleDelete = async (record) => {
  try {
    loading.value = true
    await businessApi.delete({ name: record.name })
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  } finally {
    loading.value = false
  }
}

const handleAddOk = async () => {
  if (!addForm.name.trim()) {
    message.error('请输入分类名称')
    return
  }
  if (!addForm.description.trim()) {
    message.error('请输入分类描述')
    return
  }

  try {
    loading.value = true
    await businessApi.create({
      name: addForm.name,
      description: addForm.description
    })
    message.success('创建成功')
    showAddModal.value = false
    loadData()
  } catch (error) {
    message.error('创建失败')
  } finally {
    loading.value = false
  }
}

const handleBindOk = async () => {
  if (!bindForm.name.trim()) {
    message.error('分类名称不能为空')
    return
  }

  try {
    loading.value = true
    await businessApi.bind({
      name: bindForm.name,
      description: bindForm.description,
      bind: bindForm.bind
    })
    message.success('绑定成功')
    showBindModal.value = false
    loadData()
  } catch (error) {
    message.error('绑定失败')
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await businessApi.list({
      page: pagination.current,
      pageNum: pagination.pageSize,
      queryName: searchForm.queryName
    })
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

</style>