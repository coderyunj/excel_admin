<template>
  <div class="dashboard">
    <div class="stat-grid">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index" :style="{ '--accent': stat.color }">
        <div class="stat-icon" :style="{ background: stat.bgColor }">
          <el-icon :size="24" :color="stat.color"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">快捷操作</span>
      </div>
      <div class="quick-actions">
        <div class="action-btn" @click="router.push('/banner')">
          <el-icon :size="28"><Picture /></el-icon>
          <span>轮播图库</span>
        </div>
        <div class="action-btn" @click="router.push('/user')">
          <el-icon :size="28"><User /></el-icon>
          <span>用户中心</span>
        </div>
        <div class="action-btn" @click="router.push('/task')">
          <el-icon :size="28"><Document /></el-icon>
          <span>任务档案</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Clock, Picture } from '@element-plus/icons-vue'
import { getStats } from '../../api'

const router = useRouter()

const stats = ref([
  { label: '用户总数', value: 0, icon: markRaw(User), color: '#3b82f6', bgColor: '#eff6ff' },
  { label: '任务总数', value: 0, icon: markRaw(Document), color: '#10b981', bgColor: '#ecfdf5' },
  { label: '今日任务', value: 0, icon: markRaw(Clock), color: '#f59e0b', bgColor: '#fffbeb' },
  { label: '轮播图数', value: 0, icon: markRaw(Picture), color: '#8b5cf6', bgColor: '#f5f3ff' }
])

const loadStats = async () => {
  try {
    const res = await getStats()
    if (res.code === 200) {
      stats.value[0].value = res.data.totalUsers || 0
      stats.value[1].value = res.data.totalTasks || 0
      stats.value[2].value = res.data.todayTasks || 0
      stats.value[3].value = res.data.totalBanners || 0
    }
  } catch (e) {
    console.error('加载统计失败', e)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>