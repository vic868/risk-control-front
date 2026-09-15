<template>
  <div class="page-container">
    <a-form :model="form" layout="vertical">
      <a-form-item label="分类名称">
        <a-input v-model:value="form.name" placeholder="请输入分类名称" disabled />
      </a-form-item>
      
      <a-form-item label="分类描述">
        <a-textarea v-model:value="form.description" placeholder="请输入分类描述" :rows="3" />
      </a-form-item>
      
      <a-form-item label="绑定策略">
        <a-textarea v-model:value="form.bind" placeholder="请输入策略名称，多个用逗号分隔" :rows="3" />
      </a-form-item>
      
      <a-form-item>
        <a-button type="primary" @click="handleSubmit" :loading="loading">
          <SaveOutlined />
          保存
        </a-button>
        <a-button @click="handleCancel">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { businessApi } from '../../api'
import {
  SaveOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  bind: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const name = route.params.name
    const result = await businessApi.query({ bizName: name })
    if (result) {
      form.name = result.name || ''
      form.description = result.description || ''
      form.bind = result.bind || ''
    }
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    message.error('分类名称不能为空')
    return
  }
  
  loading.value = true
  try {
    await businessApi.bind({
      name: form.name,
      description: form.description,
      bind: form.bind
    })
    message.success('保存成功')
    router.push('/business')
  } catch (error) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/business')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>

.page-container {
  max-width: 600px;
}
</style>