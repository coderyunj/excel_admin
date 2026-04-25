<template>
  <div class="task-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">任务档案</span>
        <span class="page-count">共 {{ total }} 条任务</span>
      </div>
      <el-input v-model="search" placeholder="搜索任务名称..." :prefix-icon="Search" clearable style="width: 220px" @input="loadData()" />
    </div>

    <div class="table-wrapper">
      <el-table :data="taskList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80">
          <template #default="{ row }"><span class="id-cell">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="title" label="任务名称" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }"><span class="time-cell">{{ formatTime(row.createdAt) }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleView(row)">查看</el-button>
            <el-button type="success" size="small" text @click="handleExport(row)">导出</el-button>
            <el-button type="danger" size="small" text @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" @change="loadData()" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getTaskList, deleteTask, exportTask } from '../../api'

const loading = ref(false), taskList = ref([]), search = ref(''), currentPage = ref(1), pageSize = ref(10), total = ref(0)
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTaskList(currentPage.value, pageSize.value, search.value)
    if (res.code === 200) { taskList.value = res.data.records || []; total.value = res.data.total || 0 }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleView = (row) => console.log('查看', row), handleExport = async (row) => {
  try {
    const res = await exportTask(row.id, row.title)
    const url = window.URL.createObjectURL(new Blob([res]))
    const a = document.createElement('a'); a.href = url; a.download = `${row.title || 'task'}.xlsx`; a.click()
    window.URL.revokeObjectURL(url); ElMessage.success('导出成功')
  } catch (e) { ElMessage.error('导出失败') }
}, handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  await deleteTask(row.id); ElMessage.success('删除成功'); loadData()
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