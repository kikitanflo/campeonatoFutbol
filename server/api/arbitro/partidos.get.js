import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Obtenemos los partidos que están pendientes o en curso, uniendo con la tabla equipos
    const query = `
      SELECT 
        p.id, p.jornada, p.estado, p.goles_local, p.goles_visitante, p.arbitraje_pagado,
        el.nombre as local_nombre, el.logo_url as local_logo,
        ev.nombre as visitante_nombre, ev.logo_url as visitante_logo,
        (SELECT COUNT(*) FROM convocatorias c JOIN jugadores j ON c.jugador_id = j.id WHERE c.partido_id = p.id AND j.equipo_id = p.equipo_local_id) as convocados_local,
        (SELECT COUNT(*) FROM convocatorias c JOIN jugadores j ON c.jugador_id = j.id WHERE c.partido_id = p.id AND j.equipo_id = p.equipo_visitante_id) as convocados_visitante
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.estado != 'Finalizado'
      ORDER BY p.jornada ASC, p.id ASC
    `;
    const [partidos] = await db.query(query);
    return partidos;
  } catch (error) {
    console.error('Error cargando partidos:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor' });
  }
});
