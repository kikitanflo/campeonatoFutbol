import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const equipo_id = query.equipo_id;
  
  if (!equipo_id) {
    throw createError({ statusCode: 400, statusMessage: 'equipo_id es requerido' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre, dorsal, goles, amarillas, rojas FROM jugadores WHERE equipo_id = ? ORDER BY nombre ASC',
      [equipo_id]
    );
    return rows;
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor' });
  }
});
