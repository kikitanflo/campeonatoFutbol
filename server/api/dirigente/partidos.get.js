import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'dirigente' || !user.equipo_id) throw createError({ statusCode: 403 });

  try {
    const [partidos] = await db.query(`
      SELECT p.id, p.jornada, p.estado, p.fecha,
             el.nombre as local_nombre, ev.nombre as visitante_nombre,
             (SELECT COUNT(*) FROM convocatorias c WHERE c.partido_id = p.id AND c.jugador_id IN (SELECT id FROM jugadores WHERE equipo_id = ?)) as convocados
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE (p.equipo_local_id = ? OR p.equipo_visitante_id = ?)
      ORDER BY p.jornada ASC, p.id ASC
    `, [user.equipo_id, user.equipo_id, user.equipo_id]);

    return partidos;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error obteniendo partidos' });
  }
});
