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
    const [partidosInfo] = await db.query('SELECT * FROM partidos WHERE id = ?', [partido_id]);
    if (partidosInfo.length === 0) throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado' });
    const partido = partidosInfo[0];

    // Si estaba finalizado, restar los puntos y goles
    if (partido.estado === 'Finalizado') {
      const gl = partido.goles_local || 0;
      const gv = partido.goles_visitante || 0;
      
      let ptsLocal = 0, ptsVisit = 0;
      let pgLocal = 0, pgVisit = 0;
      let peLocal = 0, peVisit = 0;
      let ppLocal = 0, ppVisit = 0;

      if (gl > gv) {
        ptsLocal = 3; pgLocal = 1; ppVisit = 1;
      } else if (gv > gl) {
        ptsVisit = 3; pgVisit = 1; ppLocal = 1;
      } else {
        ptsLocal = 1; ptsVisit = 1; peLocal = 1; peVisit = 1;
      }

      await db.query(`
        UPDATE equipos 
        SET puntos = puntos - ?, partidos_jugados = partidos_jugados - 1, 
            partidos_ganados = partidos_ganados - ?, partidos_empatados = partidos_empatados - ?, partidos_perdidos = partidos_perdidos - ?,
            goles_favor = goles_favor - ?, goles_contra = goles_contra - ?
        WHERE id = ?
      `, [ptsLocal, pgLocal, peLocal, ppLocal, gl, gv, partido.equipo_local_id]);

      await db.query(`
        UPDATE equipos 
        SET puntos = puntos - ?, partidos_jugados = partidos_jugados - 1, 
            partidos_ganados = partidos_ganados - ?, partidos_empatados = partidos_empatados - ?, partidos_perdidos = partidos_perdidos - ?,
            goles_favor = goles_favor - ?, goles_contra = goles_contra - ?
        WHERE id = ?
      `, [ptsVisit, pgVisit, peVisit, ppVisit, gv, gl, partido.equipo_visitante_id]);
    }

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
