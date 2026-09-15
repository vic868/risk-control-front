import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/strategies'
  },
  {
    path: '/strategies',
    name: 'Strategies',
    component: () => import('../views/strategies/StrategyList.vue')
  },
  {
    path: '/strategies/add',
    name: 'AddStrategy',
    component: () => import('../views/strategies/AddStrategy.vue')
  },
  {
    path: '/strategies/edit/:name',
    name: 'EditStrategy',
    component: () => import('../views/strategies/EditStrategy.vue')
  },
  {
    path: '/features',
    name: 'Features',
    component: () => import('../views/features/FeatureList.vue')
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('../views/groups/GroupList.vue')
  },
  {
    path: '/groups/add',
    name: 'AddGroup',
    component: () => import('../views/groups/AddGroup.vue')
  },
  {
    path: '/groups/edit/:name',
    name: 'EditGroup',
    component: () => import('../views/groups/EditGroup.vue')
  },
  {
    path: '/namelist/black-user',
    name: 'BlackUserList',
    component: () => import('../views/namelist/BlackUserList.vue')
  },
  {
    path: '/namelist/black-ip',
    name: 'BlackIpList',
    component: () => import('../views/namelist/BlackIpList.vue')
  },
  {
    path: '/namelist/black-device',
    name: 'BlackDeviceList',
    component: () => import('../views/namelist/BlackDeviceList.vue')
  },
  {
    path: '/namelist/white-user',
    name: 'WhiteUserList',
    component: () => import('../views/namelist/WhiteUserList.vue')
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('../views/models/ModelList.vue')
  },
  {
    path: '/views',
    name: 'Views',
    component: () => import('../views/views/ViewList.vue')
  },
  {
    path: '/business',
    name: 'Business',
    component: () => import('../views/business/BusinessList.vue')
  },
  {
    path: '/business/add',
    name: 'AddBusiness',
    component: () => import('../views/business/AddBusiness.vue')
  },
  {
    path: '/business/edit/:name',
    name: 'EditBusiness',
    component: () => import('../views/business/EditBusiness.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router