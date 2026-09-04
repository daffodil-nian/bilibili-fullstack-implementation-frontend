<template>
  <div class="privacy-panel">
    <h2 class="content-title">隐私设置</h2>
    <p class="privacy-desc">控制别人能否查看你的关注列表、粉丝列表等公开信息</p>

    <div v-if="loading" class="privacy-loading">加载中...</div>
    <div v-else class="privacy-list">
      <div class="privacy-row">
        <div class="privacy-text">
          <div class="privacy-label">公开我的关注列表</div>
          <div class="privacy-hint">关闭后，他人无法查看你关注了谁</div>
        </div>
        <a-switch
          v-model:checked="privacy.showFollowList"
          :loading="saving"
          @change="savePrivacy"
        />
      </div>

      <div class="privacy-row">
        <div class="privacy-text">
          <div class="privacy-label">公开我的粉丝列表</div>
          <div class="privacy-hint">关闭后，他人无法查看你的粉丝</div>
        </div>
        <a-switch
          v-model:checked="privacy.showFansList"
          :loading="saving"
          @change="savePrivacy"
        />
      </div>

      <div class="privacy-row">
        <div class="privacy-text">
          <div class="privacy-label">公开生日与个人标签</div>
          <div class="privacy-hint">关闭后，空间页不展示生日</div>
        </div>
        <a-switch
          v-model:checked="privacy.showBirthdayAndTag"
          :loading="saving"
          @change="savePrivacy"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getMyPrivacy, updatePrivacy, type UserPrivacyVO } from '../../../services/api'

const loading = ref(true)
const saving = ref(false)
const privacy = reactive<UserPrivacyVO>({
  showFollowList: true,
  showFansList: true,
  showBirthdayAndTag: true,
})

onMounted(async () => {
  try {
    const res = await getMyPrivacy()
    Object.assign(privacy, res.data || {})
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function savePrivacy() {
  saving.value = true
  try {
    await updatePrivacy({
      showFollowList: privacy.showFollowList,
      showFansList: privacy.showFansList,
      showBirthdayAndTag: privacy.showBirthdayAndTag,
    })
    message.success('隐私设置已保存')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.privacy-panel {
  padding: 8px 4px;
}

.content-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #18191c;
}

.privacy-desc {
  margin: 0 0 24px;
  font-size: 13px;
  color: #9499a0;
}

.privacy-loading {
  padding: 24px 0;
  color: #9499a0;
}

.privacy-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.privacy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e3e5e7;
}

.privacy-label {
  font-size: 14px;
  color: #18191c;
  font-weight: 500;
}

.privacy-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #9499a0;
}
</style>
