const express = require("express");
const { getDatabase } = require("../database");

const router = express.Router();

// 获取所有岗位
router.get("/", async (req, res) => {
  try {
    const db = await getDatabase();
    const roles = await db.all("SELECT * FROM roles ORDER BY id");

    // 解析 permissions JSON
    const rolesWithPermissions = roles.map((role) => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    }));

    res.json({ success: true, data: rolesWithPermissions });
  } catch (error) {
    console.error("获取岗位列表失败:", error);
    res.status(500).json({ message: "获取岗位列表失败" });
  }
});

// 获取单个岗位
router.get("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const role = await db.get("SELECT * FROM roles WHERE id = ?", [
      req.params.id,
    ]);

    if (!role) {
      return res.status(404).json({ message: "岗位不存在" });
    }

    role.permissions = role.permissions ? JSON.parse(role.permissions) : [];
    res.json({ success: true, data: role });
  } catch (error) {
    console.error("获取岗位失败:", error);
    res.status(500).json({ message: "获取岗位失败" });
  }
});

// 新增岗位
router.post("/", async (req, res) => {
  const { name, description, permissions } = req.body;

  if (!name) {
    return res.status(400).json({ message: "岗位名称不能为空" });
  }

  try {
    const db = await getDatabase();

    // 检查岗位名是否已存在
    const existing = await db.get("SELECT id FROM roles WHERE name = ?", [
      name,
    ]);
    if (existing) {
      return res.status(400).json({ message: "岗位名称已存在" });
    }

    const result = await db.run(
      "INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)",
      [name, description || "", JSON.stringify(permissions || [])],
    );

    const newRole = await db.get("SELECT * FROM roles WHERE id = ?", [
      result.lastID,
    ]);
    newRole.permissions = JSON.parse(newRole.permissions);

    res.json({ success: true, data: newRole });
  } catch (error) {
    console.error("新增岗位失败:", error);
    res.status(500).json({ message: "新增岗位失败" });
  }
});

// 更新岗位
router.put("/:id", async (req, res) => {
  const { name, description, permissions } = req.body;
  const roleId = req.params.id;

  try {
    const db = await getDatabase();

    const result = await db.run(
      "UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?",
      [name, description || "", JSON.stringify(permissions || []), roleId],
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "岗位不存在" });
    }

    const updatedRole = await db.get("SELECT * FROM roles WHERE id = ?", [
      roleId,
    ]);
    updatedRole.permissions = JSON.parse(updatedRole.permissions);

    res.json({ success: true, data: updatedRole });
  } catch (error) {
    console.error("更新岗位失败:", error);
    res.status(500).json({ message: "更新岗位失败" });
  }
});

// 删除岗位
router.delete("/:id", async (req, res) => {
  const roleId = req.params.id;

  try {
    const db = await getDatabase();
    const result = await db.run("DELETE FROM roles WHERE id = ?", [roleId]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "岗位不存在" });
    }

    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除岗位失败:", error);
    res.status(500).json({ message: "删除岗位失败" });
  }
});

module.exports = router;
