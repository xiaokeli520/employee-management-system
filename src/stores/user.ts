import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户类型定义
interface User {
  id: number
  name: string
  username: string
  role: string
  roleName: string
  permissions: string[]
  position?: string
  department?: string
  phone?: string
}

// 模拟用户数据库
const userDatabase = ref([
  { 
    id: 1, 
    username: 'zhangsan', 
    name: '张三', 
    password: '123', 
    role: 'admin', 
    roleName: '系统管理员',
    position: '前端工程师',
    department: '技术部',
    phone: '13800138001',
    permissions: ['employee:view', 'employee:add', 'employee:edit', 'employee:delete', 'order:view', 'order:add', 'order:edit', 'order:delete', 'role:manage']
  },
  { 
    id: 2, 
    username: 'lisi', 
    name: '李四', 
    password: '123', 
    role: 'hr', 
    roleName: '人事经理',
    position: '产品经理',
    department: '产品部',
    phone: '13800138002',
    permissions: ['employee:view', 'employee:add', 'employee:edit', 'employee:delete']
  },
  { 
    id: 3, 
    username: 'wangwu', 
    name: '王五', 
    password: '123', 
    role: 'sale', 
    roleName: '销售主管',
    position: 'UI设计师',
    department: '设计部',
    phone: '13800138003',
    permissions: ['order:view', 'order:add', 'order:edit', 'order:delete']
  },
  { 
    id: 4, 
    username: 'zhaoliu', 
    name: '赵六', 
    password: '123', 
    role: 'employee', 
    roleName: '普通员工',
    position: '后端工程师',
    department: '技术部',
    phone: '13800138004',
    permissions: ['employee:view']
  },
])

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  // 登录验证
  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const foundUser = userDatabase.value.find(
      u => u.username === username && u.password === password
    )
    
    if (foundUser) {
      user.value = {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        role: foundUser.role,
        roleName: foundUser.roleName,
        permissions: [...foundUser.permissions],
        position: foundUser.position,
        department: foundUser.department,
        phone: foundUser.phone
      }
       console.log('登录用户:', user.value)  // 调试用
      return { success: true }
    }
    
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    user.value = null
  }

  // 检查是否有某个权限
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    if (user.value.role === 'admin') return true
    return user.value.permissions.includes(permission)
  }

  // 检查是否有任一权限
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p))
  }

  // 获取所有用户
  const getAllUsers = () => {
    return userDatabase.value.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      roleName: u.roleName,
      position: u.position || '',
      department: u.department || '',
      phone: u.phone || '',
      permissions: [...u.permissions]
    }))
  }

  // 更新用户权限
  const updateUserPermissions = (userId: number, permissions: string[]) => {
    const dbUser = userDatabase.value.find(u => u.id === userId)
    if (dbUser) {
      dbUser.permissions = [...permissions]
    }
    
    if (user.value && user.value.id === userId) {
      user.value.permissions = [...permissions]
    }
    
    return true
  }

  // 更新用户角色
  const updateUserRole = (userId: number, roleName: string, role: string, permissions: string[]) => {
    const dbUser = userDatabase.value.find(u => u.id === userId)
    if (dbUser) {
      dbUser.roleName = roleName
      dbUser.role = role
      dbUser.permissions = [...permissions]
    }
    
    if (user.value && user.value.id === userId) {
      user.value.roleName = roleName
      user.value.role = role
      user.value.permissions = [...permissions]
    }
    
    return true
  }

  // 更新用户信息
  const updateUser = (userId: number, userData: { name: string; position: string; department: string; phone: string }) => {
    const dbUser = userDatabase.value.find(u => u.id === userId)
    if (dbUser) {
      dbUser.name = userData.name
      dbUser.position = userData.position
      dbUser.department = userData.department
      dbUser.phone = userData.phone
    }
    return true
  }

  // 添加新用户
  const addUser = (userData: any) => {
    const newId = Math.max(...userDatabase.value.map(u => u.id), 0) + 1
    const newUser = {
      id: newId,
      username: `user${newId}`,
      name: userData.name,
      password: '123',
      role: 'employee',
      roleName: '普通员工',
      position: userData.position,
      department: userData.department,
      phone: userData.phone,
      permissions: ['employee:view']
    }
    userDatabase.value.push(newUser)
    return newUser
  }

  // 删除用户
  const deleteUser = (userId: number) => {
    const index = userDatabase.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      userDatabase.value.splice(index, 1)
      return true
    }
    return false
  }

  // 获取用户总数
  const getUserCount = () => {
    return userDatabase.value.length
  }

  return { 
    user, 
    login, 
    logout, 
    hasPermission, 
    hasAnyPermission,
    getAllUsers,
    updateUserPermissions,
    updateUserRole,
    updateUser,
    addUser,
    deleteUser,
    getUserCount
  }
})