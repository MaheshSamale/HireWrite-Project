require('dotenv').config(); // Loads variables from .env into process.env
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
ssl: {
    // If DB_SSL_CA exists in Vercel env, use it. 
    // Otherwise, fall back to reading the local file for your local computer.
    ca: process.env.DB_SSL_CA || fs.readFileSync(path.join(__dirname, 'ca.pem')),
    rejectUnauthorized: true
},,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
