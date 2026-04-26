import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request

export const getStats = () => request.get('/admin/stats')

export const getBannerList = (page, size) => request.get('/admin/banner', { params: { page, size } })
export const getBanner = (id) => request.get(`/admin/banner/${id}`)
export const createBanner = (data) => request.post('/admin/banner', data)
export const updateBanner = (id, data) => request.put(`/admin/banner/${id}`, data)
export const deleteBanner = (id) => request.delete(`/admin/banner/${id}`)

export const getUserList = (page, size, keyword) => request.get('/admin/user', { params: { page, size, keyword } })
export const getUser = (id) => request.get(`/admin/user/${id}`)
export const deleteUser = (id) => request.delete(`/admin/user/${id}`)

export const getTaskList = (page, size, keyword, userId) => request.get('/admin/task', { params: { page, size, keyword, userId } })
export const getTask = (id) => request.get(`/admin/task/${id}`)
export const deleteTask = (id) => request.delete(`/admin/task/${id}`)
export const getTaskStats = (id) => request.get(`/admin/task/${id}/stats`)
export const exportTask = (id, fileName) => request.get(`/admin/task/${id}/export`, { params: { fileName }, responseType: 'blob' })

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getNoticeList = (page, size) => request.get('/admin/notice', { params: { page, size } })
export const getNotice = (id) => request.get(`/admin/notice/${id}`)
export const createNotice = (data) => request.post('/admin/notice', data)
export const updateNotice = (id, data) => request.put(`/admin/notice/${id}`, data)
export const deleteNotice = (id) => request.delete(`/admin/notice/${id}`)