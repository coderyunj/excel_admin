<template>
  <div class="login-page">
    <div class="login-box">
      <div class="logo">
        <div class="logo-icon">◇</div>
        <div class="logo-text">Excel Tool</div>
        <div class="sub">管理后台</div>
      </div>
      
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="请输入用户名" size="large">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" @keyup.enter="handleLogin">
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from '../../api'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) { ElMessage.warning('请输入用户名和密码'); return }
  loading.value = true
  try {
    const res = await request.post('/admin/auth/login', form.value)
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      ElMessage.success('登录成功')
      router.push('/')
    } else { ElMessage.error(res.message || '登录失败') }
  } catch (e) { ElMessage.error('登录失败') }
  finally { loading.value = false }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.login-box {
  width: 400px;
  padding: 48px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.logo {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  font-size: 28px;
  color: #fff;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.sub {
  color: #9ca3af;
  font-size: 13px;
  margin-top: 4px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}
</style>