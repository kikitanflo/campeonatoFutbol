import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const [team] = await db.query(`SELECT * FROM equipos WHERE nombre LIKE '%inter%' OR nombre LIKE '%valle%'`);
    if (team.length === 0) return { error: 'No team found' };
    
    const teamId = team[0].id;
    
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
    `, [teamId, teamId]);
    
    return { team: team[0], partidos };
  } catch (error) {
    return { error: error.message };
  }
});
