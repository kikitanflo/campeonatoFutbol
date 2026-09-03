import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Asegurar que existan al menos 2 equipos (ID 1 y ID 2)
    await db.query(`INSERT IGNORE INTO equipos (id, nombre) VALUES (1, 'Boca Jrs'), (2, 'River Plate')`);
    
    // Asegurar que el dirigente bocajrs tenga el equipo 1
    await db.query(`UPDATE usuarios SET equipo_id = 1, telefono = '573000000000' WHERE username = 'bocajrs'`);

    // Verificar si ya existe un partido para no crear duplicados infinitos
    const [existing] = await db.query(`SELECT id FROM partidos WHERE equipo_local_id = 1 AND equipo_visitante_id = 2`);
    
    if (existing.length === 0) {
      // Crear un partido de prueba (Jornada 1, Pendiente)
      await db.query(`
        INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, estado) 
        VALUES (1, 2, 1, 'En Curso')
      `);
    }

    return { 
      success: true, 
      message: '✅ Partido de prueba creado con éxito (Boca Jrs vs River Plate). Ya puedes volver al panel del árbitro.' 
    };

  } catch (error) {
    console.error('Error seeding:', error);
    return { success: false, error: error.message };
  }
});
