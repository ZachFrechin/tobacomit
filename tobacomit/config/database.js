const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const config = {
    database: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'tobacomit',
        connectionLimit: process.env.DATABASE_CONNECTION_LIMIT || 10,
    }
}

module.exports = {
    dbPool: mysql.createPool(config.database),
}