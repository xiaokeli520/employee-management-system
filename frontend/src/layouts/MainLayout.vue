<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="aside">
      <div class="logo">🏢 企业系统</div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item v-for="menu in visibleMenus" :key="menu.path" :index="menu.path">
          <span>{{ menu.icon }} {{ menu.label }}</span>
        </el-menu-item>
      </el-menu>
      <div class="user-info">
  <div class="user-avatar">👤</div>
  <div class="user-name">{{ userStore.user?.name }}</div>
  <div class="user-role" :class="userStore.user?.role">
    {{ userStore.user?.roleName }}
  </div>
  <el-button size="small" @click="handleLogout">退出</el-button>
</div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header class="header">
        <h2>{{ currentTitle }}</h2>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 菜单配置
const allMenus = [
  { path: '/employee', label: '人员管理', icon: '👥', permission: 'employee:view' },
  { path: '/order', label: '订单管理', icon: '📦', permission: 'order:view' },
  { path: '/role', label: '岗位管理', icon: '⚙️', permission: 'role:manage' },  // 只有管理员有 role:manage 权限
]

// 根据权限显示菜单
const visibleMenus = computed(() => {
  const userRole = userStore.user?.role
  if (!userRole) return []
  // 管理员看到所有菜单
  if (userRole === 'admin') return allMenus
  // 其他用户根据权限显示
  return allMenus.filter(menu => userStore.hasPermission(menu.permission))
})

// 当前页面标题
const currentTitle = computed(() => {
  const menu = allMenus.find(m => m.path === route.path)
  return menu?.label || '工作台'
})

// 角色标签
const roleLabel = computed(() => {
  const role = userStore.user?.role
  if (role === 'admin') return '管理员'
  if (role === 'hr') return '人事'
  if (role === 'sale') return '销售'
  return ''
})

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.user-avatar {
  font-size: 32px;
  margin-bottom: 8px;
}
.user-name {
  font-weight: bold;
  margin-bottom: 4px;
}
.user-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin: 8px 0;
}
.user-role.admin { background: #409eff; }
.user-role.hr { background: #67c23a; }
.user-role.sale { background: #e6a23c; }
.user-role.employee { background: #909399; }

.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #4a5a6e;
}
.el-menu {
  border-right: none;
  background-color: #304156;
  flex: 1;
}
.el-menu-item {
  color: #bfcbd9;
}
.el-menu-item:hover {
  background-color: #263445;
}
.el-menu-item.is-active {
  color: #409eff;
  background-color: #263445;
}
.user-info {
  padding: 20px;
  border-top: 1px solid #4a5a6e;
  font-size: 14px;
  color: #bfcbd9;
  text-align: center;
}
.role-badge {
  background: #409eff;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin: 8px 0;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.main {
  background: #f0f2f5;
  padding: 20px;
}
</style>