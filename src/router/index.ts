import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true, hideNav: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true, hideNav: false }
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('@/views/Projects.vue'),
      meta: { requiresAuth: true, hideNav: true }
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetail',
      component: () => import('@/views/ProjectDetail.vue'),
      meta: { requiresAuth: true, hideNav: true }
    },
    {
      path: '/translator/:projectId/:fileId',
      name: 'Translator',
      component: () => import('@/views/Translator.vue'),
      meta: { requiresAuth: true, hideNav: true }
    },
    {
      path: '/project-management',
      name: 'ProjectManagement',
      component: () => import('@/views/ProjectManagement.vue'),
      meta: { requiresAuth: true, hideNav: false }
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('@/views/Statistics.vue'),
      meta: { requiresAuth: true, hideNav: false }
    },
    {
      path: '/teams',
      name: 'Teams',
      component: () => import('@/views/Teams.vue'),
      meta: { requiresAuth: true, hideNav: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, hideNav: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true, hideNav: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router