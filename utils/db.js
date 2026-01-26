const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Rutuja0802@',
    database: 'hirewrite_database'
})

module.exports = pool