<template>
  <div class="avatar-panel">
    <nav class="avatar-breadcrumb" aria-label="面包屑导航">
      <span class="breadcrumb-item">我的头像</span>
      <span class="breadcrumb-sep">&gt;</span>
      <span class="breadcrumb-item is-current">更换头像</span>
    </nav>

    <div class="avatar-board">
      <div class="avatar-board-inner">
        <div class="avatar-upload-col">
          <button type="button" class="upload-card" @click="triggerFileInput">
            <span class="upload-icon upload-icon-image" aria-hidden="true">
              <span class="icon-plus">+</span>
            </span>
            <span class="upload-text">选择本地图片</span>
          </button>

          <button type="button" class="upload-card" @click="onDigitalAvatar">
            <span class="upload-icon upload-icon-diamond" aria-hidden="true">
              <span class="icon-plus">+</span>
            </span>
            <span class="upload-text">选择数字艺术头像</span>
          </button>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            class="file-input"
            @change="onFileChange"
          />
        </div>

        <div class="avatar-divider" role="separator" />

        <div class="avatar-preview-col">
          <div class="avatar-preview-circle">
            <img :src="previewUrl" alt="头像预览" />
          </div>
          <p class="avatar-preview-label">当前头像</p>
        </div>
      </div>
    </div>

    <p class="avatar-tip">
      请选择图片上传：大小180 * 180像素支持JPG、PNG等格式，图片需小于2M
    </p>

    <div class="avatar-footer">
      <button
        type="button"
        class="avatar-update-btn"
        :class="{ 'is-active': canUpdate }"
        :disabled="!canUpdate || saving"
        @click="handleUpdate"
      >
        {{ saving ? '更新中...' : '更新' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import defaultAvatar from '../../../assets/avatar/default.png'
import {  uploadAvatarFile } from '../../../services/api'
import { getUserInfo, updateUserField } from '../../../services/userStorage'

const MAX_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const fileInputRef = ref<HTMLInputElement | null>(null)
const currentAvatar = ref('')
const selectedFile = ref<File | null>(null)
const previewObjectUrl = ref('')
const saving = ref(false)

const previewUrl = computed(
  () => previewObjectUrl.value || currentAvatar.value || defaultAvatar,
)

const canUpdate = computed(() => !!selectedFile.value)

onMounted(() => {
  const user = getUserInfo()
  currentAvatar.value = user?.avatar || ''
})

onBeforeUnmount(() => {
  revokePreviewUrl()
})

const revokePreviewUrl = () => {
  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value)
    previewObjectUrl.value = ''
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onDigitalAvatar = () => {
  message.info('数字艺术头像功能开发中，敬请期待')
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!ALLOWED_TYPES.includes(file.type)) {
    message.warning('仅支持 JPG、PNG 格式图片')
    input.value = ''
    return
  }

  if (file.size > MAX_SIZE) {
    message.warning('图片需小于 2M')
    input.value = ''
    return
  }

  const objectUrl = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    // if (img.width !== 180 || img.height !== 180) {
    //   message.warning('建议上传 180 × 180 像素的图片')
    // }
    revokePreviewUrl()
    previewObjectUrl.value = objectUrl
    selectedFile.value = file
  }
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    message.error('图片读取失败，请重试')
  }
  img.src = objectUrl
  input.value = ''
}

const pickAvatarUrl = (data: unknown) => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.url === 'string') return record.url
    if (typeof record.avatar === 'string') return record.avatar
  }
  return ''
}

const handleUpdate = async () => {
  if (!selectedFile.value || saving.value) return

  const user = getUserInfo()
  if (!user) {
    message.warning('请先登录')
    return
  }

  saving.value = true
  try {
    const uploadRes = await uploadAvatarFile(selectedFile.value)
    const avatarUrl = pickAvatarUrl(uploadRes.data)

    if (!avatarUrl) {
      message.error('上传成功，但未返回头像地址')
      return
    }

    await changeAvatar({ avatar: avatarUrl })
    currentAvatar.value = avatarUrl
    updateUserField('avatar', avatarUrl)
    selectedFile.value = null
    revokePreviewUrl()
    message.success('头像更新成功')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
$bili-blue: #00a1d6;
$bili-blue-hover: #00b5e5;
$border: #e5e9ef;
$text-hint: #99a2aa;
$card-bg: #f6f7f8;

.avatar-panel {
  width: 100%;
}

.avatar-breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: $text-hint;
  line-height: 1;

  .breadcrumb-sep {
    margin: 0 6px;
    color: #ccd0d7;
  }

  .is-current {
    color: #6d757a;
  }
}

.avatar-board {
  border: 1px solid $border;
  border-radius: 4px;
  background: #fff;
}

.avatar-board-inner {
  display: flex;
  align-items: stretch;
  min-height: 280px;
}

.avatar-upload-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 36px 24px;
  position: relative;
}

.file-input {
  display: none;
}

.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 200px;
  height: 110px;
  border: none;
  border-radius: 4px;
  background: $card-bg;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #eef0f3;
  }
}

.upload-icon {
  position: relative;
  width: 44px;
  height: 44px;
  color: #b8c0cc;

  .icon-plus {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #ccd0d7;
    font-size: 12px;
    line-height: 14px;
    text-align: center;
    color: #99a2aa;
    font-weight: 300;
  }
}

.upload-icon-image {
  border: 2px solid #c5cdd8;
  border-radius: 4px;
  background:
    linear-gradient(#c5cdd8, #c5cdd8) 10px 14px / 24px 2px no-repeat,
    linear-gradient(#c5cdd8, #c5cdd8) 10px 20px / 18px 2px no-repeat,
    linear-gradient(#c5cdd8, #c5cdd8) 10px 26px / 14px 2px no-repeat;
}

.upload-icon-diamond {
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 28px;
    height: 28px;
    transform: translate(-50%, -50%) rotate(45deg);
    border: 2px solid #c5cdd8;
    border-radius: 2px;
    box-sizing: border-box;
  }
}

.upload-text {
  font-size: 14px;
  color: #6d757a;
  line-height: 1;
}

.avatar-divider {
  width: 1px;
  background: $border;
  flex-shrink: 0;
}

.avatar-preview-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
}

.avatar-preview-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid $border;
  background: #fff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.avatar-preview-label {
  margin: 14px 0 0;
  font-size: 14px;
  color: $text-hint;
  line-height: 1;
}

.avatar-tip {
  margin: 20px 0 0;
  text-align: center;
  font-size: 12px;
  color: $text-hint;
  line-height: 1.6;
}

.avatar-footer {
  margin-top: 28px;
  text-align: center;
}

.avatar-update-btn {
  min-width: 120px;
  height: 38px;
  padding: 0 32px;
  border: none;
  border-radius: 4px;
  background: #e5e9ef;
  color: #fff;
  font-size: 14px;
  cursor: not-allowed;
  transition: background 0.15s;

  &.is-active {
    background: $bili-blue;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $bili-blue-hover;
    }
  }

  &:disabled {
    opacity: 0.85;
  }
}

@media (max-width: 720px) {
  .avatar-board-inner {
    flex-direction: column;
    min-height: auto;
  }

  .avatar-divider {
    width: auto;
    height: 1px;
  }

  .avatar-upload-col,
  .avatar-preview-col {
    padding: 24px 16px;
  }
}
</style>
