<<<<<<< HEAD
// Server/utils/db.js
const mysql = require('mysql2'); // Remove the '/promise' part
=======
// // Server/utils/db.js
// const mysql = require('mysql2/promise');
// const fs = require('fs');
// const path = require('path');

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     ssl: {
//         // If DB_SSL_CA exists in Vercel environment, use it as a string.
//         // Otherwise, fall back to reading the local ca.pem file.
//         ca: process.env.DB_SSL_CA || fs.readFileSync(path.join(__dirname, 'ca.pem')),
//         rejectUnauthorized: true
//     },
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// module.exports = pool;

// const mysql = require('mysql2/promise'); // Use the promise version

// const pool = mysql.createPool({
//     // Use environment variables for Render, fallback to local for development
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || 'Mahesh@123',
//     database: process.env.DB_NAME || 'hirewrite_database',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// module.exports = pool;



const mysql = require('mysql2'); // Must be /promise
>>>>>>> c53206c (App file)

const pool = mysql.createPool({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME ,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
