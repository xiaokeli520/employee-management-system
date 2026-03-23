const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

// 数据库连接
let db = null;

async function getDatabase() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, "../database.sqlite"),
      driver: sqlite3.Database,
    });

    // 创建表
    await initDatabase();
  }
  return db;
}

async function initDatabase() {
  const db = await getDatabase();

  // 创建用户表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      roleName TEXT NOT NULL,
      position TEXT,
      department TEXT,
      phone TEXT,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建订单表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      product TEXT NOT NULL,
      price TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建岗位表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ 数据库表创建完成");
}

module.exports = { getDatabase };
