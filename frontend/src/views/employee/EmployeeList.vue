<template>
  <div class="employee-page">
    <!-- 调试信息（如果不需要可以删除） -->
    <div
      v-if="false"
      style="
        background: #f0f0f0;
        padding: 8px;
        margin-bottom: 10px;
        font-size: 12px;
      "
    >
      当前用户: {{ userStore.user?.name }} | 角色: {{ userStore.user?.role }} |
      是否管理员: {{ userStore.user?.role === "admin" }}
    </div>

    <div class="header">
      <h1>👥 人员管理</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="按姓名/职位搜索"
          clearable
          style="width: 220px"
        />
        <el-select
          v-model="selectedDepartment"
          placeholder="全部部门"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="dept in departmentList"
            :key="dept"
            :label="dept"
            :value="dept"
          />
        </el-select>
        <el-button type="success" @click="exportToExcel">
          📊 导出 Excel
        </el-button>
        <el-button v-if="canAdd" type="primary" @click="dialogVisible = true">
          + 新增员工
        </el-button>
      </div>
    </div>

    <el-table :data="paginatedList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="position" label="职位" width="120" />
      <el-table-column prop="department" label="部门" width="100" />
      <el-table-column prop="phone" label="电话" width="120" />
      <el-table-column prop="roleName" label="角色" width="100" />
      <el-table-column label="权限" width="200">
        <template #default="{ row }">
          <el-tag
            v-for="perm in row.permissions.slice(0, 2)"
            :key="perm"
            size="small"
            style="margin: 2px"
          >
            {{ getPermissionShortName(perm) }}
          </el-tag>
          <span v-if="row.permissions.length > 2" style="color: #999"
            >+{{ row.permissions.length - 2 }}</span
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editEmployee(row)"
            >编辑</el-button
          >
          <!-- 只有管理员才能看到权限按钮 -->
          <el-button
            v-if="userStore.user?.role === 'admin'"
            type="warning"
            size="small"
            @click="openPermissionDialog(row)"
          >
            权限
          </el-button>
          <el-button
            v-if="canDelete"
            type="danger"
            size="small"
            @click="deleteEmployee(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        :current-page="currentPage"
        @update:current-page="currentPage = $event"
        :page-size="pageSize"
        @update:page-size="pageSize = $event"
        :page-sizes="[5, 10, 20, 50]"
        :total="filteredTotal.length"
        layout="total, sizes, prev, pager, next, jumper"
        :locale="{
          total: '共',
          item: '条',
          items_per_page: '条/页',
          jump_to: '前往',
          page: '页',
        }"
      />
    </div>

    <!-- 新增/编辑员工弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑员工' : '新增员工'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名" :error="formErrors.name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="form.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="电话" :error="formErrors.phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="`配置权限 - ${permissionUser?.name}`"
      width="550px"
    >
      <div v-if="permissionUser" class="permission-container">
        <div
          v-for="(options, group) in permissionGroups"
          :key="group"
          class="permission-group"
        >
          <div class="group-title">{{ group }}</div>
          <el-checkbox-group v-model="permissionUser.permissions">
            <el-checkbox
              v-for="opt in options"
              :key="opt.value"
              :label="opt.value"
            >
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermissions">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as XLSX from "xlsx";
import { useUserStore } from "../../stores/user";
import { onMounted } from "vue";

// 添加 API 基础地址
const API_BASE = "http://localhost:3000/api";

// 获取 token
const getToken = () => localStorage.getItem("token");

const userStore = useUserStore();

// 获取权限的简短名称
const getPermissionShortName = (perm: string) => {
  const map: Record<string, string> = {
    "employee:view": "查看",
    "employee:add": "新增",
    "employee:edit": "编辑",
    "employee:delete": "删除",
    "order:view": "查看订单",
    "order:add": "新增订单",
    "order:edit": "编辑订单",
    "order:delete": "删除订单",
    "role:manage": "管理岗位",
  };
  return map[perm] || perm.split(":")[1];
};

// 检查权限
const canEdit = computed(() => userStore.hasPermission("employee:edit"));
const canDelete = computed(() => userStore.hasPermission("employee:delete"));
const canAdd = computed(() => userStore.hasPermission("employee:add"));

// 员工列表（从后端获取）
const employeeList = ref<any[]>([]);

// 加载用户列表
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      employeeList.value = data.data;
    } else {
      ElMessage.error("获取用户列表失败");
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchUsers();
});

// 搜索关键词
const searchKeyword = ref("");

// 部门列表
const departmentList = ["技术部", "产品部", "设计部", "质量部", "研发部"];

// 选中的部门
const selectedDepartment = ref("");

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 所有过滤后的数据
const filteredTotal = computed(() => {
  let result = employeeList.value;

  if (searchKeyword.value) {
    result = result.filter(
      (employee) =>
        employee.name.includes(searchKeyword.value) ||
        employee.position.includes(searchKeyword.value),
    );
  }

  if (selectedDepartment.value) {
    result = result.filter(
      (employee) => employee.department === selectedDepartment.value,
    );
  }

  return result;
});

// 当前页显示的数据
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTotal.value.slice(start, end);
});

// 搜索条件变化时重置页码
watch([searchKeyword, selectedDepartment], () => {
  currentPage.value = 1;
});

// 控制弹窗
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);

// 表单数据
const form = reactive({
  name: "",
  position: "",
  department: "",
  phone: "",
});

// 表单验证错误信息
const formErrors = reactive({
  name: "",
  phone: "",
});

// 验证函数
const validateForm = () => {
  let isValid = true;

  formErrors.name = "";
  formErrors.phone = "";

  if (!form.name) {
    formErrors.name = "请输入姓名";
    isValid = false;
  } else if (form.name.length < 2) {
    formErrors.name = "姓名至少2个字符";
    isValid = false;
  }

  if (!form.phone) {
    formErrors.phone = "请输入电话";
    isValid = false;
  } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    formErrors.phone = "请输入11位手机号码";
    isValid = false;
  }

  if (!form.position) {
    ElMessage.warning("请输入职位");
    isValid = false;
  }
  if (!form.department) {
    ElMessage.warning("请输入部门");
    isValid = false;
  }

  return isValid;
};

// 生成新id
const getNewId = () => {
  const maxId = Math.max(...employeeList.value.map((e) => e.id), 0);
  return maxId + 1;
};

// 重置表单
const resetForm = () => {
  form.name = "";
  form.position = "";
  form.department = "";
  form.phone = "";
  editingId.value = null;
};

// 提交
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    if (editingId.value) {
      // 编辑模式
      const response = await fetch(`${API_BASE}/users/${editingId.value}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name,
          position: form.position,
          department: form.department,
          phone: form.phone,
        }),
      });
      const data = await response.json();
      if (data.success) {
        ElMessage.success("修改成功");
        fetchUsers(); // 重新加载
      }
    } else {
      // 新增模式
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          username: `user${Date.now()}`,
          name: form.name,
          position: form.position,
          department: form.department,
          phone: form.phone,
        }),
      });
      const data = await response.json();
      if (data.success) {
        ElMessage.success("添加成功");
        fetchUsers(); // 重新加载
      }
    }

    dialogVisible.value = false;
    resetForm();
  } catch (error) {
    console.error("操作失败:", error);
    ElMessage.error("操作失败");
  }
};

// 取消
const handleCancel = () => {
  dialogVisible.value = false;
  resetForm();
};

// 编辑
const editEmployee = (employee: any) => {
  form.name = employee.name;
  form.position = employee.position;
  form.department = employee.department;
  form.phone = employee.phone;
  editingId.value = employee.id;
  dialogVisible.value = true;
};

// 删除
const deleteEmployee = async (employee: any) => {
  ElMessageBox.confirm(`确定要删除 ${employee.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await fetch(`${API_BASE}/users/${employee.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          ElMessage.success("删除成功");
          fetchUsers(); // 重新加载
        }
      } catch (error) {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

// 导出 Excel
const exportToExcel = () => {
  const exportData = filteredTotal.value.map((item) => ({
    ID: item.id,
    姓名: item.name,
    职位: item.position,
    部门: item.department,
    电话: item.phone,
    角色: item.roleName,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "员工列表");
  XLSX.writeFile(wb, `员工列表_${new Date().toLocaleDateString()}.xlsx`);

  ElMessage.success("导出成功");
};

// 权限配置弹窗
const permissionDialogVisible = ref(false);
const permissionUser = ref<any>(null);

// 权限选项
const permissionOptions = [
  { label: "查看人员", value: "employee:view", group: "人员管理" },
  { label: "新增人员", value: "employee:add", group: "人员管理" },
  { label: "编辑人员", value: "employee:edit", group: "人员管理" },
  { label: "删除人员", value: "employee:delete", group: "人员管理" },
  { label: "查看订单", value: "order:view", group: "订单管理" },
  { label: "新增订单", value: "order:add", group: "订单管理" },
  { label: "编辑订单", value: "order:edit", group: "订单管理" },
  { label: "删除订单", value: "order:delete", group: "订单管理" },
  { label: "管理岗位", value: "role:manage", group: "系统管理" },
];

// 按分组整理权限
const permissionGroups = computed(() => {
  const groups: Record<string, any[]> = {};
  permissionOptions.forEach((opt) => {
    if (!groups[opt.group]) groups[opt.group] = [];
    groups[opt.group].push(opt);
  });
  return groups;
});

// 打开权限配置弹窗
const openPermissionDialog = (user: any) => {
  permissionUser.value = { ...user, permissions: [...user.permissions] };
  permissionDialogVisible.value = true;
};

// 保存权限配置
const savePermissions = async () => {
  if (permissionUser.value) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${permissionUser.value.id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            permissions: permissionUser.value.permissions,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        ElMessage.success(`已更新 ${permissionUser.value.name} 的权限`);
        fetchUsers(); // 重新加载
        permissionDialogVisible.value = false;
      }
    } catch (error) {
      console.error("更新权限失败:", error);
      ElMessage.error("更新权限失败");
    }
  }
};
</script>

<style scoped>
.employee-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

h1 {
  color: #42b883;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.permission-container {
  max-height: 400px;
  overflow-y: auto;
}

.permission-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.group-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #409eff;
}

.permission-group .el-checkbox {
  margin-right: 16px;
  margin-bottom: 8px;
}
</style>
