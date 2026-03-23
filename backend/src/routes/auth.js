const express = require("express");
const { getDatabase } = require("../database");

const router = express.Router();

// 登录
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "用户名和密码不能为空" });
  }

  try {
    const db = await getDatabase();

    // 查询用户
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 验证密码（临时用明文，后面改加密）
    if (password !== user.password) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 生成简单 token（后面加 JWT）
    const token = Buffer.from(`${user.id}:${user.username}`).toString("base64");

    // 返回用户信息
    const { password: _, ...userInfo } = user;
    userInfo.permissions = user.permissions ? JSON.parse(user.permissions) : [];

    res.json({
      success: true,
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ message: "登录失败" });
  }
});

module.exports = router;
