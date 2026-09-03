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
        goles_favor as gf, 
        goles_contra as gc,
        (goles_favor - goles_contra) as dg
      FROM equipos 
      ORDER BY puntos DESC, dg DESC, goles_favor DESC
    `);
    
    // Si queremos calcular Ganados, Empatados, Perdidos, normalmente se guardan o se calculan desde los partidos
    // Como esta es una estructura sencilla, podemos asumir valores temporales o dejarlos en 0 por ahora
    // ya que la tabla se actualizará automáticamente cuando hagamos la lógica de cargar planillas.
    return rows.map(team => ({
      ...team,
      g: 0, // Ganados (lo calcularemos luego de los partidos)
      e: 0, // Empatados
      p: 0  // Perdidos
    }));
  } catch (error) {
    console.error('DB Error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error conectando a la base de datos' });
  }
});
