import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'employee',
        name: 'Employee',
        component: () => import('@/views/employee/EmployeeList.vue'),
        meta: { roles: ['admin', 'hr'] }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { roles: ['admin', 'sale'] }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/role/RoleManage.vue'),
        meta: { roles: ['admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录和权限
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.user
  
  // 需要登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }
  
  // 已登录但去登录页，跳转首页
  if (to.path === '/login' && isLoggedIn) {
    next('/')
    return
  }
  
  // 检查角色权限
  if (to.meta.roles && isLoggedIn) {
    const allowedRoles = to.meta.roles as string[]
    const userRole = userStore.user?.role
    if (userRole && !allowedRoles.includes(userRole)) {
      next('/')
      return
    }
  }
  
  next()
})

export default router