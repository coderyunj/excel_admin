<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">◇</span>
        <span class="logo-text">Excel Tool</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        :background-color="themeVars.bgColor"
        :text-color="themeVars.textColor"
        :active-text-color="themeVars.activeColor"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据面板</span>
        </el-menu-item>
        <el-menu-item index="/banner">
          <el-icon><Picture /></el-icon>
          <span>轮播图库</span>
        </el-menu-item>
        <el-menu-item index="/notice">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户中心</span>
        </el-menu-item>
        <el-menu-item index="/task">
          <el-icon><Document /></el-icon>
          <span>任务档案</span>
        </el-menu-item>
        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>版本管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-bottom">
        <div class="version">v1.0.0</div>
      </div>
    </aside>
    <div class="main">
      <header class="header">
        <div class="header-title">
          <span class="page-name">{{ pageTitle }}</span>
        </div>
        <div class="user-info">
          <div class="time-display">{{ currentTime }}</div>
          <el-dropdown @command="handleCommand">
            <div class="user-card">
              <el-avatar :size="32" class="user-avatar">A</el-avatar>
              <span class="username">Admin</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Picture, User, Document, Bell, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const themeVars = {
  bgColor: '#ffffff',
  textColor: '#6b7280',
  activeColor: '#3b82f6',
  cardBg: '#ffffff',
  borderColor: '#e5e7eb'
}

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta?.title || '数据面板')

const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
}

.logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.logo-icon {
  color: #fff;
  font-size: 24px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}

.sidebar .el-menu {
  border-right: none;
  flex: 1;
}

.sidebar .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar .el-menu-item:hover {
  background: #f1f5f9 !important;
  color: #3b82f6 !important;
}

.sidebar .el-menu-item.is-active {
  background: #eff6ff !important;
  color: #3b82f6 !important;
  font-weight: 500;
}

.sidebar .el-menu-item .el-icon {
  margin-right: 8px;
}

.sidebar-bottom {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.version {
  color: #9ca3af;
  font-size: 12px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #f8fafc;
}

.header {
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-title {
  display: flex;
  align-items: center;
}

.page-name {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.time-display {
  color: #9ca3af;
  font-size: 13px;
  margin-right: 20px;
  font-family: 'SF Mono', monospace;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.username {
  color: #4b5563;
  font-size: 13px;
}

.content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}
</style>