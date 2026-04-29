import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '控制台' }
      },
      {
        path: '/banner',
        name: 'Banner',
        component: () => import('../views/banner/index.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: '/notice',
        name: 'Notice',
        component: () => import('../views/notice/index.vue'),
        meta: { title: '公告管理' }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('../views/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: '/task',
        name: 'Task',
        component: () => import('../views/task/index.vue'),
        meta: { title: '任务管理' }
      },
      {
        path: '/config',
        name: 'Config',
        component: () => import('../views/config/index.vue'),
        meta: { title: '版本管理' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/login') {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  next()
})

export default router