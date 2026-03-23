const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const roleRoutes = require("./routes/roles");

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/roles", roleRoutes);
app.get("/test", (req, res) => {
  res.json({ message: "test ok" });
});

// 在 app.use('/api/auth', authRoutes) 后面添加
console.log("✅ 路由已注册: /api/auth/login");

// 测试路由
app.get("/", (req, res) => {
  res.json({
    message: "企业管理系统 API 已启动",
    version: "1.0.0",
    status: "running",
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 测试接口: http://localhost:${PORT}/`);
});
