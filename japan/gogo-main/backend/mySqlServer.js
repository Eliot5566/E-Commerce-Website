//使用此檔案開啟後端伺服器
// require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');

const mysql = require('mysql2/promise');

const mysqlProductRouter = require('./routes/mysqlProduct.js');
const mysqlSeedRouter = require('./routes/mysqlSeedRoures.js');
const mysqlUsersRouter = require('./routes/mysqlUsers.js');
const mysqlOrderRouter = require('./routes/orderRoute.js');

const app = express();

// MySQL 連線設定 只需要const db 不用調用 是因為在mysqlProduct.js中已經調用了
//mysqlProduct.js 會調用mysql2/promise 這個套件
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'japan',
  port: process.env.DB_PORT || 8080, // 請根據您的 MySQL 設定修改 port
});
// 使用 express.json() 中介軟體來解析 JSON 格式的請求主體
app.use(express.json());
// 使用 express.urlencoded() 中介軟體來解析 URL 編碼的請求主體
app.use(express.urlencoded({ extended: true }));

app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});
// app.use('/api/seed', seedRouter);
// 設定路由 /api/products 使用 mysqlProductRouter
app.use('/api/products', mysqlProductRouter);

// 設定路由 /api/users 使用 mysqlUsersRouter
app.use('/api/users', mysqlUsersRouter);

app.use('/api/orders', mysqlOrderRouter);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`後端伺服器MySQL 啟動於 http://localhost:${port}`);
});
