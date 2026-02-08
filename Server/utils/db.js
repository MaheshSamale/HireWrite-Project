// require('dotenv').config(); // Loads variables from .env into process.env
// const mysql = require('mysql2');
// const fs = require('fs');
// const path = require('path');

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     ssl: {
//         ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
//         rejectUnauthorized: true
//     },
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// module.exports = pool.promise();


const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mahesh@123',
    database: 'hirewrite_database'
})

module.exports = pool