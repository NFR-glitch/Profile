require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB ERROR:", err.code);
    console.error(err.message);
    return;
  }

  console.log("Connected to Railway Internal MySQL");
  connection.release();
});

module.exports = db;