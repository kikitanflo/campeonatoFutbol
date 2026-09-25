import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // 1. Determinar cuál es la Jornada Actual basándonos en partidos PROGRAMADOS
    // Buscamos la jornada más baja que tenga partidos programados con fecha asignada que aún no hayan finalizado
    const [jornadaProgData] = await db.query(`
      SELECT MIN(jornada) as current_jornada 
      FROM partidos 
      WHERE (fecha IS NOT NULL OR estado = 'En Curso') AND estado != 'Finalizado'
    `);
    
    let currentJornada = jornadaProgData[0]?.current_jornada;
    
    // Si todos los partidos programados terminaron, buscamos la última jornada que tuvo partidos jugados o programados
    if (!currentJornada) {
      const [lastJornadaData] = await db.query(`
        SELECT MAX(jornada) as max_jornada 
        FROM partidos 
        WHERE fecha IS NOT NULL OR estado != 'Pendiente'
      `);
      currentJornada = lastJornadaData[0]?.max_jornada;
    }

    // Si aún no hay ningún partido programado en todo el torneo, por defecto Jornada 1
    if (!currentJornada) {
      currentJornada = 1;
    }

    const [maxJornadaData] = await db.query(`SELECT MAX(jornada) as max_jornada FROM partidos`);
    const maxJornada = maxJornadaData[0]?.max_jornada || 1;

    // 2. Partidos PROGRAMADOS PENDIENTES para el Ticker (donde rotan de lado a lado)
    // Solo partidos que tienen fecha asignada O están En Curso, EXCLUYENDO Finalizados
    const [tickerPartidos] = await db.query(`
      SELECT p.id, p.jornada, p.estado, p.fecha,
             el.nombre as local_nombre, el.logo_url as local_logo, p.goles_local,
             ev.nombre as visitante_nombre, ev.logo_url as visitante_logo, p.goles_visitante
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE (p.fecha IS NOT NULL OR p.estado = 'En Curso') AND p.estado != 'Finalizado'
      ORDER BY 
        CASE 
          WHEN p.estado = 'En Curso' THEN 1
          ELSE 2
        END,
        p.fecha ASC
      LIMIT 25
    `);

    // 3. Partidos PROGRAMADOS PENDIENTES de la Jornada Actual (para la grilla principal)
    const [jornadaMatches] = await db.query(`
      SELECT p.id, p.jornada, p.estado, p.fecha,
             el.nombre as local_nombre, el.logo_url as local_logo, p.goles_local,
             ev.nombre as visitante_nombre, ev.logo_url as visitante_logo, p.goles_visitante
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      WHERE p.jornada = ? AND (p.fecha IS NOT NULL OR p.estado = 'En Curso') AND p.estado != 'Finalizado'
      ORDER BY 
        CASE 
          WHEN p.estado = 'En Curso' THEN 1
          ELSE 2
        END,
        p.fecha ASC
    `, [currentJornada]);

    // 4. Obtener el Puntero (El equipo con más puntos y mejor diferencia)
    const [punteroData] = await db.query(`
      SELECT nombre, puntos 
      FROM equipos 
      ORDER BY puntos DESC, (goles_favor - goles_contra) DESC, goles_favor DESC 
      LIMIT 1
    `);
    const puntero = punteroData.length > 0 ? punteroData[0] : null;

    // 5. Obtener el Goleador (Jugador con más goles)
    const [goleadorData] = await db.query(`
      SELECT j.nombre, e.nombre as equipo, j.goles
      FROM jugadores j
      LEFT JOIN equipos e ON j.equipo_id = e.id
      ORDER BY j.goles DESC
      LIMIT 1
    `);
    const goleador = goleadorData.length > 0 ? goleadorData[0] : null;

    // 6. Próxima Fecha
    const [proximaFechaData] = await db.query(`
      SELECT fecha, jornada
      FROM partidos
      WHERE estado = 'Pendiente' AND fecha IS NOT NULL
      ORDER BY fecha ASC
      LIMIT 1
    `);
    const proximaFecha = proximaFechaData.length > 0 ? proximaFechaData[0] : null;

    // 7. Configuración CMS
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
      ticker_label: '⚽ LO ÚLTIMO',
      hero_btn1_text: 'Ver Posiciones',
      hero_btn2_text: 'Ver Equipos'
    };

    const finalConfig = { ...defaults, ...configuracion };
    if (!finalConfig.ticker_label) {
      finalConfig.ticker_label = '⚽ FECHA ' + currentJornada;
    }

    return {
      partidos: tickerPartidos, // Para el ticker (donde rotan de lado a lado)
      jornadaMatches,           // Para la grilla de la jornada inicial
      puntero,
      goleador,
      proximaFecha,
      currentJornada,
      maxJornada,
      configuracion: finalConfig
    };
  } catch (error) {
    console.error('Error in public home API:', error);
    return { isError: true, message: error.message, stack: error.stack };
  }
});
