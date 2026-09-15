<template>
  <div class="panel-container">
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusName(record.status) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space :size="4">
            <a-button type="link" size="small" v-if="showActions !== false" @click="$emit('review', record)">
              提交审核
            </a-button>
            <a-button type="link" size="small" v-if="showActions !== false" @click="$emit('view-log', record)">
              查看日志
            </a-button>
            <a-button type="link" size="small" v-if="showReview" type="primary" @click="$emit('approve', record)">
              通过审核
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    
    <div v-if="data.length === 0" class="empty-state">
      <a-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  showReview: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['review', 'view-log', 'approve'])

const columns = [
  {
    title: '视图名称',
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
    title: '申请人',
    dataIndex: 'applicant',
    key: 'applicant',
    width: 100,
    customRender: ({ text }) => ({
      text: text || '-'
    })
  },
  {
    title: '审核人',
    dataIndex: 'reviewer',
    key: 'reviewer',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '审核时间',
    dataIndex: 'reviewTime',
    key: 'reviewTime',
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

const statusMap = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝'
}

const statusColorMap = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red'
}

const getStatusName = (status) => statusMap[status] || status
const getStatusColor = (status) => statusColorMap[status] || 'default'
</script>

<style scoped>
.panel-container {
  padding-top: 16px;
}

.empty-state {
  padding: 40px;
}
</style>