const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler');
const userRouter = express.Router();
const { generateToken } = require('../utils.js'); // 請確保 utils.js 的路徑正確

// 請根據你的 MySQL 連接設定進行修改
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'japan',
  port: 8080,
});

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
      const connection = await db.getConnection();
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      connection.release();
      console.log(users);
      console.log(req.body);

      if (users.length > 0) {
        const user = users[0];

        if (bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user); // 生成 token
          res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token, // 將 token 發送給前端
          });
          return;
        }
      }

      res.status(401).send({ message: 'Invalid email or password' });
    } catch (error) {
      console.error(error);
      console.log(req.body);

      res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);

//定義一個路由，用來處理註冊請求

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const connection = await db.getConnection();

      // 確認重複信箱
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        res.status(400).send({ message: 'Email address already registered' });
        return;
      }

      // 使用 bcrypt 加密密碼
      const hashedPassword = await bcrypt.hash(password, 8);

      // 將新帳號資料 傳到資料庫
      const [results] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      connection.release();

      // 從資料庫撈出剛剛新增的帳號資料
      const [newUser] = await connection.query(
        'SELECT * FROM users WHERE _id = ?',
        // 這裡的 results.insertId 是剛剛新增的帳號的 ID
        //insertId 是資料庫自動生成的 ID 代表剛剛生成的帳號的 ID
        [results.insertId]
      );

      const token = generateToken(newUser[0]); // 生成 token 並反饋給前端
      res.send({
        _id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        isAdmin: newUser[0].isAdmin,
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);

// userRouter.post(
//   '/signup',
//   expressAsyncHandler(async (req, res) => {
//     const newUser = new User({
//       name: req.body.name,
//       email: req.body.email,
//       password: bcrypt.hashSync(req.body.password, 8), // 將密碼加密後再儲存
//     });
//     const user = await newUser.save();
//     const token = generateToken(user); // 生成 token
//     res.send({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       token: token, // 將 token 發送給前端
//     });
//   })
// );

// userRouter.post(
//   '/signin',
//   expressAsyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       const connection = await db.getConnection();
//       const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
//       connection.release();

//       if (users.length > 0) {
//         const user = users[0];
//         if (bcrypt.compareSync(password, user.password)) {
//           res.send({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             isAdmin: user.isAdmin,
//             token: generateToken(user),
//           });
//           return;
//         }
//       }

//       res.status(401).send({ message: 'Invalid email or password' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send({ message: 'Internal Server Error' });
//     }
//   })
// );

module.exports = userRouter;
