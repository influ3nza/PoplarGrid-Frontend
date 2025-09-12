<template>
  <div class="flex items-center justify-center p-6 bg-gray-100 min-h-screen">
    <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center text-gray-800">创建新项目</h2>

      <form @submit.prevent="createProject" class="space-y-4">
        <div>
          <label for="author-name" class="block text-base font-bold text-gray-700">作者名称</label>
          <input
            type="text"
            id="author-name"
            v-model="authorName"
            required
            placeholder="请输入作者名称"
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
          />
        </div>

        <div>
          <label for="title" class="block text-base font-bold text-gray-700">项目标题</label>
          <input
            type="text"
            id="title"
            placeholder="无须输入序号，其会由服务器自动生成"
            v-model="projectInfo.title"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
          />
          <div
            v-if="finalTitlePreview"
            class="mt-2 text-sm text-green-800 bg-green-100 px-3 py-1 rounded-full w-fit max-w-full truncate shadow"
          >
            最终标题预览：{{ finalTitlePreview }}
          </div>
        </div>

        <div>
          <label for="description" class="block text-base font-bold text-gray-700">项目描述</label>
          <textarea
            id="description"
            placeholder="项目描述不超过 4 行"
            v-model="projectInfo.description"
            rows="4"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
          ></textarea>
        </div>

        <div>
          <h3 class="text-base font-bold text-gray-700 mb-2">可选项</h3>
          <div class="flex gap-2">
            <button
              type="button"
              @click="projectInfo.allowAutoJoin = !projectInfo.allowAutoJoin"
              :class="{
                'bg-green-100 border-green-400': projectInfo.allowAutoJoin,
                'bg-white border-gray-300 hover:bg-gray-50 shadow-lg': !projectInfo.allowAutoJoin,
              }"
              class="flex-1 items-center px-4 py-2 text-sm text-gray-900 border rounded-md shadow-sm transition-colors duration-200 hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-blue-300"
            >
              允许自动加入
            </button>
            <button
              type="button"
              @click="projectInfo.isHidden = !projectInfo.isHidden"
              :class="{
                'bg-green-100 border-green-400': projectInfo.isHidden,
                'bg-white border-gray-300 hover:bg-gray-50': !projectInfo.isHidden,
              }"
              class="flex-1 items-center px-4 py-2 text-sm text-gray-900 border rounded-md shadow-sm transition-colors duration-200 hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-blue-300"
            >
              设为隐藏
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 text-lg font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ loading ? '正在创建...' : '确认创建' }}
          </button>
        </div>
      </form>

      <div v-if="message" :class="messageClass" class="p-3 text-center rounded-md">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

// FIXME: 假设的后端API地址
const baseURL = 'https://api.your-backend.com/v1'

const authorName = ref('')

const projectInfo = ref({
  title: '',
  description: '',
  allowAutoJoin: false,
  isHidden: false,
  applicantMemberId: 0,
  worksetId: 0,
})

const loading = ref(false)
const message = ref('')

const messageClass = computed(() => {
  return message.value.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
})

// finalTitlePreview 用于实时预览最终标题
const finalTitlePreview = computed(() => {
  if (!authorName.value || !projectInfo.value.title) {
    return ''
  }
  return `[${authorName.value}]${projectInfo.value.title}`
})

async function createProject() {
  loading.value = true
  message.value = ''

  // 组合作者名称和项目标题
  const finalTitle = `[${authorName.value}]${projectInfo.value.title}`

  const requestBody = {
    title: finalTitle,
    description: projectInfo.value.description,
    allow_auto_join: projectInfo.value.allowAutoJoin,
    is_hidden: projectInfo.value.isHidden,
    applicant_member_id: projectInfo.value.applicantMemberId,
    workset_id: projectInfo.value.worksetId,
  }

  try {
    const response = await axios.post(`${baseURL}/projects`, requestBody)

    if (response.data && response.data.error_code === 0) {
      message.value = '项目创建成功！'
      // TODO: 清空 project 并关闭自身
    } else {
      // 处理4xx响应体，业务逻辑失败
      message.value = response.data.message || '项目创建失败，请重试'
      // TODO: 显式错误信息
    }
  } catch (error) {
    // 处理5xx或其他网络错误
    console.error('API请求出错:', error)
    message.value = '网络错误或服务器异常，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>
