import db from '~/server/utils/db';
import { enviarMensajeWhatsApp } from '~/server/utils/whatsapp';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { partido_id, informe } = body;

  if (!partido_id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de partido requerido' });
  }

  try {
    // Asegurar que la columna informe existe
    try {
      const [columns] = await db.query("SHOW COLUMNS FROM partidos LIKE 'informe'");
      if (columns.length === 0) {
        await db.query("ALTER TABLE partidos ADD COLUMN informe TEXT");
      }
      
      const [eqCols] = await db.query("SHOW COLUMNS FROM equipos LIKE 'partidos_ganados'");
      if (eqCols.length === 0) {
        await db.query("ALTER TABLE equipos ADD COLUMN partidos_ganados INT DEFAULT 0, ADD COLUMN partidos_empatados INT DEFAULT 0, ADD COLUMN partidos_perdidos INT DEFAULT 0");
      }
    } catch (e) {
      console.log('Error verificando columnas:', e.message);
    }

    // 1. Marcar partido como finalizado y guardar el informe
    await db.query('UPDATE partidos SET estado = "Finalizado", informe = ? WHERE id = ?', [informe || null, partido_id]);

    // 2. Obtener info del partido
    const [partidosInfo] = await db.query(`
      SELECT p.*, 
             el.nombre as local_nombre, ev.nombre as visitante_nombre 
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.id = ?
    `, [partido_id]);
    
    if (partidosInfo.length === 0) throw new Error('Partido no encontrado');
    const partido = partidosInfo[0];

    // 2.5. Actualizar la tabla de Posiciones (Estadísticas de los Equipos)
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

    // Actualizar Local
    await db.query(`
      UPDATE equipos 
      SET puntos = puntos + ?, partidos_jugados = partidos_jugados + 1, 
          partidos_ganados = partidos_ganados + ?, partidos_empatados = partidos_empatados + ?, partidos_perdidos = partidos_perdidos + ?,
          goles_favor = goles_favor + ?, goles_contra = goles_contra + ?
      WHERE id = ?
    `, [ptsLocal, pgLocal, peLocal, ppLocal, gl, gv, partido.equipo_local_id]);

    // Actualizar Visitante
    await db.query(`
      UPDATE equipos 
      SET puntos = puntos + ?, partidos_jugados = partidos_jugados + 1, 
          partidos_ganados = partidos_ganados + ?, partidos_empatados = partidos_empatados + ?, partidos_perdidos = partidos_perdidos + ?,
          goles_favor = goles_favor + ?, goles_contra = goles_contra + ?
      WHERE id = ?
    `, [ptsVisit, pgVisit, peVisit, ppVisit, gv, gl, partido.equipo_visitante_id]);

    // 3. Obtener todos los eventos de este partido
    const [eventos] = await db.query(`
      SELECT e.tipo_evento, j.nombre as jugador_nombre, j.equipo_id
      FROM eventos_partido e
      JOIN jugadores j ON e.jugador_id = j.id
      WHERE e.partido_id = ?
    `, [partido_id]);

    // 4. Buscar a los dirigentes de AMBOS equipos para enviarles el reporte
    const [dirigentes] = await db.query(`
      SELECT equipo_id, telefono, username 
      FROM usuarios 
      WHERE rol = 'dirigente' AND equipo_id IN (?, ?)
    `, [partido.equipo_local_id, partido.equipo_visitante_id]);

    // 5. Construir y enviar el reporte a cada dirigente
    for (const dirigente of dirigentes) {
      if (!dirigente.telefono) continue;

      // Filtrar eventos solo del equipo de este dirigente
      const eventosEquipo = eventos.filter(e => e.equipo_id === dirigente.equipo_id);
      
      const goles = eventosEquipo.filter(e => e.tipo_evento === 'Gol').map(e => e.jugador_nombre);
      const amarillas = eventosEquipo.filter(e => e.tipo_evento === 'Amarilla').map(e => e.jugador_nombre);
      const rojas = eventosEquipo.filter(e => e.tipo_evento === 'Roja').map(e => e.jugador_nombre);

      const nombreEquipoDirigente = dirigente.equipo_id === partido.equipo_local_id ? partido.local_nombre : partido.visitante_nombre;

      let reporte = `*⚽ INFORME DE PARTIDO FINALIZADO*\n`;
      reporte += `${partido.local_nombre} [${partido.goles_local}] vs [${partido.goles_visitante}] ${partido.visitante_nombre}\n\n`;
      reporte += `Hola ${dirigente.username}, este es el resumen disciplinario de tu equipo (${nombreEquipoDirigente}):\n\n`;
      
      reporte += `*Goles a favor:* ${goles.length > 0 ? goles.join(', ') : 'Ninguno'}\n`;
      reporte += `*🟨 Tarjetas Amarillas:* ${amarillas.length > 0 ? amarillas.join(', ') : 'Ninguna'}\n`;
      reporte += `*🟥 Tarjetas Rojas:* ${rojas.length > 0 ? rojas.join(', ') : 'Ninguna'}\n\n`;

      if (informe) {
        reporte += `*📝 Informe Arbitral:*\n${informe}\n\n`;
      }

      reporte += `_Generado automáticamente por el Sistema Arbitral_`;

      await enviarMensajeWhatsApp(dirigente.telefono, reporte);
    }

    return { success: true, message: 'Partido finalizado y reportes enviados' };

  } catch (error) {
    console.error('Error al finalizar partido:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno al finalizar' });
  }
});
