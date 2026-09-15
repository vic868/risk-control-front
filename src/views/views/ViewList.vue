<template>
  <div class="page-container">
    <a-tabs v-model:active-key="activeTab" class="tab-container">
      <a-tab-pane key="self" tab="我的视图">
        <a-table
          :columns="columns"
          :data-source="selfViews"
          :pagination="selfPagination"
          :loading="loading"
          row-key="name"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'state'">
              <a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="primary" size="small" @click="handleReview(record)">提交审核</a-button>
              <a-button size="small" @click="handleViewLog(record)">查看日志</a-button>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="other" tab="待审核">
        <a-table
          :columns="otherColumns"
          :data-source="otherViews"
          :pagination="otherPagination"
          :loading="loading"
          row-key="name"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'state'">
              <a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="primary" size="small" @click="handleApprove(record)">审核通过</a-button>
              <a-button size="small" @click="handleViewLog(record)">查看日志</a-button>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="history" tab="审核历史">
        <a-table
          :columns="historyColumns"
          :data-source="historyViews"
          :pagination="historyPagination"
          :loading="loading"
          row-key="name"
        >
          <template #bodyCell="{ column, text }">
            <template v-if="column.key === 'state'">
              <a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
    
    <a-modal
      v-model:open="logModalVisible"
      title="审核日志"
      :footer="null"
      width="800px"
    >
      <a-list :data-source="logList">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :title="item.action"
              :description="`操作人: ${item.operator} | ${item.time}`"
            />
            <p class="log-detail">{{ item.detail }}</p>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { viewApi } from '../../api'

const activeTab = ref('self')
const logModalVisible = ref(false)
const logList = ref([])
const loading = ref(false)

const selfViews = ref([])
const otherViews = ref([])
const historyViews = ref([])

const selfPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`,
  onChange: (page, pageSize) => {
    selfPagination.current = page
    selfPagination.pageSize = pageSize
    loadData()
  }
})

const otherPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`,
  onChange: (page, pageSize) => {
    otherPagination.current = page
    otherPagination.pageSize = pageSize
    loadData()
  }
})

const historyPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`,
  onChange: (page, pageSize) => {
    historyPagination.current = page
    historyPagination.pageSize = pageSize
    loadData()
  }
})

const columns = [
  { title: '视图名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'state', key: 'state' },
  { title: '申请人', dataIndex: 'applyUser', key: 'applyUser' },
  { title: '审核人', dataIndex: 'reviewUser', key: 'reviewUser' },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
  { title: '操作', key: 'action' }
]

const otherColumns = [
  { title: '视图名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'state', key: 'state' },
  { title: '申请人', dataIndex: 'applyUser', key: 'applyUser' },
  { title: '申请原因', dataIndex: 'reason', key: 'reason' },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
  { title: '操作', key: 'action' }
]

const historyColumns = [
  { title: '视图名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'state', key: 'state' },
  { title: '申请人', dataIndex: 'applyUser', key: 'applyUser' },
  { title: '审核人', dataIndex: 'reviewUser', key: 'reviewUser' },
  { title: '拒绝原因', dataIndex: 'rejectReason', key: 'rejectReason' },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' }
]

const getStatusColor = (state) => {
  switch (state) {
    case 0: return 'orange'
    case 1: return 'green'
    case 2: return 'red'
    default: return 'gray'
  }
}

const getStatusText = (state) => {
  switch (state) {
    case 0: return '待审核'
    case 1: return '通过'
    case 2: return '拒绝'
    default: return '未知'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await viewApi.logs({ page: 0, pageNum: 1000 })
    if (result && result.list) {
      const logs = result.list
      const selfData = logs.filter(item => item.state === 1)
      const otherData = logs.filter(item => item.state === 0)
      const historyData = logs.filter(item => item.state === 2)
      
      selfPagination.total = selfData.length
      otherPagination.total = otherData.length
      historyPagination.total = historyData.length
      
      const selfStart = (selfPagination.current - 1) * selfPagination.pageSize
      const otherStart = (otherPagination.current - 1) * otherPagination.pageSize
      const historyStart = (historyPagination.current - 1) * historyPagination.pageSize
      
      selfViews.value = selfData.slice(selfStart, selfStart + selfPagination.pageSize)
      otherViews.value = otherData.slice(otherStart, otherStart + otherPagination.pageSize)
      historyViews.value = historyData.slice(historyStart, historyStart + historyPagination.pageSize)
    } else {
      selfViews.value = []
      otherViews.value = []
      historyViews.value = []
      selfPagination.total = 0
      otherPagination.total = 0
      historyPagination.total = 0
    }
  } catch (error) {
    message.error('加载失败')
    selfViews.value = []
    otherViews.value = []
    historyViews.value = []
    selfPagination.total = 0
    otherPagination.total = 0
    historyPagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleReview = async (record) => {
  try {
    await viewApi.other({ name: record.name, state: 0 })
    message.success('审核提交成功')
    loadData()
  } catch (error) {
    message.error('提交失败')
  }
}

const handleViewLog = async (record) => {
  try {
    const result = await viewApi.logQuery({ name: record.name })
    if (result) {
      logList.value = [
        { action: '创建视图', operator: result.applyUser, time: result.updateTime, detail: `创建视图「${result.name}」` },
        { action: '提交审核', operator: result.applyUser, time: result.updateTime, detail: '提交审核申请' },
        { action: result.state === 1 ? '审核通过' : '审核拒绝', operator: result.reviewUser || '-', time: result.updateTime, detail: result.state === 1 ? '审核通过，视图已生效' : (result.rejectReason || '审核未通过') }
      ]
    } else {
      logList.value = []
    }
  } catch (error) {
    logList.value = []
  }
  logModalVisible.value = true
}

const handleApprove = async (record) => {
  Modal.confirm({
    title: '确认审核',
    content: `确定要通过视图「${record.name}」的审核吗？`,
    onOk: async () => {
      try {
        await viewApi.ok({ name: record.name, state: 1 })
        message.success('审核通过')
        loadData()
      } catch (error) {
        message.error('审核失败')
      }
    }
  })
}

watch(activeTab, () => {})

onMounted(() => {
  loadData()
})
</script>

<style scoped>

.tab-container {
  margin-bottom: 0;
}

.log-detail {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 13px;
}
</style>