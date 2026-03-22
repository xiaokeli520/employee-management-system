<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">🏢</div>
        <h2>企业管理系统</h2>
        <p>请输入账号密码登录</p>
      </div>
      
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" size="large" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="demo-tips">
        <div class="tips-title">演示账号：</div>
        <div class="tips-list">
          <div class="tip-item">
            <span class="role-badge admin">管理员</span>
            <span>zhangsan / 123</span>
            <span class="perm">全部权限</span>
          </div>
          <div class="tip-item">
            <span class="role-badge hr">人事</span>
            <span>lisi / 123</span>
            <span class="perm">仅人员管理</span>
          </div>
          <div class="tip-item">
            <span class="role-badge sale">销售</span>
            <span>wangwu / 123</span>
            <span class="perm">仅订单管理</span>
          </div>
          <div class="tip-item">
            <span class="role-badge employee">员工</span>
            <span>zhaoliu / 123</span>
            <span class="perm">仅查看</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  
  // 模拟网络延迟
  setTimeout(() => {
    const result = userStore.login(form.username, form.password)
    
    if (result.success) {
      ElMessage.success(`欢迎回来，${userStore.user?.name}`)
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
    
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  color: #999;
  font-size: 14px;
}

.demo-tips {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.tips-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: white;
}

.role-badge.admin { background: #409eff; }
.role-badge.hr { background: #67c23a; }
.role-badge.sale { background: #e6a23c; }
.role-badge.employee { background: #909399; }

.perm {
  font-size: 11px;
  color: #666;
  margin-left: auto;
}
</style>