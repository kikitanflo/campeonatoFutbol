import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Calculamos la tabla de posiciones siguiendo reglas universales
    // Orden: Puntos (Descendente), Diferencia de Goles (Desc), Goles a Favor (Desc)
    const [rows] = await db.query(`
      SELECT 
        id, 
        nombre as name, 
        logo_url, 
        puntos as pts, 
        partidos_jugados as pj,
        partidos_ganados as g,
        partidos_empatados as e,
        partidos_perdidos as p,
        goles_favor as gf, 
        goles_contra as gc,
        (goles_favor - goles_contra) as dg
      FROM equipos 
      ORDER BY puntos DESC, dg DESC, goles_favor DESC
    `);
    
    return rows.map(team => ({
      ...team,
      g: team.g || 0,
      e: team.e || 0,
      p: team.p || 0
    }));
  } catch (error) {
    console.error('DB Error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error conectando a la base de datos' });
  }
});
