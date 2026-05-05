<template>
  <div class="redeem-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">兑换码管理</span>
        <span class="page-count">共 {{ total }} 条</span>
      </div>
      <div class="header-right">
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px; margin-right: 12px" @change="handleFilter">
          <el-option label="可用" value="available" />
          <el-option label="已用完" value="used" />
        </el-select>
        <el-button type="primary" @click="handleGenerate">
          <el-icon><Plus /></el-icon>
          <span>生成兑换码</span>
        </el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="redeemList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80">
          <template #default="{ row }">
            <span class="id-cell">#{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="兑换码" width="180">
          <template #default="{ row }">
            <span class="code-cell">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="可兑次数" width="100" />
        <el-table-column prop="remain" label="剩余次数" width="100">
          <template #default="{ row }">
            <el-tag :type="row.remain > 0 ? 'warning' : 'info'" size="small">
              {{ row.remain }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="used" label="已使用" width="80" />
        <el-table-column prop="remain" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.remain > 0 ? 'warning' : 'success'" size="small">
              {{ row.remain > 0 ? '可用' : '已用完' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usedDeviceId" label="使用设备" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="time-cell">{{ row.usedDeviceId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="usedAt" label="使用时间" width="180">
          <template #default="{ row }">
            <span class="time-cell">{{ formatTime(row.usedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-cell">{{ formatTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" text @click="handleDelete(row)" :disabled="row.remain > 0">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="生成兑换码" width="480px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="生成数量">
          <el-input-number v-model="form.count" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="每次获得次数">
          <el-input-number v-model="form.amount" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="可兑换次数">
          <el-input-number v-model="form.remain" :min="1" :max="10000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRedeemList, generateRedeem, deleteRedeem } from '../../api'

const loading = ref(false)
const submitting = ref(false)
const redeemList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filterStatus = ref('')
const dialogVisible = ref(false)

const form = ref({
  count: 10,
  amount: 5,
  remain: 1
})

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

const loadData = async () => {
  loading.value = true
  try {
    let used = undefined
    if (filterStatus.value === 'available') used = 0
    else if (filterStatus.value === 'used') used = 1
    const res = await getRedeemList(currentPage.value, pageSize.value, used)
    if (res.code === 200) {
      redeemList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleFilter = () => {
  currentPage.value = 1
  loadData()
}

const handleGenerate = () => {
  form.value = { count: 10, amount: 5, remain: 1 }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该兑换码吗？', '提示', { type: 'warning' })
  await deleteRedeem(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = async () => {
  if (!form.value.count || !form.value.amount || !form.value.remain) {
    ElMessage.warning('请填写完整')
    return
  }
  submitting.value = true
  try {
    const res = await generateRedeem(form.value.count, form.value.amount, form.value.remain)
    if (res.code === 200) {
      ElMessage.success(`成功生成 ${form.value.count} 个兑换码`)
      dialogVisible.value = false
      loadData()
    }
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-right { display: flex; align-items: center; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.page-count { color: #9ca3af; font-size: 13px; }
.table-wrapper { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.id-cell { color: #3b82f6; font-weight: 500; }
.code-cell { font-family: 'SF Mono', 'Consolas', monospace; font-weight: 500; letter-spacing: 0.5px; }
.time-cell { color: #6b7280; font-size: 13px; }
.pagination-wrapper { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
