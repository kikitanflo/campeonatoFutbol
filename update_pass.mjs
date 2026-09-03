import mysql from 'mysql2/promise';

async function updatePassword() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bd_campeonatobetulia'
  });

  try {
    const newHash = '$2a$10$iGqdsi2.fjot0WxtdpfsKO9PHJfvS/MmtMU4uGKy8hbLazGJIlBSy';
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE username = ?', [newHash, 'admin']);
    console.log('Contraseña actualizada correctamente en la BD');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updatePassword();
