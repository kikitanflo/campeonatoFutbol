import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  try {
    // Traer todos los equipos para los desplegables
    const [equipos] = await db.query('SELECT id, nombre FROM equipos ORDER BY nombre ASC');

    // Traer todos los partidos programados
    const [partidos] = await db.query(`
      SELECT p.id, p.jornada, p.fecha, p.estado, 
             el.nombre as local_nombre, ev.nombre as visitante_nombre 
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      ORDER BY p.jornada ASC, p.id DESC
    `);

    return { equipos, partidos };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error al obtener la información' });
  }
});
