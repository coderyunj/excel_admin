<template>
  <div class="notice-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">公告管理</span>
        <span class="page-count">共 {{ total }} 条公告</span>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        <span>添加公告</span>
      </el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="noticeList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80">
          <template #default="{ row }">
            <span class="id-cell">#{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容" :show-overflow-tooltip="true" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-cell">{{ formatTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" text @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '添加公告'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option label="普通" :value="0" />
            <el-option label="重要" :value="1" />
            <el-option label="紧急" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getNoticeList, createNotice, updateNotice, deleteNotice } from '../../api'

const loading = ref(false)
const submitting = ref(false)
const noticeList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)

const form = ref({
  id: null,
  title: '',
  content: '',
  priority: 0,
  status: 1
})

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

const getPriorityType = (p) => ['', 'warning', 'danger'][p] || 'info'
const getPriorityText = (p) => ['', '重要', '紧急'][p] || '普通'

const loadData = async () => {
  loading.value = true
  try {
    const res = await getNoticeList(currentPage.value, pageSize.value)
    if (res.code === 200) {
      noticeList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, title: '', content: '', priority: 0, status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该公告吗？', '提示', { type: 'warning' })
  await deleteNotice(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = async () => {
  if (!form.value.title) { ElMessage.warning('请输入标题'); return }
  if (!form.value.content) { ElMessage.warning('请输入内容'); return }
  submitting.value = true
  try {
    if (isEdit.value) await updateNotice(form.value.id, form.value)
    else await createNotice(form.value)
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.page-count { color: #9ca3af; font-size: 13px; }
.table-wrapper { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.id-cell { color: #3b82f6; font-weight: 500; }
.time-cell { color: #6b7280; font-size: 13px; }
.pagination-wrapper { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>