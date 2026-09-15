<template>
  <div class="page-container">
    <a-form :model="form" layout="vertical">
      <a-form-item label="分类名称" :rules="[{ required: true, message: '请输入分类名称' }]">
        <a-input v-model:value="form.name" placeholder="请输入分类名称" />
      </a-form-item>
      
      <a-form-item label="分类描述" :rules="[{ required: true, message: '请输入分类描述' }]">
        <a-textarea v-model:value="form.description" placeholder="请输入分类描述" :rows="3" />
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { businessApi } from '../../api'
import {
  SaveOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  name: '',
  description: ''
})

const handleSubmit = async () => {
  if (!form.name.trim()) {
    message.error('请输入分类名称')
    return
  }
  if (!form.description.trim()) {
    message.error('请输入分类描述')
    return
  }
  
  loading.value = true
  try {
    await businessApi.create({
      name: form.name,
      description: form.description
    })
    message.success('创建成功')
    router.push('/business')
  } catch (error) {
    message.error('创建失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/business')
}
</script>

<style scoped>

.page-container {
  max-width: 600px;
}
</style>