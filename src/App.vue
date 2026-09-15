<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
        fontSize: 14,
        colorBgLayout: '#f0f2f5'
      },
      components: {
        Menu: { itemBorderRadius: 8, itemMarginInline: 8, itemHeight: 40 },
        Table: { headerBg: '#fafafa', headerSplitColor: 'transparent', rowHoverBg: '#f5f9ff' },
        Button: { controlHeight: 34 }
      }
    }"
  >
    <a-layout style="min-height: 100vh">
      <a-layout-sider v-model:collapsed="collapsed" :width="216" class="sider">
        <div class="logo">
          <SafetyCertificateOutlined class="logo-icon" />
          <h1 v-if="!collapsed" class="logo-text">风控管理系统</h1>
        </div>
        <a-menu
          mode="inline"
          theme="dark"
          :selected-keys="selectedKeys"
          :open-keys="openKeys"
          @select="handleSelect"
          @openChange="onOpenChange"
        >
          <a-sub-menu key="strategies">
            <template #icon><FileTextOutlined /></template>
            <template #title>策略管理</template>
            <a-menu-item key="/strategies">策略列表</a-menu-item>
            <a-menu-item key="/strategies/add">新增策略</a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="features">
            <template #icon><DatabaseOutlined /></template>
            <template #title>特征管理</template>
            <a-menu-item key="/features">特征列表</a-menu-item>
            <a-menu-item key="/groups">特征分组</a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="namelist">
            <template #icon><UserOutlined /></template>
            <template #title>名单管理</template>
            <a-menu-item key="/namelist/black-user">黑名单用户</a-menu-item>
            <a-menu-item key="/namelist/black-ip">黑名单IP</a-menu-item>
            <a-menu-item key="/namelist/black-device">黑名单设备</a-menu-item>
            <a-menu-item key="/namelist/white-user">白名单用户</a-menu-item>
          </a-sub-menu>

          <a-menu-item key="/models">
            <template #icon><BoxPlotOutlined /></template>
            <span>模型管理</span>
          </a-menu-item>

          <a-menu-item key="/views">
            <template #icon><EyeOutlined /></template>
            <span>视图管理</span>
          </a-menu-item>

          <a-menu-item key="/business">
            <template #icon><ProjectOutlined /></template>
            <span>业务管理</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <a-layout>
        <a-layout-header class="header">
          <div class="header-content">
            <a-button type="text" class="collapse-btn" @click="collapsed = !collapsed">
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </a-button>
            <div class="header-title">{{ currentTitle }}</div>
            <div class="header-right">
              <a-dropdown>
                <a-button type="text" class="user-btn">
                  <a-avatar :size="28" class="user-avatar">管</a-avatar>
                  <span>管理员</span>
                  <DownOutlined class="user-caret" />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1">个人中心</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="2">退出登录</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </a-layout-header>

        <a-layout-content class="content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  BoxPlotOutlined,
  DatabaseOutlined,
  DownOutlined,
  EyeOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const selectedKeys = ref([])
const openKeys = ref([])

const titleMap = {
  '/strategies': '策略列表',
  '/strategies/add': '新增策略',
  '/strategies/edit': '编辑策略',
  '/features': '特征列表',
  '/groups': '特征分组',
  '/groups/add': '新增分组',
  '/groups/edit': '编辑分组',
  '/namelist/black-user': '黑名单用户',
  '/namelist/black-ip': '黑名单IP',
  '/namelist/black-device': '黑名单设备',
  '/namelist/white-user': '白名单用户',
  '/models': '模型管理',
  '/views': '视图管理',
  '/business': '业务管理',
  '/business/add': '新增业务',
  '/business/edit': '编辑业务'
}

// Which submenu a path belongs to, so we can auto-open it
const parentOf = (path) => {
  if (path.startsWith('/strategies')) return 'strategies'
  if (path.startsWith('/features') || path.startsWith('/groups')) return 'features'
  if (path.startsWith('/namelist')) return 'namelist'
  return null
}

const currentTitle = computed(() => {
  const path = route.path.split('/').slice(0, 3).join('/')
  return titleMap[path] || titleMap[route.path] || '风控管理系统'
})

const handleSelect = ({ key }) => {
  selectedKeys.value = [key]
  router.push(key)
}

const onOpenChange = (keys) => {
  openKeys.value = keys
}

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
    const parent = parentOf(newPath)
    if (parent && !collapsed.value) {
      openKeys.value = [...new Set([...openKeys.value, parent])]
    }
  },
  { immediate: true }
)

onMounted(() => {
  selectedKeys.value = [route.path]
  const parent = parentOf(route.path)
  if (parent) openKeys.value = [parent]
})
</script>

<style scoped>
.sider {
  background: #001529;
  box-shadow: 2px 0 8px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.logo-icon {
  font-size: 22px;
  color: #1677ff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0;
  white-space: nowrap;
}

.header {
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
  position: relative;
  z-index: 9;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.collapse-btn {
  margin-right: 12px;
  font-size: 16px;
  color: #595959;
}

.collapse-btn:hover {
  color: #1677ff;
}

.header-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 10px;
  border-radius: 8px;
}

.user-avatar {
  background: #1677ff;
  font-size: 13px;
  flex-shrink: 0;
}

.user-caret {
  font-size: 10px;
  color: #8c8c8c;
}

.content {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
