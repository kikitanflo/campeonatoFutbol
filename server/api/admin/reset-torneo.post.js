import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  try {
    // 1. Borrar todos los eventos de los partidos (hijos)
    await db.query('DELETE FROM eventos_partido');
    await db.query('ALTER TABLE eventos_partido AUTO_INCREMENT = 1');

    // 2. Borrar todas las convocatorias (planillas)
    await db.query('DELETE FROM convocatorias');
    await db.query('ALTER TABLE convocatorias AUTO_INCREMENT = 1');

    // 3. Reiniciar estadísticas individuales de los jugadores (goles, tarjetas)
    await db.query('UPDATE jugadores SET goles = 0, amarillas = 0, rojas = 0');

    // 4. Borrar todos los partidos (ahora que no tienen hijos dependientes)
    await db.query('DELETE FROM partidos');
    await db.query('ALTER TABLE partidos AUTO_INCREMENT = 1');

    // 5. Reiniciar las estadísticas de todos los equipos a cero
    await db.query(`
      UPDATE equipos 
      SET pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0, gd = 0, puntos = 0, amarillas = 0, rojas = 0
    `);

    return { 
      success: true, 
      message: 'El torneo ha sido reiniciado por completo. Todos los historiales fueron borrados.' 
    };

  } catch (error) {
    console.error('Error reiniciando el torneo:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno al reiniciar el torneo' 
    });
  }
});
