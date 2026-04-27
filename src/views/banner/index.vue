<template>
  <div class="banner-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">轮播图库</span>
        <span class="page-count">共 {{ total }} 条记录</span>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        <span>添加轮播图</span>
      </el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="bannerList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80">
          <template #default="{ row }">
            <span class="id-cell">#{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预览" width="140">
          <template #default="{ row }">
            <div class="image-preview">
              <img :src="row.imageUrl" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="linkUrl" label="跳转链接" :show-overflow-tooltip="true" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑轮播图' : '添加轮播图'" width="550px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片">
          <div class="upload-wrapper">
            <div class="upload-area" @click="triggerUpload" v-if="!form.imageUrl">
              <el-icon :size="32"><Plus /></el-icon>
              <span>上传图片</span>
            </div>
            <div class="image-preview-large" v-else>
              <img :src="form.imageUrl" />
              <div class="mask" @click="removeImage">
                <el-icon :size="20"><Close /></el-icon>
              </div>
            </div>
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none" />
          </div>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="关联公告">
          <el-select v-model="form.noticeId" placeholder="不关联公告" clearable style="width: 100%">
            <el-option v-for="n in noticeList" :key="n.id" :label="n.title" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
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

    <el-dialog v-model="cropperVisible" title="裁剪图片" width="750px" destroy-on-close @close="handleCropCancel">
      <div class="cropper-container">
        <img ref="cropperImg" class="cropper-image" />
      </div>
      <template #footer>
        <el-button @click="handleCropCancel">取消</el-button>
        <el-button type="primary" @click="handleCropConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { getBannerList, createBanner, updateBanner, deleteBanner, uploadImage, getNoticeList } from '../../api'
import Cropper from 'cropperjs'

const loading = ref(false)
const submitting = ref(false)
const bannerList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const fileInput = ref(null)
const noticeList = ref([])

const cropperVisible = ref(false)
const cropperImg = ref(null)
const pendingFile = ref(null)
let cropperInstance = null

const form = ref({
  id: null,
  title: '',
  imageUrl: '',
  linkUrl: '',
  noticeId: null,
  sortOrder: 0,
  status: 1
})

let tempFile = null

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBannerList(currentPage.value, pageSize.value)
    if (res.code === 200) {
      bannerList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, title: '', imageUrl: '', linkUrl: '', noticeId: null, sortOrder: 0, status: 1 }
  tempFile = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  tempFile = null
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', { type: 'warning' })
  await deleteBanner(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const triggerUpload = () => fileInput.value?.click()

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    pendingFile.value = file
    cropperVisible.value = true
    setTimeout(initCropper, 100)
  }
}

const initCropper = () => {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  const image = cropperImg.value
  if (image) {
    const url = URL.createObjectURL(pendingFile.value)
    image.src = url
    cropperInstance = new Cropper(image, {
      aspectRatio: 5 / 2,
      viewMode: 1,
      autoCrop: true,
      autoCropArea: 0.9,
      cropBoxResizable: true,
      minCropBoxWidth: 200,
      minCropBoxHeight: 80,
    })
  }
}

const handleCropConfirm = () => {
  if (!cropperInstance) return
  const canvas = cropperInstance.getCroppedCanvas({
    width: 750,
    height: 300,
  })
  if (!canvas) {
    ElMessage.error('裁剪失败')
    return
  }
  canvas.toBlob((blob) => {
    const file = new File([blob], pendingFile.value.name, { type: 'image/jpeg' })
    tempFile = file
    form.value.imageUrl = URL.createObjectURL(blob)
    cropperVisible.value = false
    if (cropperInstance) {
      cropperInstance.destroy()
      cropperInstance = null
    }
    if (fileInput.value) fileInput.value.value = ''
  }, 'image/jpeg', 0.9)
}

const handleCropCancel = () => {
  cropperVisible.value = false
  pendingFile.value = null
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  if (fileInput.value) fileInput.value.value = ''
}

const removeImage = () => {
  tempFile = null
  form.value.imageUrl = ''
  if (fileInput.value) fileInput.value.value = ''
}

const handleSubmit = async () => {
  if (!form.value.title) { ElMessage.warning('请输入标题'); return }
  if (!form.value.imageUrl && !tempFile) { ElMessage.warning('请上传图片'); return }

  submitting.value = true
  try {
    let imageUrl = form.value.imageUrl
    if (tempFile) {
      const res = await uploadImage(tempFile)
      if (res.code === 200) imageUrl = res.data.url
      else { ElMessage.error('图片上传失败'); return }
    }
    const submitData = { ...form.value, imageUrl }
    if (isEdit.value) await updateBanner(form.value.id, submitData)
    else await createBanner(submitData)
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

onMounted(() => { loadData(); loadNotices() })

const loadNotices = async () => {
  try {
    const res = await getNoticeList(1, 100)
    if (res.code === 200) noticeList.value = res.data.records || []
  } catch (e) { console.error(e) }
}

onBeforeUnmount(() => {
  if (cropperInstance) {
    cropperInstance.destroy()
  }
})
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

.image-preview {
  width: 80px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-wrapper {
  display: flex;
  gap: 12px;
}

.upload-area {
  width: 100px;
  height: 70px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #9ca3af;
  font-size: 12px;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.image-preview-large {
  position: relative;
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-large .mask {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

.image-preview-large:hover .mask {
  display: flex;
}

.cropper-container {
  width: 100%;
  height: 400px;
  background: #fff;
}

.cropper-image {
  max-width: 100%;
  max-height: 400px;
  display: block;
}

:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 0;
}
</style>