const mysql = require("mysql2");
require("dotenv").config(); // Carrega as variáveis do ficheiro .env

// Cria a "piscina" de conexões com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Transforma a ligação para aceitar o formato de Promises (Async/Await), que é muito mais moderno e limpo
const db = pool.promise();

module.exports = db;
