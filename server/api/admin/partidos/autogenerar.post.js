import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  try {
    // 1. Obtener todos los equipos activos
    const [equiposDb] = await db.query('SELECT id FROM equipos ORDER BY id ASC');
    if (equiposDb.length < 2) {
      throw createError({ statusCode: 400, statusMessage: 'Se necesitan al menos 2 equipos para generar un calendario' });
    }

    let teams = equiposDb.map(e => e.id);
    
    // Mezclar los equipos aleatoriamente para que cada vez que se genere el calendario sea diferente
    teams.sort(() => Math.random() - 0.5);

    // Si la cantidad es impar, agregamos un "descansa" (ID = null)
    if (teams.length % 2 !== 0) {
      teams.push(null);
    }

    // 2. Limpiar todos los partidos 'Pendientes' para no duplicar si el usuario le da clic varias veces
    await db.query('DELETE FROM partidos WHERE estado = "Pendiente"');

    // 3. Algoritmo Round-Robin (Todos contra todos)
    const numTeams = teams.length;
    const numRounds = numTeams - 1; // 5 jornadas por cada vuelta (si son 6 equipos)
    const matchesPerRound = numTeams / 2;
    let insertValues = []; // Array para el bulk insert

    // Array para guardar los enfrentamientos de la primera vuelta
    const primeraVuelta = [];

    // --- PRIMERA VUELTA ---
    for (let round = 0; round < numRounds; round++) {
      const jornada = round + 1;
      
      for (let i = 0; i < matchesPerRound; i++) {
        const home = teams[i];
        const away = teams[numTeams - 1 - i];
        
        if (home !== null && away !== null) {
          const isEvenRound = round % 2 === 0;
          const local = isEvenRound ? home : away;
          const visitante = isEvenRound ? away : home;
          
          insertValues.push([local, visitante, jornada, 'Pendiente']);
          primeraVuelta.push({ local, visitante, roundOffset: round });
        }
      }
      
      // Rotación circular
      teams = [teams[0], teams[numTeams - 1], ...teams.slice(1, numTeams - 1)];
    }

    // --- SEGUNDA VUELTA (Ida y Vuelta) ---
    // Copiamos los partidos de la primera vuelta, invirtiendo local/visitante, sumando las jornadas
    for (const match of primeraVuelta) {
      const jornadaSegundaVuelta = match.roundOffset + 1 + numRounds;
      // Invertimos local y visitante para la revancha
      insertValues.push([match.visitante, match.local, jornadaSegundaVuelta, 'Pendiente']);
    }

    // 4. Insertar todos los partidos en la base de datos
    if (insertValues.length > 0) {
      await db.query(
        'INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, estado) VALUES ?',
        [insertValues]
      );
    }

    return { 
      success: true, 
      message: `Calendario generado con éxito (IDA Y VUELTA). Se programaron ${insertValues.length} partidos en ${numRounds * 2} jornadas.` 
    };

  } catch (error) {
    console.error('Error autogenerando calendario:', error);
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.statusMessage || 'Error interno al generar calendario' 
    });
  }
});
