import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'campeonato_futbol'
  });

  try {
    console.log('Iniciando carga de datos de prueba para el árbitro...');

    // Asegurar que existan al menos 2 equipos (ID 1 y ID 2)
    await connection.query(`INSERT IGNORE INTO equipos (id, nombre) VALUES (1, 'Boca Jrs'), (2, 'River Plate')`);
    
    // Asegurar que el dirigente bocajrs tenga el equipo 1
    await connection.query(`UPDATE usuarios SET equipo_id = 1, telefono = '573000000000' WHERE username = 'bocajrs'`);

    // Crear un partido de prueba (Jornada 1, Pendiente)
    const [result] = await connection.query(`
      INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, estado) 
      VALUES (1, 2, 1, 'En Curso')
    `);
    
    console.log('✅ Partido de prueba creado con éxito (Boca Jrs vs River Plate).');
    console.log('Ya puedes iniciar sesión como "arbitro1" y probar la planilla.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

seed();
