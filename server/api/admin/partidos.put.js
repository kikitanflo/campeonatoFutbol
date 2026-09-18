import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  const body = await readBody(event);
  const { id, equipo_local_id, equipo_visitante_id, jornada, fecha } = body;

  if (!id || !equipo_local_id || !equipo_visitante_id || !jornada) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan campos obligatorios' });
  }

  if (equipo_local_id === equipo_visitante_id) {
    throw createError({ statusCode: 400, statusMessage: 'Un equipo no puede jugar contra sí mismo' });
  }

  try {
    let formattedFecha = null;
    if (fecha) {
      formattedFecha = fecha.replace('T', ' ');
      if (formattedFecha.length === 16) {
        formattedFecha += ':00';
      }
    }

    const [result] = await db.query(
      'UPDATE partidos SET equipo_local_id = ?, equipo_visitante_id = ?, jornada = ?, fecha = ? WHERE id = ? AND estado = "Pendiente"',
      [equipo_local_id, equipo_visitante_id, jornada, formattedFecha, id]
    );

    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado o ya no está pendiente' });
    }

    return { success: true, message: 'Partido actualizado exitosamente' };
  } catch (error) {
    console.error('Error actualizando partido:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno guardando el partido' });
  }
});
