import db from '~/server/utils/db';
import { enviarMensajeWhatsApp } from '~/server/utils/whatsapp';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { partido_id, jugador_id, tipo_evento, minuto } = body;

  if (!partido_id || !jugador_id || !tipo_evento) {
    throw createError({ statusCode: 400, statusMessage: 'Datos incompletos' });
  }

  try {
    // 1. Obtener detalles del jugador para saber su equipo y nombre
    const [jugadores] = await db.query('SELECT nombre, equipo_id FROM jugadores WHERE id = ?', [jugador_id]);
    if (jugadores.length === 0) throw createError({ statusCode: 404, statusMessage: 'Jugador no encontrado' });
    const jugador = jugadores[0];

    // 2. Insertar o eliminar el evento en la tabla eventos_partido
    if (!tipo_evento.startsWith('Quitar')) {
      await db.query(
        'INSERT INTO eventos_partido (partido_id, jugador_id, tipo_evento, minuto) VALUES (?, ?, ?, ?)',
        [partido_id, jugador_id, tipo_evento, minuto || null]
      );
    } else {
      const tipoReal = tipo_evento.replace('Quitar ', '');
      await db.query(
        'DELETE FROM eventos_partido WHERE partido_id = ? AND jugador_id = ? AND tipo_evento = ? ORDER BY id DESC LIMIT 1',
        [partido_id, jugador_id, tipoReal]
      );
    }

    // 3. Actualizar estadísticas del jugador
    let columnaStats = '';
    if (tipo_evento === 'Gol') columnaStats = 'goles';
    if (tipo_evento === 'Amarilla' || tipo_evento === 'Quitar Amarilla') columnaStats = 'amarillas';
    if (tipo_evento === 'Roja' || tipo_evento === 'Quitar Roja') columnaStats = 'rojas';
    
    if (columnaStats) {
      if (tipo_evento.startsWith('Quitar')) {
        await db.query(`UPDATE jugadores SET ${columnaStats} = GREATEST(0, ${columnaStats} - 1) WHERE id = ?`, [jugador_id]);
      } else {
        await db.query(`UPDATE jugadores SET ${columnaStats} = ${columnaStats} + 1 WHERE id = ?`, [jugador_id]);
      }
    }

    // 4. Actualizar marcador del partido si es un gol
    if (tipo_evento === 'Gol') {
      // Necesitamos saber si el jugador es del local o visitante
      const [partidos] = await db.query('SELECT equipo_local_id, equipo_visitante_id FROM partidos WHERE id = ?', [partido_id]);
      if (partidos.length > 0) {
        const partido = partidos[0];
        if (partido.equipo_local_id === jugador.equipo_id) {
          await db.query('UPDATE partidos SET goles_local = goles_local + 1 WHERE id = ?', [partido_id]);
        } else if (partido.equipo_visitante_id === jugador.equipo_id) {
          await db.query('UPDATE partidos SET goles_visitante = goles_visitante + 1 WHERE id = ?', [partido_id]);
        }
      }
    }

    // Ya no enviamos WhatsApp individual aquí. Se envía un resumen al finalizar el partido.

    return { success: true, message: 'Evento registrado con éxito' };

  } catch (error) {
    console.error('Error registrando evento:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor' });
  }
});
