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

      // console.log(connection); // 在这里添加这行代码
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
