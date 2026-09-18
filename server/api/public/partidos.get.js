import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const jornada = parseInt(query.jornada) || 1;

  try {
    const [partidos] = await db.query(`
      SELECT p.id, p.jornada, p.estado, p.fecha,
             el.nombre as local_nombre, el.logo_url as local_logo, p.goles_local,
             ev.nombre as visitante_nombre, ev.logo_url as visitante_logo, p.goles_visitante
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.jornada = ?
      ORDER BY 
        CASE 
          WHEN p.estado = 'En Curso' THEN 1
          WHEN p.estado = 'Programado' THEN 2
          WHEN p.estado = 'Finalizado' THEN 3
          ELSE 4
        END,
        p.fecha ASC
    `, [jornada]);

    return { partidos };
  } catch (error) {
    console.error('Error fetching partidos:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error obteniendo partidos' });
  }
});
