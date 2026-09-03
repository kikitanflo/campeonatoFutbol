import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  const body = await readBody(event);
  const { equipo_local_id, equipo_visitante_id, jornada, fecha } = body;

  if (!equipo_local_id || !equipo_visitante_id || !jornada) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan campos obligatorios' });
  }

  if (equipo_local_id === equipo_visitante_id) {
    throw createError({ statusCode: 400, statusMessage: 'Un equipo no puede jugar contra sí mismo' });
  }

  try {
    const formattedFecha = fecha ? new Date(fecha).toISOString().slice(0, 19).replace('T', ' ') : null;

    await db.query(
      'INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, fecha, estado) VALUES (?, ?, ?, ?, "Pendiente")',
      [equipo_local_id, equipo_visitante_id, jornada, formattedFecha]
    );

    return { success: true, message: 'Partido programado exitosamente' };
  } catch (error) {
    console.error('Error creando partido:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno guardando el partido' });
  }
});
