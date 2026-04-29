<template>
  <div class="config-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">版本管理</span>
        <span class="page-desc">管理小程序版本号和更新公告</span>
      </div>
    </div>

    <div class="config-card">
      <div class="config-section">
        <div class="section-title">版本号</div>
        <div class="section-row">
          <el-input
            v-model="form.version"
            placeholder="请输入版本号，如 1.2.0"
            style="width: 240px"
            :disabled="loading"
          >
            <template #prefix>
              <span class="version-prefix">v</span>
            </template>
          </el-input>
        </div>
      </div>

      <div class="config-section">
        <div class="section-title">更新公告</div>
        <div class="section-row">
          <el-input
            v-model="form.updateContent"
            type="textarea"
            :rows="5"
            placeholder="请输入更新公告内容，每条更新一行，如：&#10;1. 新增数据导出功能&#10;2. 修复已知问题&#10;3. 优化用户体验"
            style="width: 100%"
          />
        </div>
      </div>

      <div class="config-section">
        <div class="section-title">更新公告插图</div>
        <div class="section-row">
          <div class="upload-wrapper">
            <div class="upload-area" @click="triggerUpload" v-if="!form.updateImage">
              <el-icon :size="28"><Plus /></el-icon>
              <span>上传插图</span>
            </div>
            <div class="image-preview-large" v-else>
              <img :src="form.updateImage" />
              <div class="mask" @click="removeImage">
                <el-icon :size="20"><Close /></el-icon>
              </div>
            </div>
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none" />
          </div>
        </div>
      </div>

      <div class="config-actions">
        <el-button type="primary" @click="handleSave" :loading="saving" size="large">
          保存
        </el-button>
      </div>
    </div>

    <div class="preview-card" v-if="form.updateContent || form.updateImage">
      <div class="preview-title">弹窗预览</div>
      <div class="preview-dialog">
        <div class="preview-header">
          <span class="preview-badge">v{{ form.version || '1.0.0' }}</span>
          <span class="preview-label">发现新版本</span>
        </div>
        <img v-if="form.updateImage" :src="form.updateImage" class="preview-image" />
        <div class="preview-content" v-if="form.updateContent">
          <div v-for="(line, i) in form.updateContent.split('\n').filter(l => l.trim())" :key="i" class="preview-line">
            {{ line }}
          </div>
        </div>
        <div class="preview-footer">
          <div class="preview-btn">知道了</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { getVersion, updateVersion, uploadImage } from '../../api'

const loading = ref(false)
const saving = ref(false)
const fileInput = ref(null)
let tempFile = null

const form = ref({
  version: '',
  updateContent: '',
  updateImage: ''
})

const loadVersion = async () => {
  loading.value = true
  try {
    const res = await getVersion()
    if (res.code === 200) {
      form.value.version = res.data.version || '1.0.0'
      form.value.updateContent = res.data.updateContent || ''
      form.value.updateImage = res.data.updateImage || ''
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const triggerUpload = () => fileInput.value?.click()

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    const res = await uploadImage(file)
    if (res.code === 200) {
      form.value.updateImage = res.data.url
      tempFile = null
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (e) {
    ElMessage.error('图片上传失败')
  }
  if (fileInput.value) fileInput.value.value = ''
}

const removeImage = () => {
  form.value.updateImage = ''
  tempFile = null
  if (fileInput.value) fileInput.value.value = ''
}

const handleSave = async () => {
  const v = form.value.version.trim()
  if (!v) { ElMessage.warning('版本号不能为空'); return }
  if (!/^\d+\.\d+\.\d+$/.test(v)) { ElMessage.warning('版本号格式不正确，应为 x.y.z'); return }
  saving.value = true
  try {
    await updateVersion({
      version: v,
      updateContent: form.value.updateContent,
      updateImage: form.value.updateImage
    })
    ElMessage.success('保存成功')
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

onMounted(() => loadVersion())
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.page-desc { color: #9ca3af; font-size: 13px; }
.config-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; }
.config-section { margin-bottom: 28px; }
.config-section:last-of-type { margin-bottom: 0; }
.section-title { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
.section-row { display: flex; align-items: flex-start; }
.version-prefix { color: #9ca3af; font-weight: 500; }
.config-actions { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f0f0f0; }

.upload-wrapper { display: flex; gap: 12px; }
.upload-area {
  width: 160px; height: 100px; border: 2px dashed #d1d5db; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; color: #9ca3af; font-size: 13px; transition: all 0.2s;
}
.upload-area:hover { border-color: #3b82f6; color: #3b82f6; }
.image-preview-large { position: relative; width: 160px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
.image-preview-large img { width: 100%; height: 100%; object-fit: cover; }
.image-preview-large .mask {
  display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); align-items: center; justify-content: center; color: #fff; cursor: pointer;
}
.image-preview-large:hover .mask { display: flex; }

.preview-card { margin-top: 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px 32px; }
.preview-title { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
.preview-dialog {
  width: 320px; margin: 0 auto; background: #fff; border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); overflow: hidden;
}
.preview-header { padding: 20px 20px 12px; display: flex; align-items: center; gap: 10px; }
.preview-badge {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff;
  font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px;
}
.preview-label { font-size: 16px; font-weight: 600; color: #1f2937; }
.preview-image { width: 100%; max-height: 180px; object-fit: cover; }
.preview-content { padding: 12px 20px; font-size: 13px; color: #6b7280; line-height: 1.8; }
.preview-line { padding: 2px 0; }
.preview-footer { padding: 16px 20px 20px; }
.preview-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff;
  text-align: center; padding: 10px 0; border-radius: 24px; font-size: 14px; font-weight: 500;
}
</style>
