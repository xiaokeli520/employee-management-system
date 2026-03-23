const express = require("express");
const { getDatabase } = require("../database");

const router = express.Router();

// 获取所有订单
router.get("/", async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.all(
      "SELECT * FROM orders ORDER BY created_at DESC",
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("获取订单列表失败:", error);
    res.status(500).json({ message: "获取订单列表失败" });
  }
});

// 获取单个订单
router.get("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const order = await db.get("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("获取订单失败:", error);
    res.status(500).json({ message: "获取订单失败" });
  }
});

// 新增订单
router.post("/", async (req, res) => {
  const { id, product, price, status } = req.body;

  if (!id || !product || !price) {
    return res.status(400).json({ message: "订单号、商品名称和金额不能为空" });
  }

  try {
    const db = await getDatabase();

    // 检查订单号是否已存在
    const existing = await db.get("SELECT id FROM orders WHERE id = ?", [id]);
    if (existing) {
      return res.status(400).json({ message: "订单号已存在" });
    }

    await db.run(
      "INSERT INTO orders (id, product, price, status) VALUES (?, ?, ?, ?)",
      [id, product, price, status || "待支付"],
    );

    const newOrder = await db.get("SELECT * FROM orders WHERE id = ?", [id]);
    res.json({ success: true, data: newOrder });
  } catch (error) {
    console.error("新增订单失败:", error);
    res.status(500).json({ message: "新增订单失败" });
  }
});

// 更新订单
router.put("/:id", async (req, res) => {
  const { product, price, status } = req.body;
  const orderId = req.params.id;

  try {
    const db = await getDatabase();

    const result = await db.run(
      "UPDATE orders SET product = ?, price = ?, status = ? WHERE id = ?",
      [product, price, status, orderId],
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "订单不存在" });
    }

    const updatedOrder = await db.get("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("更新订单失败:", error);
    res.status(500).json({ message: "更新订单失败" });
  }
});

// 删除订单
router.delete("/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    const db = await getDatabase();
    const result = await db.run("DELETE FROM orders WHERE id = ?", [orderId]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "订单不存在" });
    }

    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除订单失败:", error);
    res.status(500).json({ message: "删除订单失败" });
  }
});

module.exports = router;
