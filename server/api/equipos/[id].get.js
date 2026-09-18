import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const teamId = event.context.params.id;

  try {
    // 1. Get team info
    const [teamResult] = await db.query('SELECT * FROM equipos WHERE id = ?', [teamId]);
    if (teamResult.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Equipo no encontrado' });
    }
    const teamInfo = teamResult[0];

    // 2. Get match history for this team
    const [partidos] = await db.query(`
      SELECT p.id, p.jornada, p.fecha, p.estado, 
             p.equipo_local_id, p.equipo_visitante_id,
             p.goles_local, p.goles_visitante,
             el.nombre as local_nombre, el.logo_url as local_logo,
             ev.nombre as visitante_nombre, ev.logo_url as visitante_logo
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.equipo_local_id = ? OR p.equipo_visitante_id = ?
      ORDER BY p.jornada ASC, p.fecha ASC
    `, [teamId, teamId]);

    // 3. Get team's players (optional, but nice to have in a profile)
    const [jugadores] = await db.query(`
      SELECT * FROM jugadores WHERE equipo_id = ? ORDER BY nombre ASC
    `, [teamId]);

    return { success: true, equipo: teamInfo, partidos, jugadores };
  } catch (error) {
    console.error('Error fetching team profile:', error);
    if (error.statusCode === 404) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno obteniendo datos del equipo' });
  }
});
