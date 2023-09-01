//用於傳產品資料到資料庫
const mysql = require('mysql2/promise');
const data = require('./data.js');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  port: 3307,
  password: '',
  database: 'japan',
};

async function importData() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const product of data.products) {
      const { _id, name, slug, category, image, price, countInStock, numReviews, rating, description } = product;

      const insertQuery = `
        INSERT INTO products (_id, name, slug, category, image, price, countInStock, numReviews, rating, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.query(insertQuery, [_id, name, slug, category, image, price, countInStock, numReviews, rating, description]);
    }

    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    connection.close();
  }
}

importData();



// //匯入資料到資料庫
// //安裝 mysql2  npm i mysql2
// import mysql from 'mysql2/promise';
// //要使用的資料
// import data from './data.js';

// const dbConfig = {
//   host: '127.0.0.1',
//   user: 'root',
//   port:3307,
//   password: '',
//   database: 'japan',
// };

// async function importData() {
//   const connection = await mysql.createConnection(dbConfig);

//   try {
//     for (const product of data.products) {
//       const { _id, name, slug, category, image, price, countInStock, numReviews, rating, description } = product;

//       const insertQuery = `
//         INSERT INTO products (_id, name, slug, category, image, price, countInStock, numReviews, rating, description)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       await connection.query(insertQuery, [_id, name, slug, category, image, price, countInStock, numReviews, rating, description]);
//     }

//     console.log('Data imported successfully!');
//   } catch (error) {
//     console.error('Error importing data:', error);
//   } finally {
//     connection.close();
//   }
// }

// importData();
