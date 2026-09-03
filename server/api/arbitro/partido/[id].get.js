import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID de partido requerido' });

  try {
    // 1. Obtener detalles del partido
    const queryPartido = `
      SELECT 
        p.*, 
        el.nombre as local_nombre, el.logo_url as local_logo,
        ev.nombre as visitante_nombre, ev.logo_url as visitante_logo
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.id = ?
    `;
    const [partidos] = await db.query(queryPartido, [id]);
    
    if (partidos.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado' });
    }
    
    const partido = partidos[0];

    // 2. Obtener jugadores del equipo local (SOLO CONVOCADOS) y contar sus eventos en ESTE partido
    const [jugadoresLocal] = await db.query(`
      SELECT j.id, j.nombre, j.dorsal, 
             COALESCE(SUM(CASE WHEN e.tipo_evento = 'Gol' THEN 1 ELSE 0 END), 0) as goles_partido,
             COALESCE(SUM(CASE WHEN e.tipo_evento = 'Amarilla' THEN 1 ELSE 0 END), 0) as amarillas_partido,
             COALESCE(SUM(CASE WHEN e.tipo_evento = 'Roja' THEN 1 ELSE 0 END), 0) as rojas_partido
      FROM jugadores j
      JOIN convocatorias c ON j.id = c.jugador_id
      LEFT JOIN eventos_partido e ON j.id = e.jugador_id AND e.partido_id = ?
      WHERE j.equipo_id = ? AND c.partido_id = ?
      GROUP BY j.id
      ORDER BY j.dorsal ASC
    `, [id, partido.equipo_local_id, id]);

    // 3. Obtener jugadores del equipo visitante (SOLO CONVOCADOS) y contar sus eventos en ESTE partido
    const [jugadoresVisitante] = await db.query(`
      SELECT j.id, j.nombre, j.dorsal, 
             COALESCE(SUM(CASE WHEN e.tipo_evento = 'Gol' THEN 1 ELSE 0 END), 0) as goles_partido,
             COALESCE(SUM(CASE WHEN e.tipo_evento = 'Amarilla' THEN 1 ELSE 0 END), 0) as amarillas_partido,
             COALESCE(SUM(CASE WHEN e.tipo_evento = 'Roja' THEN 1 ELSE 0 END), 0) as rojas_partido
      FROM jugadores j
      JOIN convocatorias c ON j.id = c.jugador_id
      LEFT JOIN eventos_partido e ON j.id = e.jugador_id AND e.partido_id = ?
      WHERE j.equipo_id = ? AND c.partido_id = ?
      GROUP BY j.id
      ORDER BY j.dorsal ASC
    `, [id, partido.equipo_visitante_id, id]);

    return {
      ...partido,
      jugadores_local: jugadoresLocal,
      jugadores_visitante: jugadoresVisitante
    };

  } catch (error) {
    console.error('Error cargando detalle de partido:', error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor' });
  }
});
