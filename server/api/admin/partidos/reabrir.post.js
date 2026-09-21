import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  }

  let user;
  try {
    user = JSON.parse(decodeURIComponent(authCookie));
  } catch (e) {
    user = typeof authCookie === 'string' && authCookie.startsWith('{') ? JSON.parse(authCookie) : null;
  }

  if (!user || user.rol !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Solo los administradores pueden reabrir partidos.' });
  }

  const body = await readBody(event);
  const { partido_id } = body;

  if (!partido_id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el ID del partido' });
  }

  try {
    // Volvemos el estado a Pendiente para que el árbitro pueda volver a iniciarlo
    await db.query(
      'UPDATE partidos SET estado = "Pendiente" WHERE id = ?',
      [partido_id]
    );

    return { success: true, message: 'Partido reabierto con éxito' };
  } catch (error) {
    console.error('Error al reabrir partido:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor al reabrir' });
  }
});
