<template>
  <div class="page-container">
    <h1>编辑分组</h1>
    <a-row>
      <a-col :span="12">
        <a-form :model="form" layout="vertical">
          <a-form-item label="分组名称">
            <a-input v-model:value="form.name" placeholder="全英文或英文带下划线" :disabled="true" />
          </a-form-item>
          
          <a-form-item label="特征列表" :rules="[{ required: true, message: '不能为空' }]">
            <a-select
              v-model:value="selectedFeatures"
              mode="multiple"
              label-in-value
              placeholder="选择特征列表 (模糊搜索最多显示200个，可以输入更详细特征名)"
              :filter-option="false"
              @search="handleSearchFeature"
              :loading="searchLoading"
              class="feature-select"
            >
              <a-select-option v-for="feature in featureOptions" :key="feature.value" :value="feature.value">
                {{ feature.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="分组描述">
            <a-textarea v-model:value="form.description" placeholder="多行输入" />
          </a-form-item>
          
          <a-form-item label="前置函数">
            <a-input v-model:value="form.preScript" placeholder="预处理分组函数" />
          </a-form-item>
          
          <a-form-item label="后置函数">
            <a-input v-model:value="form.postScript" placeholder="后处理分组函数" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" @click="handleSubmit" :loading="loading">
              <SaveOutlined />
              提交
            </a-button>
            <a-button @click="toggleTest">测试</a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-form-item>
        </a-form>
      </a-col>
      
      <a-col :span="12">
        <div v-if="showTest" style="padding-left: 20px;">
          <a-form layout="vertical">
            <a-form-item label="输入数据">
              <a-textarea
                v-model:value="testContent"
                placeholder="请输入JSON格式的测试数据"
                :rows="15"
                class="test-textarea"
              />
            </a-form-item>
            
            <a-button type="primary" @click="handleTest" :loading="testLoading">
              <PlayCircleOutlined />
              执行测试
            </a-button>
            
            <a-form-item label="输出结果">
              <a-textarea
                v-model:value="testResult"
                :rows="15"
                :disabled="true"
                class="test-textarea"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { groupApi, featureApi } from '../../api'
import debounce from 'lodash/debounce'
import {
  PlayCircleOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const testLoading = ref(false)
const showTest = ref(false)
const searchLoading = ref(false)

let lastFetchId = 0

const form = reactive({
  name: '',
  description: '',
  preScript: '',
  postScript: ''
})

const selectedFeatures = ref([])
const featureOptions = ref([])
const testContent = ref('')
const testResult = ref('')

const fetchFeature = async (value) => {
  lastFetchId += 1
  const fetchId = lastFetchId
  searchLoading.value = true
  
  try {
    const result = await featureApi.list({
      queryName: value,
      page: 1,
      pageNum: 200
    })
    
    if (fetchId !== lastFetchId) {
      return
    }
    
    if (result && result.list) {
      featureOptions.value = result.list.map(item => ({
        label: item.name,
        value: item.name
      }))
    } else {
      featureOptions.value = []
    }
  } catch (error) {
    message.error('加载特征失败')
  } finally {
    searchLoading.value = false
  }
}

const handleSearchFeature = debounce(fetchFeature, 300)

const loadData = async () => {
  loading.value = true
  try {
    const name = route.params.name
    const result = await groupApi.query({ name })
    if (result) {
      form.name = result.name || ''
      form.description = result.description || ''
      form.preScript = result.preScript || ''
      form.postScript = result.postScript || ''
      
      if (result.features) {
        const featureList = result.features.split(',').filter(f => f.trim())
        selectedFeatures.value = featureList.map(f => ({
          key: f,
          label: f
        }))
      }
    }
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    message.error('请输入分组名称')
    return
  }
  
  if (selectedFeatures.value.length === 0) {
    message.error('请选择特征')
    return
  }
  
  loading.value = true
  try {
    const features = selectedFeatures.value.map(f => f.value || f.key).join(',')
    
    await groupApi.update({
      name: form.name,
      description: form.description,
      features: features,
      preScript: form.preScript,
      postScript: form.postScript
    })
    
    Modal.success({
      title: '提交成功',
      content: '策略代码编译正常，点击“测试按钮”可以继续测试策略逻辑'
    })
    
    showTest.value = true
  } catch (error) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

const toggleTest = () => {
  showTest.value = !showTest.value
}

const handleTest = async () => {
  if (!form.name) {
    message.warn('请先提交分组内容!')
    return
  }
  
  if (!testContent.value.trim()) {
    message.warn('请输入测试数据!')
    return
  }
  
  try {
    JSON.parse(testContent.value)
  } catch (e) {
    message.warn('输入数据格式错误!')
    return
  }
  
  testLoading.value = true
  try {
    const result = await groupApi.test({
      group: form.name,
      input: JSON.parse(testContent.value)
    })
    
    if (result) {
      testResult.value = JSON.stringify(result, null, 2)
    }
  } catch (error) {
    testResult.value = error.message || '测试失败'
    message.error('测试失败')
  } finally {
    testLoading.value = false
  }
}

const handleCancel = () => {
  router.push('/groups')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>

.feature-select {
  width: 100%;
}

.test-textarea {
  width: 100%;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
}
</style>