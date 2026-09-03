import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const sessionUser = JSON.parse(decodeURIComponent(authCookie));
  if (sessionUser.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  const body = await readBody(event);
  const { id, activo } = body;

  if (!id || typeof activo !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Datos inválidos' });
  }

  try {
    await db.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
    return { success: true, message: 'Estado del usuario actualizado' };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error actualizando usuario' });
  }
});
