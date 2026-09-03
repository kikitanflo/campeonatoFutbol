import mysql from 'mysql2/promise';

async function update() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'campeonato_futbol'
  });

  try {
    console.log('Aplicando parche V2 a la base de datos...');

    // 1. Añadir columna activo a usuarios (ignorando error si ya existe)
    try {
      await connection.query(`ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT 1`);
      console.log('✅ Columna "activo" añadida a la tabla usuarios.');
    } catch (e) {
      if(e.code === 'ER_DUP_FIELDNAME') console.log('✅ Columna "activo" ya existe.');
      else throw e;
    }

    // 2. Crear tabla convocatorias
    await connection.query(`
      CREATE TABLE IF NOT EXISTS convocatorias (
          partido_id INT NOT NULL,
          jugador_id INT NOT NULL,
          PRIMARY KEY (partido_id, jugador_id),
          FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
          FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla "convocatorias" creada/verificada.');
    
    console.log('Parche completado. El sistema está listo.');

  } catch (error) {
    console.error('Error aplicando parche:', error);
  } finally {
    await connection.end();
  }
}

update();
