import axios from 'axios'
import { message } from 'ant-design-vue'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

request.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const { code, msg, data } = response.data
    if (code === 200 || code === 0) {
      return data
    } else if (code === 9001) {
      message.warning('登录过期，请重新登录！')
      window.location.href = '/login'
    } else {
      message.error(msg || '请求失败')
      return Promise.reject(new Error(msg))
    }
  },
  error => {
    message.error('网络请求失败')
    return Promise.reject(error)
  }
)

export const strategyApi = {
  // 注意：DslAdminController.listAdapters(PageReq req) 没有 @RequestBody，
  // 参数只能通过 query string / form 绑定；用 JSON body 会被静默忽略（page 永远为默认值）。
  list: params =>
    request.post('/thanos-admin/api/v1/dsl/list', null, {
      params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  query: params => request.get('/thanos-admin/api/v1/dsl/query', { params }),
  update: params => request.post('/thanos-admin/api/v1/dsl/update', params),
  delete: params => request.post('/thanos-admin/api/v1/dsl/delete', params),
  create: params => request.post('/thanos-admin/api/v1/dsl/create', params),
  test: params => request.post('/thanos-admin/api/v1/dsl/test', params),
  compile: params => request.post('/thanos-admin/api/v1/dsl/compile', params)
}

export const featureApi = {
  list: params => request.post('/thanos-admin/api/v1/feature/list', params),
  query: params => request.get('/thanos-admin/api/v1/feature/query', { params })
}

export const groupApi = {
  list: params => request.post('/thanos-admin/api/v1/group/list', params),
  query: params => request.get('/thanos-admin/api/v1/group/query', { params }),
  update: params => request.post('/thanos-admin/api/v1/group/update', params),
  delete: params => request.post('/thanos-admin/api/v1/group/delete', params),
  create: params => request.post('/thanos-admin/api/v1/group/create', params),
  test: params => request.post('/thanos-admin/api/v1/group/test', params)
}

export const namelistApi = {
  blackUserList: params => request.post('/thanos-admin/api/v1/namelist/black/user/list', params),
  blackUserAdd: params => request.post('/thanos-admin/api/v1/namelist/black/user/add', params),
  blackUserUpdate: params => request.post('/thanos-admin/api/v1/namelist/black/user/update', params),
  blackUserDelete: params => request.post('/thanos-admin/api/v1/namelist/black/user/delete', params),
  
  blackIpList: params => request.post('/thanos-admin/api/v1/namelist/black/ip/list', params),
  blackIpAdd: params => request.post('/thanos-admin/api/v1/namelist/black/ip/add', params),
  blackIpUpdate: params => request.post('/thanos-admin/api/v1/namelist/black/ip/update', params),
  blackIpDelete: params => request.post('/thanos-admin/api/v1/namelist/black/ip/delete', params),
  
  blackDeviceList: params => request.post('/thanos-admin/api/v1/namelist/black/device/list', params),
  blackDeviceAdd: params => request.post('/thanos-admin/api/v1/namelist/black/device/add', params),
  blackDeviceUpdate: params => request.post('/thanos-admin/api/v1/namelist/black/device/update', params),
  blackDeviceDelete: params => request.post('/thanos-admin/api/v1/namelist/black/device/delete', params),
  
  whiteUserList: params => request.post('/thanos-admin/api/v1/namelist/white/user/list', params),
  whiteUserAdd: params => request.post('/thanos-admin/api/v1/namelist/white/user/add', params),
  whiteUserUpdate: params => request.post('/thanos-admin/api/v1/namelist/white/user/update', params),
  whiteUserDelete: params => request.post('/thanos-admin/api/v1/namelist/white/user/delete', params)
}

export const modelApi = {
  list: params => request.post('/thanos-admin/api/v1/model/list', params),
  update: params => request.get('/gamora/api/v1/model/update', { params }),
  delete: params => request.get('/gamora/api/v1/model/delete', { params })
}

export const viewApi = {
  self: params => request.post('/thanos-admin/api/v1/view/self', params),
  other: params => request.post('/thanos-admin/api/v1/view/other', params),
  ok: params => request.post('/thanos-admin/api/v1/view/ok', params),
  logs: params => request.post('/thanos-admin/api/v1/view/logs', params),
  logSave: params => request.post('/thanos-admin/api/v1/view/log/save', params),
  logQuery: params => request.get('/thanos-admin/api/v1/view/log/query', { params })
}

export const businessApi = {
  list: params => request.get('/thanos-admin/api/v1/classify/list', { params }),
  create: params => request.post('/thanos-admin/api/v1/classify/create', params),
  query: params => request.get('/thanos-admin/api/v1/classify/query', { params }),
  bind: params => request.post('/thanos-admin/api/v1/classify/bind', params),
  unbind: params => request.get('/thanos-admin/api/v1/classify/unbind', { params }),
  delete: params => request.get('/thanos-admin/api/v1/classify/delete', { params })
}

export default request