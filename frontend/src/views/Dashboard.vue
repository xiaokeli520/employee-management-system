<template>
  <div class="dashboard">
    <h2>欢迎使用企业管理系统</h2>
    <p>当前角色：{{ roleName }}</p>
    <p>可用功能：{{ allowedMenus }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const roleName = computed(() => {
  const role = userStore.user?.role
  if (role === 'admin') return '管理员（全部权限）'
  if (role === 'hr') return '人事（仅人员管理）'
  if (role === 'sale') return '销售（仅订单管理）'
  return ''
})

const allowedMenus = computed(() => {
  const role = userStore.user?.role
  if (role === 'admin') return '人员管理、订单管理、岗位管理'
  if (role === 'hr') return '人员管理'
  if (role === 'sale') return '订单管理'
  return ''
})
</script>

<style scoped>
.dashboard {
  background: white;
  padding: 30px;
  border-radius: 8px;
}
</style>