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
