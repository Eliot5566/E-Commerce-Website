// 傳送使用者資料到資料庫
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function importUsers() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        port: 3307,
        password: '',
        database: 'japan',
    });

    //要匯入的會員資料
    const users = [
        {
            name: 'Eliot',
            email: 'a7868783@gmail.com',
            password: bcrypt.hashSync('123456'),
            isAdmin: true,
            age: null,
        },
        {
            name: 'John',
            email: 'user@example.com',
            password: bcrypt.hashSync('123456'),
            isAdmin: false,
            age: null,
        },
    ];

    // 將 user 資料(上方定義的user)插入到 users 資料表中
    for (const user of users) {
        await connection.query('INSERT INTO users SET ?', user);
    }

    connection.end();
    console.log('Users imported successfully!');
}

importUsers();


// import * as mysql from 'mysql2/promise';
// import bcrypt from 'bcryptjs';

// async function importUsers() {
//     const connection = await mysql.createConnection({
//         host: '127.0.0.1',
//         user: 'root',
//         port:3307,
//         password: '',
//         database: 'japan',
//     });

//     //要匯入的會員資料
//     const users = [{
//             name: 'Eliot',
//             email: 'a7868783@gmail.com',
//             password: bcrypt.hashSync('123456'),
//             isAdmin: true,
//             age: null,
//         },
//         {
//             name: 'John',
//             email: 'user@example.com',
//             password: bcrypt.hashSync('123456'),
//             isAdmin: false,
//             age: null,
//         },
//     ];

//     // 將 user 資料(上方定義的user)插入到 users 資料表中
//     for (const user of users) {
//         await connection.query('INSERT INTO users SET ?', user);
//     }

//     connection.end();
//     console.log('Users imported successfully!');
// }

// importUsers();