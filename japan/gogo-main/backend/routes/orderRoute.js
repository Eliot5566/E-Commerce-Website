const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const mysql = require('mysql2');

const { isAuth } = require('../utils.js');

const orderRouter = express.Router();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'japan',
  port: 8080, // 你的MySQL端口号
});
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log('Received order request:', req.body.orderItems);
    let connection;
    try {
      //如何修改?  在async function 前面加上await 並且在pool.getConnection();後面加上.execute
      //跳出錯誤 TypeError: pool.getConnection.execute is not a function 這裡的錯誤是因為沒有await
      //如何修改?  在async function 前面加上await 並且在pool.getConnection();後面加上.execute
      //await pool.promise().getConnection() 這樣就可以了 但是會跳出錯誤 TypeError: pool.promise(...).getConnection is not a function
      const connection = await pool.promise().getConnection(); // 獲取連接

      const newOrder = {
        orderItems: JSON.stringify(req.body.orderItems),
        shippingAddress: JSON.stringify(req.body.shippingAddress),
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
        user_id: req.user._id,
      };

      const [results] = await connection.execute(
        'INSERT INTO orders (order_items, shipping_address, payment_method, items_price, shipping_price, total_price, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newOrder.orderItems,
          newOrder.shippingAddress,
          newOrder.paymentMethod,
          newOrder.itemsPrice,
          newOrder.shippingPrice,
          newOrder.totalPrice,
          newOrder.user_id,
        ]
      );

      const order = {
        _id: results.insertId,
        ...newOrder,
      };

      // 送出訂單後讓產品庫存量減少
      for (const orderItem of req.body.orderItems) {
        if (orderItem.quantity !== undefined && orderItem.name !== undefined) {
          // 使用 execute 執行 SQL 查詢
          const [productRows] = await connection.execute(
            'SELECT * FROM products WHERE _id = ?',
            [orderItem._id]
          );

          // 檢查查詢結果 是否有產品
          if (productRows.length === 1) {
            const product = productRows[0];
            console.log('product:', product);
            // 執行sql更新產品庫存
            await connection.execute(
              'UPDATE products SET countInStock	 = ? WHERE _id = ?',
              [product.countInStock - orderItem.quantity, orderItem._id]
            );
          } else {
            // 如果沒有產品，則輸出錯誤
            console.error('Product not found for id:', orderItem._id);
          }
        } else {
          // 處理錯誤
          console.error('Undefined quantity or name:', orderItem);
        }
      }

      // 確保連接被釋放回連接池
      connection.release();

      res.status(201).send({ message: 'New Order Created', order });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Order Creation Failed' });
    } finally {
      if (connection) {
        connection.release(); // 释放连接回连接池
      }
    }
  })
);
//設定路由 /api/orders/:id 使用 mysqlOrderRouter
//用來顯示訂單資料
orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // 使用参数化查询以防止 SQL 注入攻击
    const orderId = req.params.id;
    const userId = req.user._id;

    let connection;
    try {
      connection = await pool.promise().getConnection();

      // 使用 JOIN 查询订单和用户，前提是 orders 表中有 user_id 列用于关联
      const [orderResult] = await connection.execute(
        'SELECT o.*, u.name, u.email FROM orders o JOIN users u ON o.user_id = u._id WHERE o.id = ? AND o.user_id = ?',
        [orderId, userId]
      );

      if (orderResult.length === 1) {
        const order = orderResult[0];
        console.log('order:', order);
        res.send(order);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error fetching order' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // 使用参数化查询以防止 SQL 注入攻击
    const orderId = req.params.id;
    const userId = req.user._id;

    let connection;
    try {
      connection = await pool.promise().getConnection();

      // 使用 JOIN 查询订单和用户，前提是 orders 表中有 user_id 列用于关联
      const [orderResult] = await connection.execute(
        'SELECT o.*, u.name, u.email FROM orders o JOIN users u ON o.user_id = u._id WHERE o.id = ? AND o.user_id = ?',
        [orderId, userId]
      );

      if (orderResult.length === 1) {
        const order = orderResult[0];
        console.log('order:', order);
        order.isPaid = true;
        order.paidAt = new Date();

        // 使用 execute 執行 SQL 查詢
        await connection.execute(
          'UPDATE orders SET is_paid = ?, paid_at = ? WHERE id = ?',
          [order.isPaid, order.paidAt, orderId]
        );
        // Update the order.isPaid field in your code
        order.is_paid = true;
        order.paid_at = new Date();
        res.send({ message: 'Order Paid', order });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error fetching order' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  })
);

module.exports = orderRouter;

// const mysql = require('mysql2'); // 使用 require 导入库
// const express = require('express');
// const expressAsyncHandler = require('express-async-handler');
// const isAuth = require('../utils.js').isAuth;

// const orderRouter = express.Router();
// orderRouter.post(
//   '/',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const newOrder = new Order({
//       orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
//       shippingAddress: req.body.shippingAddress,
//       paymentMethod: req.body.paymentMethod,
//       itemsPrice: req.body.itemsPrice,
//       shippingPrice: req.body.shippingPrice,

//       totalPrice: req.body.totalPrice,
//       user: req.user._id,
//     });

//     const order = await newOrder.save();
//     res.status(201).send({ message: 'New Order Created', order });
//   })
// );

// module.exports = orderRouter; // 使用 module.exports 导出路由

//創建資料表 訂單資料表
// CREATE TABLE orders (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   user_id INT NOT NULL,
//   order_items JSON NOT NULL,
//   shipping_address JSON NOT NULL,
//   payment_method VARCHAR(255) NOT NULL,
//   items_price DECIMAL(10, 2) NOT NULL,
//   shipping_price DECIMAL(10, 2) NOT NULL,
//   tax_price DECIMAL(10, 2) NOT NULL,
//   total_price DECIMAL(10, 2) NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES users(_id)
// );
