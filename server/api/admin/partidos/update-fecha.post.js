import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  const body = await readBody(event);
  const { partido_id, fecha } = body;

  if (!partido_id) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan datos obligatorios' });
  }

  try {
    let formattedFecha = null;
    if (fecha) {
      // fecha viene como '2026-08-30T15:00'
      formattedFecha = fecha.replace('T', ' ');
      // si falta los segundos, se los agregamos
      if (formattedFecha.length === 16) {
        formattedFecha += ':00';
      }
    }

    const [result] = await db.query(
      'UPDATE partidos SET fecha = ? WHERE id = ?',
      [formattedFecha, partido_id]
    );

    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado' });
    }

    return { 
      success: true, 
      message: 'Fecha actualizada exitosamente' 
    };

  } catch (error) {
    console.error('Error actualizando fecha:', error);
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.statusMessage || 'Error interno al actualizar' 
    });
  }
});
