# 🏢 企业管理系统

一个基于 Vue 3 + Express + SQLite 的全栈企业管理系统，实现 RBAC 权限控制。

---

## ✨ 功能特性

- 🔐 **用户登录**：JWT 认证
- 👥 **人员管理**：增删改查、搜索、筛选、分页、导出 Excel
- 📦 **订单管理**：增删改查、状态管理
- ⚙️ **岗位管理**：权限模板配置
- 🛡️ **RBAC 权限控制**：菜单级 + 按钮级

---

## 🛠️ 技术栈

### 前端

| 技术         | 说明       |
| ------------ | ---------- |
| Vue 3        | 前端框架   |
| TypeScript   | 类型安全   |
| Pinia        | 状态管理   |
| Vue Router   | 路由管理   |
| Element Plus | UI 组件库  |
| Vite         | 构建工具   |
| xlsx         | Excel 导出 |

### 后端

| 技术     | 说明     |
| -------- | -------- |
| Node.js  | 运行环境 |
| Express  | Web 框架 |
| SQLite   | 数据库   |
| JWT      | 身份认证 |
| bcryptjs | 密码加密 |

---

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

````bash
# 前端
cd frontend
npm install

# 后端
cd backend
npm install

初始化数据库
bash
cd backend
node src/seed.js
启动项目
bash
# 后端（端口 3000）
cd backend
npm run dev

# 前端（端口 5173）
cd frontend
npm run dev
访问项目
前端：http://localhost:5173

后端：http://localhost:3000

演示账号
账号	密码	角色
zhangsan	123	系统管理员
lisi	123	人事经理
wangwu	123	销售主管
zhaoliu	123	普通员工

---

📁 项目结构
bash
employee-system/
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── router/
│   │   └── layouts/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── database.js
│   │   └── seed.js
│   ├── database.sqlite
│   └── package.json
└── README.md
📝 API 接口
认证
方法	路径	说明
POST	/api/auth/login	用户登录
用户管理
方法	路径	说明
GET	/api/users	获取用户列表
POST	/api/users	新增用户
PUT	/api/users/:id	更新用户
DELETE	/api/users/:id	删除用户
PUT	/api/users/:id/permissions	更新权限
订单管理
方法	路径	说明
GET	/api/orders	获取订单列表
POST	/api/orders	新增订单
PUT	/api/orders/:id	更新订单
DELETE	/api/orders/:id	删除订单
岗位管理
方法	路径	说明
GET	/api/roles	获取岗位列表
POST	/api/roles	新增岗位
PUT	/api/roles/:id	更新岗位
DELETE	/api/roles/:id	删除岗位
