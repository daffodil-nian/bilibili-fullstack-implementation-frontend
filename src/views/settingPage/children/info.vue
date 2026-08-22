<template>
  <div class="info-panel">
    <h2 class="content-title">我的信息</h2>

    <div class="info-form">
      <div class="info-row">
        <label class="info-label">昵称</label>
        <div class="info-field info-field-inline">
          <input
            v-model="form.nickname"
            class="info-input"
            type="text"
            maxlength="16"
          />
          <span class="info-hint">注：修改一次昵称需要消耗6个硬币</span>
        </div>
      </div>

      <div class="info-row">
        <label class="info-label">用户名</label>
        <div class="info-field">
          <span class="info-text">{{ form.username }}</span>
        </div>
      </div>

      <div class="info-row">
        <label class="info-label">我的签名</label>
        <div class="info-field">
          <textarea
            v-model="form.signature"
            class="info-textarea"
            maxlength="70"
            placeholder="设置签名，让大家认识你"
          />
        </div>
      </div>

      <div class="info-row">
        <label class="info-label">性别</label>
        <div class="info-field">
          <div class="gender-group">
            <button
              v-for="opt in genderOptions"
              :key="opt.value"
              type="button"
              class="gender-btn"
              :class="{ 'is-active': form.sex === opt.value }"
              @click="form.sex = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="info-row">
        <label class="info-label">出生日期</label>
        <div class="info-field">
          <div class="info-date-wrap">
            <span class="info-date-icon" aria-hidden="true" />
            <input v-model="form.birthday" class="info-date" type="date" />
          </div>
        </div>
      </div>

      <div class="info-row">
        <label class="info-label">学校信息</label>
        <div class="info-field">
          <span class="info-hint-block">
            *学校信息当前仅支持在App中进行编辑（需升级至6.34及以上版本）
          </span>
        </div>
      </div>

      <div class="info-footer">
        <button
          type="button"
          class="save-btn"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getUserInfo, updateUserField } from '../../../services/userStorage'
import { changeSignature ,changeBirthday,changeNickname,changeSex} from '../../../services/api'

/** B 站习惯：0 保密 / 1 男 / 2 女 */
const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '保密', value: 0 },
]

const saving = ref(false)

const form = reactive({
  nickname: '',
  username: '',
  signature: '',
  sex: 0,
  birthday: '2000-01-01',
})

onMounted(() => {
  const user = getUserInfo()
  if (!user) return

  form.nickname = user.nickname || ''
  form.username = `bili_${user.uid}`
  form.signature = user.signature || ''
  form.sex = typeof user.sex === 'number' ? user.sex : 0
  form.birthday = (user.birthDay || user.birthday || '1980-01-01').slice(0, 10)
})

const handleSave = async () => {
  const user = getUserInfo()
  if (!user) {
    message.warning('请先登录')
    return
  }

  saving.value = true
  try {
    if (form.signature !== (user.signature || '')) {
      await changeSignature({ signature: form.signature })
      updateUserField('signature', form.signature)
    }

    if (form.nickname !== user.nickname) { 
      //调用修改昵称的接口
      await changeNickname({ nickname: form.nickname })
      updateUserField('nickname', form.nickname)
    }
    if (form.sex !== user.sex) {
      //然后写一个修改性别的接口，写完就开发下一个功能
      await changeSex({ sex: form.sex })
      updateUserField('sex', form.sex)
    }
    if(form.birthday!==user.birthDay){
      await changeBirthday({birthday:form.birthday})
 updateUserField('birthDay', form.birthday)
    }
   

    message.success('保存成功')
  } catch (e) {
    console.error(e)
    message.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
