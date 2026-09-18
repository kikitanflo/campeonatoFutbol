import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // 1. Obtener goleadores
    const [goleadores] = await db.query(`
      SELECT j.id, j.nombre as name, e.nombre as team, j.goles as goals
      FROM jugadores j
      LEFT JOIN equipos e ON j.equipo_id = e.id
      WHERE j.goles > 0
      ORDER BY j.goles DESC, j.nombre ASC
      LIMIT 10
    `);

    // 2. Obtener valla menos vencida
    const [defensa] = await db.query(`
      SELECT e.id, e.nombre as name, e.goles_contra as gc, 
             (e.partidos_ganados + e.partidos_empatados + e.partidos_perdidos) as pj
      FROM equipos e
      WHERE (e.partidos_ganados + e.partidos_empatados + e.partidos_perdidos) > 0
      ORDER BY e.goles_contra ASC, pj DESC
      LIMIT 10
    `);

    // 3. Obtener jugadores con más tarjetas (Fair Play Inverso)
    const [tarjetas] = await db.query(`
      SELECT j.id, j.nombre as name, e.nombre as team, j.amarillas, j.rojas,
             (j.amarillas + (j.rojas * 3)) as puntos_castigo
      FROM jugadores j
      LEFT JOIN equipos e ON j.equipo_id = e.id
      WHERE j.amarillas > 0 OR j.rojas > 0
      ORDER BY puntos_castigo DESC, j.rojas DESC, j.amarillas DESC
      LIMIT 10
    `);

    // 4. Juego Limpio por Equipos
    const [fairplay] = await db.query(`
      SELECT e.id, e.nombre as team,
             COALESCE(SUM(j.amarillas), 0) as total_amarillas, 
             COALESCE(SUM(j.rojas), 0) as total_rojas,
             (COALESCE(SUM(j.amarillas), 0) + (COALESCE(SUM(j.rojas), 0) * 3)) as puntos_castigo
      FROM equipos e
      LEFT JOIN jugadores j ON e.id = j.equipo_id
      GROUP BY e.id, e.nombre
      ORDER BY puntos_castigo ASC, e.nombre ASC
    `);

    return {
      success: true,
      goleadores,
      defensa,
      tarjetas,
      fairplay
    };

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
});
