const mysql = require('mysql2');
require('dotenv').config();

// Création du pool de connexion
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
});

module.exports = db.promise();