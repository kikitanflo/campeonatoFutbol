import mysql from 'mysql2/promise';

// Configuración de la conexión a WAMP (phpMyAdmin)
// Asegúrate de que los datos coincidan con tu servidor local
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'bd_campeonatobetulia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
