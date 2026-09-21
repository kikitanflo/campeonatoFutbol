import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // 1. Resetear todas las estadísticas a 0
    await db.query(`
      UPDATE equipos 
      SET puntos = 0, partidos_jugados = 0, partidos_ganados = 0, 
          partidos_empatados = 0, partidos_perdidos = 0, 
          goles_favor = 0, goles_contra = 0
    `);

    // 2. Obtener todos los partidos finalizados
    const [partidos] = await db.query('SELECT * FROM partidos WHERE estado = "Finalizado"');

    // 3. Recalcular
    for (const partido of partidos) {
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

      // Local
      await db.query(`
        UPDATE equipos 
        SET puntos = puntos + ?, partidos_jugados = partidos_jugados + 1, 
            partidos_ganados = partidos_ganados + ?, partidos_empatados = partidos_empatados + ?, partidos_perdidos = partidos_perdidos + ?,
            goles_favor = goles_favor + ?, goles_contra = goles_contra + ?
        WHERE id = ?
      `, [ptsLocal, pgLocal, peLocal, ppLocal, gl, gv, partido.equipo_local_id]);

      // Visitante
      await db.query(`
        UPDATE equipos 
        SET puntos = puntos + ?, partidos_jugados = partidos_jugados + 1, 
            partidos_ganados = partidos_ganados + ?, partidos_empatados = partidos_empatados + ?, partidos_perdidos = partidos_perdidos + ?,
            goles_favor = goles_favor + ?, goles_contra = goles_contra + ?
        WHERE id = ?
      `, [ptsVisit, pgVisit, peVisit, ppVisit, gv, gl, partido.equipo_visitante_id]);
    }

    return { success: true, message: `Estadísticas recalculadas basadas en ${partidos.length} partidos finalizados.` };
  } catch (error) {
    console.error('Error recalculando:', error);
    return { error: error.message };
  }
});
