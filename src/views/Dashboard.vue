<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        欢迎回来，{{ authStore.user_detail?.nickname }}！
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        这里是您的项目概览和最新动态
      </p>
    </div>

    <!-- 用户邀请通知 -->
    <!-- <UserInvitations /> -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useStatisticsStore } from '@/stores/statistics'
import ProjectCard from '@/components/ProjectCard.vue'
import UserInvitations from '@/components/UserInvitations.vue'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const statisticsStore = useStatisticsStore()

const timeStats = computed(() => statisticsStore.timeBasedStats)

const yesterdayGrowth = computed(() => {
  if (!timeStats.value?.yesterday) return { icon: '', text: '' }
  return statisticsStore.getGrowthIndicator(timeStats.value.yesterday.comparison)
})

const lastWeekGrowth = computed(() => {
  if (!timeStats.value?.lastWeek) return { icon: '', text: '' }
  return statisticsStore.getGrowthIndicator(timeStats.value.lastWeek.comparison)
})

const lastMonthGrowth = computed(() => {
  if (!timeStats.value?.lastMonth) return { icon: '', text: '' }
  return statisticsStore.getGrowthIndicator(timeStats.value.lastMonth.comparison)
})

const recentProjects = computed(() => 
  projectsStore.projects.slice(0, 4)
)

const averageProgress = computed(() => {
  if (projectsStore.projects.length === 0) return 0
  
  const totalProgress = projectsStore.projects.reduce((sum, project) => {
    return sum + (project.progress.translation + project.progress.proofreading) / 2
  }, 0)
  
  return Math.round(totalProgress / projectsStore.projects.length)
})

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProjects(),
    statisticsStore.fetchTimeBasedStatistics()
  ])
})
</script>