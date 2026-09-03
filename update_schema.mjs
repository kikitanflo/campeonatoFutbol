import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function updateSchema() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bd_campeonatobetulia',
    multipleStatements: true
  });

  try {
    console.log('Actualizando esquema de la base de datos...');

    // 1. Crear tabla usuarios
    await pool.query(`
      DROP TABLE IF EXISTS admin_users;
      DROP TABLE IF EXISTS usuarios;
      
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'arbitro', 'dirigente') NOT NULL DEFAULT 'dirigente',
        equipo_id INT DEFAULT NULL,
        telefono VARCHAR(20) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL
      );
    `);
    
    console.log('Tabla usuarios creada.');

    // 2. Insertar Super Admin
    const adminHash = '$2a$10$iGqdsi2.fjot0WxtdpfsKO9PHJfvS/MmtMU4uGKy8hbLazGJIlBSy'; // admin123
    await pool.query(
      `INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, 'admin')`,
      ['admin', adminHash]
    );

    // 3. Insertar Dirigente de prueba (Asumiendo que Boca Jrs tiene id 1)
    const dirigenteHash = bcrypt.hashSync('boca123', 10);
    await pool.query(
      `INSERT INTO usuarios (username, password_hash, rol, equipo_id, telefono) VALUES (?, ?, 'dirigente', ?, ?)`,
      ['bocajrs', dirigenteHash, 1, '573000000000'] // Usamos el código de país (ej. Colombia 57)
    );

    // 4. Insertar Árbitro de prueba
    const arbitroHash = bcrypt.hashSync('arbitro123', 10);
    await pool.query(
      `INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, 'arbitro')`,
      ['arbitro1', arbitroHash]
    );

    console.log('Usuarios de prueba insertados con éxito.');
  } catch (err) {
    console.error('Error actualizando BD:', err);
  } finally {
    await pool.end();
  }
}

updateSchema();
