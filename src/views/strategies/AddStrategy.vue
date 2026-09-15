<template>
  <div class="page-container">
    <a-form :model="form" layout="vertical">
      <a-form-item label="策略名称" :rules="[{ required: true, message: '请输入策略名称' }]">
        <a-input v-model:value="form.name" placeholder="全英文或英文带下划线" />
      </a-form-item>
      
      <a-form-item label="策略描述" :rules="[{ required: true, message: '不能为空' }, { max: 64, message: '长度不能超过64' }]">
        <a-textarea v-model:value="form.description" placeholder="多行输入" :rows="3" />
      </a-form-item>
      
      <a-form-item label="策略类型">
        <a-select v-model:value="form.type">
          <a-select-option :value="0">策略</a-select-option>
          <a-select-option :value="1">流程</a-select-option>
          <a-select-option :value="2">模型</a-select-option>
          <a-select-option :value="3">调度</a-select-option>
          <a-select-option :value="4">规则</a-select-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="策略内容" :rules="[{ required: true, message: '请输入策略内容' }]">
        <ace-editor
          v-model="form.content"
          mode="java"
          theme="monokai"
          height="400px"
          font-size="14"
        />
      </a-form-item>
      
      <a-form-item label="是否启用">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>
      
      <a-form-item>
        <a-button type="primary" @click="handleSubmit" :loading="loading">
          <SaveOutlined />
          提交
        </a-button>
        <a-button @click="handleTest">测试</a-button>
        <a-button @click="handleCancel">取消</a-button>
      </a-form-item>
    </a-form>
    
    <a-modal
      v-model:open="testModalVisible"
      title="策略测试"
      width="900px"
      :footer="null"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="输入数据">
            <ace-editor
              v-model="testInput"
              mode="json"
              theme="monokai"
              height="250px"
              font-size="14"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="输出结果">
            <ace-editor
              v-model="testOutput"
              mode="json"
              theme="monokai"
              height="250px"
              font-size="14"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item>
        <a-button type="primary" @click="handleRunTest">执行测试</a-button>
        <a-button @click="testModalVisible = false">关闭</a-button>
      </a-form-item>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { strategyApi } from '../../api'
import AceEditor from '../../components/AceEditor.vue'
import {
  SaveOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const testModalVisible = ref(false)
const testInput = ref('')
const testOutput = ref('')

const form = reactive({
  name: '',
  description: '',
  type: 0,
  content: '',
  enabled: true,
  state: 1
})

const handleSubmit = async () => {
  if (!form.name.trim()) {
    message.error('请输入策略名称')
    return
  }
  if (!form.description.trim()) {
    message.error('请输入策略描述')
    return
  }
  if (!form.content.trim()) {
    message.error('请输入策略内容')
    return
  }
  
  loading.value = true
  try {
    await strategyApi.create({
      name: form.name,
      description: form.description,
      content: form.content,
      enabled: form.enabled,
      state: form.state,
      type: form.type,
      createUser: 'admin',
      updateUser: 'admin'
    })
    message.success('保存成功')
    router.push('/strategies')
  } catch (error) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

const handleTest = () => {
  if (!form.name.trim()) {
    message.error('请先输入策略名称')
    return
  }
  testInput.value = '{}'
  testOutput.value = ''
  testModalVisible.value = true
}

const handleRunTest = async () => {
  if (!testInput.value.trim()) {
    message.error('请输入测试数据')
    return
  }
  
  try {
    JSON.parse(testInput.value)
  } catch (e) {
    message.error('输入数据格式错误')
    return
  }
  
  loading.value = true
  try {
    const result = await strategyApi.test({
      name: form.name,
      type: form.type,
      input: JSON.parse(testInput.value)
    })
    testOutput.value = JSON.stringify(result, null, 2)
  } catch (error) {
    testOutput.value = error.message || '测试失败'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/strategies')
}
</script>

<style scoped>

.page-container {
  max-width: 100%;
}
</style>