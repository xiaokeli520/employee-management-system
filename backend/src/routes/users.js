const express = require("express");
const { getDatabase } = require("../database");

const router = express.Router();

// 获取所有用户
router.get("/", async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all(`
      SELECT id, username, name, role, roleName, position, department, phone, permissions, created_at 
      FROM users 
      ORDER BY id
    `);

    // 解析 permissions JSON
    const usersWithPermissions = users.map((user) => ({
      ...user,
      permissions: user.permissions ? JSON.parse(user.permissions) : [],
    }));

    res.json({ success: true, data: usersWithPermissions });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ message: "获取用户列表失败" });
  }
});

// 获取单个用户
router.get("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get(
      `SELECT id, username, name, role, roleName, position, department, phone, permissions, created_at 
       FROM users WHERE id = ?`,
      [req.params.id],
    );

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("获取用户失败:", error);
    res.status(500).json({ message: "获取用户失败" });
  }
});

// 新增用户
router.post("/", async (req, res) => {
  const {
    username,
    name,
    position,
    department,
    phone,
    role,
    roleName,
    permissions,
  } = req.body;

  if (!username || !name) {
    return res.status(400).json({ message: "用户名和姓名不能为空" });
  }

  try {
    const db = await getDatabase();

    // 检查用户名是否已存在
    const existing = await db.get("SELECT id FROM users WHERE username = ?", [
      username,
    ]);
    if (existing) {
      return res.status(400).json({ message: "用户名已存在" });
    }

    const defaultPermissions = permissions || ["employee:view"];
    const defaultRole = role || "employee";
    const defaultRoleName = roleName || "普通员工";

    const result = await db.run(
      `INSERT INTO users (username, password, name, role, roleName, position, department, phone, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        "123",
        name,
        defaultRole,
        defaultRoleName,
        position || "",
        department || "",
        phone || "",
        JSON.stringify(defaultPermissions),
      ],
    );

    const newUser = await db.get(
      `SELECT id, username, name, role, roleName, position, department, phone, permissions FROM users WHERE id = ?`,
      [result.lastID],
    );
    newUser.permissions = JSON.parse(newUser.permissions);

    res.json({ success: true, data: newUser });
  } catch (error) {
    console.error("新增用户失败:", error);
    res.status(500).json({ message: "新增用户失败" });
  }
});

// 更新用户
router.put("/:id", async (req, res) => {
  const { name, position, department, phone } = req.body;
  const userId = req.params.id;

  try {
    const db = await getDatabase();

    const result = await db.run(
      `UPDATE users SET name = ?, position = ?, department = ?, phone = ? WHERE id = ?`,
      [name, position || "", department || "", phone || "", userId],
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    const updatedUser = await db.get(
      `SELECT id, username, name, role, roleName, position, department, phone, permissions FROM users WHERE id = ?`,
      [userId],
    );
    updatedUser.permissions = updatedUser.permissions
      ? JSON.parse(updatedUser.permissions)
      : [];

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("更新用户失败:", error);
    res.status(500).json({ message: "更新用户失败" });
  }
});

// 删除用户
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const db = await getDatabase();

    // 不能删除管理员
    const user = await db.get("SELECT role FROM users WHERE id = ?", [userId]);
    if (user && user.role === "admin") {
      return res.status(400).json({ message: "不能删除管理员账户" });
    }

    const result = await db.run("DELETE FROM users WHERE id = ?", [userId]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除用户失败:", error);
    res.status(500).json({ message: "删除用户失败" });
  }
});

// 更新用户权限
router.put("/:id/permissions", async (req, res) => {
  const { permissions } = req.body;
  const userId = req.params.id;

  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({ message: "权限数据格式错误" });
  }

  try {
    const db = await getDatabase();

    const result = await db.run(
      `UPDATE users SET permissions = ? WHERE id = ?`,
      [JSON.stringify(permissions), userId],
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.json({ success: true, message: "权限更新成功" });
  } catch (error) {
    console.error("更新权限失败:", error);
    res.status(500).json({ message: "更新权限失败" });
  }
});

module.exports = router;
