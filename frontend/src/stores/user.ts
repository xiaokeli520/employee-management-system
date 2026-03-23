import { defineStore } from "pinia";
import { ref } from "vue";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  roleName: string;
  permissions: string[];
  position?: string;
  department?: string;
  phone?: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        user.value = data.user;
        token.value = data.token;
        localStorage.setItem("token", data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("登录失败:", error);
      return { success: false, message: "网络错误，请确保后端已启动" };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false;
    if (user.value.role === "admin") return true;
    return user.value.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  return { user, token, login, logout, hasPermission, hasAnyPermission };
});
