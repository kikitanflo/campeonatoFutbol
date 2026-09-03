import mysql from 'mysql2/promise';

async function update() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'campeonato_futbol'
  });

  try {
    console.log('Aplicando parche V3 (Configuraciones CMS) a la base de datos...');

    // 1. Crear tabla configuraciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuraciones (
          clave VARCHAR(50) PRIMARY KEY,
          valor TEXT
      )
    `);
    console.log('✅ Tabla "configuraciones" creada/verificada.');

    // 2. Insertar valores por defecto si no existen
    const defaultConfigs = [
      ['hero_title', 'CAMPEONATO LIGA PRO 2026'],
      ['hero_subtitle', 'Pasión, táctica y gloria en la cancha. El torneo más competitivo de la ciudad.'],
      ['ticker_label', '⚽ LO ÚLTIMO'],
      ['hero_btn1_text', 'Ver Posiciones'],
      ['hero_btn2_text', 'Ver Equipos']
    ];

    for (const [clave, valor] of defaultConfigs) {
      await connection.query(
        `INSERT IGNORE INTO configuraciones (clave, valor) VALUES (?, ?)`,
        [clave, valor]
      );
    }
    console.log('✅ Valores por defecto insertados en "configuraciones".');

    console.log('Parche completado. El CMS está listo a nivel de BD.');
  } catch (error) {
    console.error('Error aplicando parche:', error);
  } finally {
    await connection.end();
  }
}

update();
