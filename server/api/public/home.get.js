import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // 1. Determinar cuál es la Jornada Actual
    // La jornada actual es la más baja que todavía tiene partidos 'Programado' o 'En Curso'
    const [jornadaData] = await db.query(`
      SELECT MIN(jornada) as current_jornada 
      FROM partidos 
      WHERE estado != 'Finalizado'
    `);
    
    let currentJornada = jornadaData[0]?.current_jornada;
    
    // Si todos los partidos terminaron, mostramos la última jornada jugada
    if (!currentJornada) {
      const [maxJornadaData] = await db.query(`SELECT MAX(jornada) as current_jornada FROM partidos`);
      currentJornada = maxJornadaData[0]?.current_jornada || 1;
    }

    // 2. Obtener partidos de la Jornada Actual para el Ticker
    const [partidos] = await db.query(`
      SELECT p.id, p.jornada, p.estado, p.fecha,
             el.nombre as local_nombre, el.logo_url as local_logo, p.goles_local,
             ev.nombre as visitante_nombre, ev.logo_url as visitante_logo, p.goles_visitante
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.jornada = ?
      ORDER BY 
        CASE 
          WHEN p.estado = 'En Curso' THEN 1
          WHEN p.estado = 'Programado' THEN 2
          WHEN p.estado = 'Finalizado' THEN 3
          ELSE 4
        END,
        p.fecha ASC
    `, [currentJornada]);

    // 2. Obtener el Puntero (El equipo con más puntos y mejor diferencia)
    const [punteroData] = await db.query(`
      SELECT nombre, puntos 
      FROM equipos 
      ORDER BY puntos DESC, (goles_favor - goles_contra) DESC, goles_favor DESC 
      LIMIT 1
    `);
    const puntero = punteroData.length > 0 ? punteroData[0] : null;

    // 3. Obtener el Goleador (Jugador con más goles)
    const [goleadorData] = await db.query(`
      SELECT j.nombre, e.nombre as equipo, j.goles
      FROM jugadores j
      LEFT JOIN equipos e ON j.equipo_id = e.id
      ORDER BY j.goles DESC
      LIMIT 1
    `);
    const goleador = goleadorData.length > 0 ? goleadorData[0] : null;

    // 4. Próxima Fecha
    const [proximaFechaData] = await db.query(`
      SELECT fecha, jornada
      FROM partidos
      WHERE estado = 'Pendiente' AND fecha IS NOT NULL
      ORDER BY fecha ASC
      LIMIT 1
    `);
    const proximaFecha = proximaFechaData.length > 0 ? proximaFechaData[0] : null;

    // 5. Configuración CMS
    // Auto-create table just in case
    await db.query(`
      CREATE TABLE IF NOT EXISTS configuraciones (
          clave VARCHAR(50) PRIMARY KEY,
          valor TEXT
      )
    `);
    const [configData] = await db.query(`SELECT clave, valor FROM configuraciones`);
    const configuracion = {};
    configData.forEach(row => {
      if (row.clave === 'sponsor_images' || row.clave === 'hero_images') {
        try {
          configuracion[row.clave] = JSON.parse(row.valor);
        } catch (e) {
          configuracion[row.clave] = [];
        }
      } else {
        configuracion[row.clave] = row.valor;
      }
    });

    // Valores por defecto si la base de datos está vacía
    const defaults = {
      hero_title: 'CAMPEONATO LIGA PRO 2026',
      hero_subtitle: 'Pasión, táctica y gloria en la cancha. El torneo más competitivo de la ciudad.',
      ticker_label: '⚽ FECHA ' + currentJornada, // Dinámico
      hero_btn1_text: 'Ver Posiciones',
      hero_btn2_text: 'Ver Equipos'
    };

    const finalConfig = { ...defaults, ...configuracion };
    finalConfig.ticker_label = '⚽ FECHA ' + currentJornada; // Forzar dinámico siempre

    return {
      partidos,
      puntero,
      goleador,
      proximaFecha,
      configuracion: finalConfig
    };
  } catch (error) {
    console.error('Error in public home API:', error);
    return { isError: true, message: error.message, stack: error.stack };
  }
});
