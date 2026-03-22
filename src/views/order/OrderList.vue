<template>
  <div class="order-page">
    <div class="header">
      <h2>📦 订单管理</h2>
      <el-button type="primary" @click="handleAdd">+ 新增订单</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="按订单号/商品名称搜索"
        clearable
        style="width: 250px"
      />
    </div>

    <!-- 订单表格 -->
    <el-table :data="filteredOrders" style="margin-top: 20px">
      <el-table-column prop="id" label="订单号" width="120" />
      <el-table-column prop="product" label="商品" />
      <el-table-column prop="price" label="金额" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑订单' : '新增订单'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="订单号">
          <el-input v-model="form.id" placeholder="请输入订单号" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="form.product" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="form.price" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待支付" value="待支付" />
            <el-option label="已支付" value="已支付" />
            <el-option label="已发货" value="已发货" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 订单列表
const orders = ref([
  { id: 'ORD001', product: 'iPhone 15', price: '5999', status: '待支付' },
  { id: 'ORD002', product: 'MacBook Pro', price: '12999', status: '已发货' },
  { id: 'ORD003', product: 'AirPods', price: '1299', status: '已完成' },
])

// 搜索
const searchKeyword = ref('')

// 过滤后的订单
const filteredOrders = computed(() => {
  if (!searchKeyword.value) return orders.value
  return orders.value.filter(order =>
    order.id.includes(searchKeyword.value) ||
    order.product.includes(searchKeyword.value)
  )
})

// 弹窗控制
const dialogVisible = ref(false)
const editingId = ref<string | null>(null)

// 表单
const form = ref({
  id: '',
  product: '',
  price: '',
  status: ''
})

// 状态标签颜色
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '待支付': 'warning',
    '已支付': 'info',
    '已发货': 'primary',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

// 新增
const handleAdd = () => {
  editingId.value = null
  form.value = { id: '', product: '', price: '', status: '待支付' }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除订单 ${row.id} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = orders.value.findIndex(o => o.id === row.id)
    if (index !== -1) {
      orders.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 提交
const handleSubmit = () => {
  if (!form.value.id || !form.value.product || !form.value.price) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (editingId.value) {
    // 编辑
    const index = orders.value.findIndex(o => o.id === editingId.value)
    if (index !== -1) {
      orders.value[index] = { ...form.value }
      ElMessage.success('修改成功')
    }
  } else {
    // 新增
    if (orders.value.find(o => o.id === form.value.id)) {
      ElMessage.warning('订单号已存在')
      return
    }
    orders.value.push({ ...form.value })
    ElMessage.success('添加成功')
  }
  
  dialogVisible.value = false
}
</script>

<style scoped>
.order-page {
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
.search-bar {
  margin-top: 10px;
}
</style>