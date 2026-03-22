<template>
  <div class="role-page">
    <div class="header">
      <h2>⚙️ 岗位管理</h2>
      <el-button type="primary" @click="handleAdd">+ 新增岗位</el-button>
    </div>

    <el-table :data="roles" style="margin-top: 20px">
      <el-table-column prop="name" label="岗位名称" width="120" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="权限" min-width="300">
        <template #default="{ row }">
          <el-tag 
            v-for="perm in row.permissions.slice(0, 3)" 
            :key="perm" 
            size="small" 
            style="margin: 2px"
            :type="getTagType(perm)"
          >
            {{ getPermissionLabel(perm) }}
          </el-tag>
          <span v-if="row.permissions.length > 3" style="color: #999">
            +{{ row.permissions.length - 3 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="userCount" label="使用人数" width="100" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button size="small" type="info" @click="viewUsers(row)">查看用户</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingRole ? '编辑岗位' : '新增岗位'"
      width="600px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="岗位名称">
          <el-input v-model="form.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="权限配置">
  <div class="permission-tree">
    <div v-for="group in permissionGroups" :key="group.name" class="perm-group">
      <div class="perm-group-title">{{ group.name }}</div>
      <div class="perm-group-items">
        <el-checkbox 
          v-for="perm in group.items" 
          :key="perm.value"
          :checked="isPermissionChecked(perm.value)"
          @change="handlePermissionChange(perm.value, $event)"
        >
          {{ perm.label }}
        </el-checkbox>
      </div>
    </div>
  </div>
</el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看用户弹窗 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="`使用 ${selectedRole?.name} 岗位的用户`"
      width="500px"
    >
      <el-table :data="roleUsers" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="department" label="部门" />
      </el-table>
      <div v-if="roleUsers.length === 0" style="text-align: center; padding: 20px; color: #999">
        暂无用户使用该岗位
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 权限定义
const allPermissions = [
  { label: '查看人员', value: 'employee:view', group: '人员管理' },
  { label: '新增人员', value: 'employee:add', group: '人员管理' },
  { label: '编辑人员', value: 'employee:edit', group: '人员管理' },
  { label: '删除人员', value: 'employee:delete', group: '人员管理' },
  { label: '查看订单', value: 'order:view', group: '订单管理' },
  { label: '新增订单', value: 'order:add', group: '订单管理' },
  { label: '编辑订单', value: 'order:edit', group: '订单管理' },
  { label: '删除订单', value: 'order:delete', group: '订单管理' },
  { label: '管理岗位', value: 'role:manage', group: '系统管理' },
]

// 按分组整理权限
const permissionGroups = computed(() => {
  const groups: Record<string, any> = {}
  allPermissions.forEach(perm => {
    if (!groups[perm.group]) {
      groups[perm.group] = { name: perm.group, items: [] }
    }
    groups[perm.group].items.push({ label: perm.label, value: perm.value })
  })
  return Object.values(groups)
})

// 检查权限是否被选中
const isPermissionChecked = (permissionValue: string) => {
  return form.value.permissions.includes(permissionValue)
}

// 处理权限变化（新增这个函数）
const handlePermissionChange = (value: string, checked: boolean) => {
  if (checked) {
    if (!form.value.permissions.includes(value)) {
      form.value.permissions.push(value)
    }
  } else {
    const index = form.value.permissions.indexOf(value)
    if (index !== -1) {
      form.value.permissions.splice(index, 1)
    }
  }
}

// 岗位列表
const roles = ref([
  {
    id: 1,
    name: '系统管理员',
    description: '拥有所有系统权限',
    permissions: ['employee:view', 'employee:add', 'employee:edit', 'employee:delete', 'order:view', 'order:add', 'order:edit', 'order:delete', 'role:manage'],
    userCount: 0
  },
  {
    id: 2,
    name: '人事经理',
    description: '管理员工信息',
    permissions: ['employee:view', 'employee:add', 'employee:edit', 'employee:delete'],
    userCount: 0
  },
  {
    id: 3,
    name: '销售主管',
    description: '管理订单',
    permissions: ['order:view', 'order:add', 'order:edit', 'order:delete'],
    userCount: 0
  },
  {
    id: 4,
    name: '普通员工',
    description: '只能查看',
    permissions: ['employee:view'],
    userCount: 0
  },
])

// 获取所有用户
const getAllUsers = () => {
  try {
    return userStore.getAllUsers?.() || []
  } catch (e) {
    console.warn('获取用户列表失败', e)
    return []
  }
}

// 获取每个岗位的使用人数
const getRoleUserCount = (roleName: string) => {
  const users = getAllUsers()
  return users.filter((u: any) => u.roleName === roleName).length
}

// 更新岗位的使用人数
const updateRoleUserCount = () => {
  roles.value = roles.value.map(role => ({
    ...role,
    userCount: getRoleUserCount(role.name)
  }))
}

// 获取权限标签的中文名
const getPermissionLabel = (permission: string) => {
  const found = allPermissions.find(p => p.value === permission)
  return found?.label || permission.split(':')[1] || permission
}

// 获取标签颜色
const getTagType = (permission: string) => {
  if (permission.includes('view')) return 'info'
  if (permission.includes('add')) return 'success'
  if (permission.includes('edit')) return 'warning'
  if (permission.includes('delete')) return 'danger'
  return ''
}

const dialogVisible = ref(false)
const editingRole = ref<any>(null)

const form = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

// 查看用户相关
const userDialogVisible = ref(false)
const selectedRole = ref<any>(null)
const roleUsers = ref<any[]>([])

// 新增
const handleAdd = () => {
  editingRole.value = null
  form.value = {
    name: '',
    description: '',
    permissions: []
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  editingRole.value = row
  form.value = {
    name: row.name,
    description: row.description,
    permissions: [...row.permissions]
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  const userCount = getRoleUserCount(row.name)
  if (userCount > 0) {
    ElMessageBox.confirm(
      `该岗位有 ${userCount} 个用户正在使用，删除后这些用户的权限将失效。确定要删除吗？`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      deleteRole(row)
    }).catch(() => {})
  } else {
    deleteRole(row)
  }
}

const deleteRole = (row: any) => {
  const index = roles.value.findIndex(r => r.id === row.id)
  if (index !== -1) {
    roles.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
}

// 在 RoleManage.vue 的 handleSubmit 中添加
const handleSubmit = () => {
  // ... 省略验证代码 ...
  
  if (editingRole.value) {
    const newPermissions = [...form.value.permissions]
    
    // 询问是否同步给所有使用该岗位的用户
    const userCount = getRoleUserCount(editingRole.value.name)
    if (userCount > 0) {
      ElMessageBox.confirm(
        `该岗位有 ${userCount} 个用户正在使用，是否同步更新他们的权限？`,
        '提示',
        {
          confirmButtonText: '同步更新',
          cancelButtonText: '仅更新岗位',
          type: 'info',
        }
      ).then(() => {
        // 同步更新所有用户
        const users = getAllUsers()
        users.forEach((user: any) => {
          if (user.roleName === editingRole.value.name) {
            userStore.updateUserPermissions?.(user.id, newPermissions)
          }
        })
        ElMessage.success('已同步更新所有相关用户的权限')
      }).catch(() => {
        ElMessage.success('岗位权限已更新，用户权限保持不变')
      })
    }
  }
}

// 查看使用该岗位的用户
const viewUsers = (role: any) => {
  selectedRole.value = role
  const users = getAllUsers()
  roleUsers.value = users.filter((u: any) => u.roleName === role.name)
  userDialogVisible.value = true
}

onMounted(() => {
  updateRoleUserCount()
})
</script>

<style scoped>
.role-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
}

.perm-group {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.perm-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.perm-group-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #409eff;
  font-size: 14px;
}

.perm-group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-left: 8px;
}

.perm-group-items .el-checkbox {
  margin-right: 0;
}
</style>