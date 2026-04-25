<template>
  <div class="user-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">用户中心</span>
        <span class="page-count">共 {{ total }} 位用户</span>
      </div>
      <el-input
        v-model="search"
        placeholder="搜索用户昵称..."
        :prefix-icon="Search"
        clearable
        style="width: 220px"
        @input="loadData"
      />
    </div>

    <div class="table-wrapper">
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80">
          <template #default="{ row }">
            <span class="id-cell">#{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36">{{ row.nickname?.[0] || 'U' }}</el-avatar>
              <span>{{ row.nickname || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="openid" label="OpenID" width="220" :show-overflow-tooltip="true" />
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            <span class="time-cell">{{ formatTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleView(row)">详情</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getUserList, deleteUser } from '../../api'

const loading = ref(false)
const userList = ref([])
const search = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const formatTime = (time) => time ? new Date(time).toLocaleString('zh-CN') : '-'

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserList(currentPage.value, pageSize.value, search.value)
    if (res.code === 200) {
      userList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleView = (row) => console.log('查看用户', row)

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => { loadData() })
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.page-count {
  color: #9ca3af;
  font-size: 13px;
}

.table-wrapper {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.id-cell {
  color: #3b82f6;
  font-weight: 500;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-cell {
  color: #6b7280;
  font-size: 13px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>