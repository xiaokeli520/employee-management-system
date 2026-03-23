const { getDatabase } = require("./database");

async function seedDatabase() {
  const db = await getDatabase();

  // 检查是否有用户
  const userCount = await db.get("SELECT COUNT(*) as count FROM users");

  if (userCount.count === 0) {
    // 插入测试用户
    const users = [
      {
        username: "zhangsan",
        password: "123",
        name: "张三",
        role: "admin",
        roleName: "系统管理员",
        position: "前端工程师",
        department: "技术部",
        phone: "13800138001",
        permissions: JSON.stringify([
          "employee:view",
          "employee:add",
          "employee:edit",
          "employee:delete",
          "order:view",
          "order:add",
          "order:edit",
          "order:delete",
          "role:manage",
        ]),
      },
      {
        username: "lisi",
        password: "123",
        name: "李四",
        role: "hr",
        roleName: "人事经理",
        position: "产品经理",
        department: "产品部",
        phone: "13800138002",
        permissions: JSON.stringify([
          "employee:view",
          "employee:add",
          "employee:edit",
          "employee:delete",
        ]),
      },
      {
        username: "wangwu",
        password: "123",
        name: "王五",
        role: "sale",
        roleName: "销售主管",
        position: "UI设计师",
        department: "设计部",
        phone: "13800138003",
        permissions: JSON.stringify([
          "order:view",
          "order:add",
          "order:edit",
          "order:delete",
        ]),
      },
      {
        username: "zhaoliu",
        password: "123",
        name: "赵六",
        role: "employee",
        roleName: "普通员工",
        position: "后端工程师",
        department: "技术部",
        phone: "13800138004",
        permissions: JSON.stringify(["employee:view"]),
      },
    ];

    for (const user of users) {
      await db.run(
        `INSERT INTO users (username, password, name, role, roleName, position, department, phone, permissions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.username,
          user.password,
          user.name,
          user.role,
          user.roleName,
          user.position,
          user.department,
          user.phone,
          user.permissions,
        ],
      );
    }
    console.log("✅ 测试用户数据已插入");
  } else {
    console.log("📊 数据库中已有用户数据");
  }

  // 检查是否有订单
  const orderCount = await db.get("SELECT COUNT(*) as count FROM orders");

  if (orderCount.count === 0) {
    const demoOrders = [
      { id: "ORD001", product: "iPhone 15", price: "5999", status: "待支付" },
      {
        id: "ORD002",
        product: "MacBook Pro",
        price: "12999",
        status: "已发货",
      },
      { id: "ORD003", product: "AirPods", price: "1299", status: "已完成" },
    ];

    for (const order of demoOrders) {
      await db.run(
        "INSERT INTO orders (id, product, price, status) VALUES (?, ?, ?, ?)",
        [order.id, order.product, order.price, order.status],
      );
    }
    console.log("✅ 测试订单数据已插入");
  } else {
    console.log("📊 数据库中已有订单数据");
  }

  // 检查是否有岗位
  const roleCount = await db.get("SELECT COUNT(*) as count FROM roles");

  if (roleCount.count === 0) {
    const roles = [
      {
        name: "系统管理员",
        description: "拥有所有系统权限",
        permissions: JSON.stringify([
          "employee:view",
          "employee:add",
          "employee:edit",
          "employee:delete",
          "order:view",
          "order:add",
          "order:edit",
          "order:delete",
          "role:manage",
        ]),
      },
      {
        name: "人事经理",
        description: "管理员工信息",
        permissions: JSON.stringify([
          "employee:view",
          "employee:add",
          "employee:edit",
          "employee:delete",
        ]),
      },
      {
        name: "销售主管",
        description: "管理订单",
        permissions: JSON.stringify([
          "order:view",
          "order:add",
          "order:edit",
          "order:delete",
        ]),
      },
      {
        name: "普通员工",
        description: "只能查看",
        permissions: JSON.stringify(["employee:view"]),
      },
    ];

    for (const role of roles) {
      await db.run(
        "INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)",
        [role.name, role.description, role.permissions],
      );
    }
    console.log("✅ 测试岗位数据已插入");
  } else {
    console.log("📊 数据库中已有岗位数据");
  }

  console.log("🎉 数据库初始化完成");
}

seedDatabase().catch(console.error);
