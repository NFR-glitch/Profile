require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
    if (err) {
        console.error("Database gagal terhubung:", err);
        return;
    }
    console.log("Database Railway berhasil terhubung!");
});

module.exports = db;