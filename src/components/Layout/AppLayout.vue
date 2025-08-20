<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 header-navigator">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/dashboard" class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                漫画翻译管理平台
              </h1>
            </router-link>
            
            <div class="hidden md:ml-10 md:flex md:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                class="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{ 'text-primary-600 dark:text-primary-400': $route.path === item.href }"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Team Selector -->
            <div class="flex items-center space-x-2">
              <el-select
                v-if="teamsStore.userTeams.length > 0"
                :model-value="teamsStore.currentTeam?.id"
                @change="handleTeamChange"
                placeholder="选择团队"
                size="small"
                class="w-32"
              >
                <el-option
                  v-for="team in teamsStore.userTeams"
                  :key="team.id"
                  :label="team.name"
                  :value="team.id"
                >
                  <div class="flex items-center space-x-2">
                    <el-avatar :size="20" :src="team.avatar">
                      {{ team.name.charAt(0) }}
                    </el-avatar>
                    <span>{{ team.name }}</span>
                  </div>
                </el-option>
              </el-select>

              <!-- Project Set Selector -->
              <el-select
                v-if="teamsStore.currentTeamProjectSets.length > 0"
                :model-value="teamsStore.currentProjectSet?.id || ''"
                @change="handleProjectSetChange"
                placeholder="全部项目"
                size="small"
                class="w-32"
                clearable
              >
                <el-option label="全部项目" value="" />
                <el-option
                  v-for="projectSet in teamsStore.currentTeamProjectSets"
                  :key="projectSet.id"
                  :label="projectSet.name"
                  :value="projectSet.id"
                />
              </el-select>
            </div>

            <!-- Theme Toggle Button -->
            <el-button
              @click="themeStore.toggleTheme()"
              :icon="themeStore.isDark ? Sunny : Moon"
              circle
              size="small"
              class="!border-gray-300 dark:!border-gray-600"
            />
            
            <el-dropdown @command="handleCommand">
              <span class="flex items-center cursor-pointer">
                <el-avatar :size="32" :src="authStore.user?.avatar">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ authStore.user?.name }}
                </span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="teams">团队管理</el-dropdown-item>
                  <el-dropdown-item v-if="authStore.isAdmin" command="admin">系统管理</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </nav>

    <main class="min-w-[320px]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useTeamsStore } from '@/stores/teams'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const teamsStore = useTeamsStore()

const navigation = computed(() => [
  { name: '仪表板', href: '/dashboard' },
  { name: '项目管理', href: '/projects' },
  { name: '所有项目', href: '/project-management' },
  { name: '统计分析', href: '/statistics' },
])

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'teams':
      router.push('/teams')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

const handleTeamChange = (teamId: string) => {
  teamsStore.switchTeam(teamId)
}

const handleProjectSetChange = (projectSetId: string) => {
  teamsStore.switchProjectSet(projectSetId || null)
}

onMounted(() => {
  // 初始化团队数据
  teamsStore.fetchUserTeams()
})
</script>