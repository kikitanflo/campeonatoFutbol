import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'dirigente' || !user.equipo_id) throw createError({ statusCode: 403 });

  const body = await readBody(event);
  const { partido_id, jugadores_ids } = body;

  if (!partido_id || !Array.isArray(jugadores_ids)) {
    throw createError({ statusCode: 400, statusMessage: 'Datos inválidos' });
  }

  try {
    // 1. Verificar que el partido pertenezca al equipo del dirigente
    const [partido] = await db.query('SELECT estado FROM partidos WHERE id = ? AND (equipo_local_id = ? OR equipo_visitante_id = ?)', [partido_id, user.equipo_id, user.equipo_id]);
    if (partido.length === 0) throw createError({ statusCode: 403, statusMessage: 'Partido no válido' });
    if (partido[0].estado === 'Finalizado') throw createError({ statusCode: 400, statusMessage: 'El partido ya finalizó' });

    // 2. Eliminar la convocatoria anterior SOLO de los jugadores de este equipo
    await db.query(`
      DELETE FROM convocatorias 
      WHERE partido_id = ? 
      AND jugador_id IN (SELECT id FROM jugadores WHERE equipo_id = ?)
    `, [partido_id, user.equipo_id]);

    // 3. Insertar la nueva convocatoria
    if (jugadores_ids.length > 0) {
      const values = jugadores_ids.map(jid => [partido_id, jid]);
      await db.query('INSERT INTO convocatorias (partido_id, jugador_id) VALUES ?', [values]);
    }

    return { success: true, message: 'Planilla guardada correctamente' };

  } catch (error) {
    console.error('Error guardando convocatoria:', error);
    if(error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno' });
  }
});
