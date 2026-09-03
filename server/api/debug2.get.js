import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const [equipos] = await db.query('SELECT id, nombre FROM equipos');
    const [jugadores] = await db.query('SELECT equipo_id, COUNT(*) as total FROM jugadores GROUP BY equipo_id');
    const [usuarios] = await db.query('SELECT * FROM usuarios');

    // Revisemos si hay jugadores huérfanos (sin equipo_id válido)
    const [huerfanos] = await db.query('SELECT * FROM jugadores WHERE equipo_id NOT IN (SELECT id FROM equipos)');
    
    // Revisemos la estructura de la tabla para ver si tiene el cascade
    const [fkInfo] = await db.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_SCHEMA = 'bd_campeonatobetulia' AND TABLE_NAME = 'jugadores'
    `);

    return {
      equipos,
      jugadores,
      usuarios: usuarios.length,
      huerfanos: huerfanos.length,
      fkInfo
    };
  } catch (error) {
    return { error: error.message };
  }
});
