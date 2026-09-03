import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  // Verificar sesión y rol
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  }
  
  let user;
  try {
    user = JSON.parse(decodeURIComponent(authCookie));
  } catch (e) {
    user = typeof authCookie === 'string' && authCookie.startsWith('{') ? JSON.parse(authCookie) : null;
  }

  if (!user || (user.rol !== 'dirigente' && user.rol !== 'admin')) {
    throw createError({ statusCode: 401, statusMessage: 'Tu sesión es antigua o inválida. Cierra sesión y vuelve a entrar.' });
  }

  const body = await readBody(event);
  const { name, dorsal, equipo_id } = body;

  // Si es dirigente, forzamos a que solo pueda agregar a su propio equipo
  const targetTeamId = user.rol === 'dirigente' ? user.equipo_id : equipo_id;

  if (!targetTeamId || !name || !dorsal) {
    throw createError({ statusCode: 400, statusMessage: 'Datos incompletos' });
  }

  try {
    // Verificar límite de 30 jugadores
    const [countRows] = await db.query('SELECT COUNT(*) as total FROM jugadores WHERE equipo_id = ?', [targetTeamId]);
    const totalJugadores = countRows[0].total;

    if (totalJugadores >= 30) {
      throw createError({ statusCode: 400, statusMessage: 'Has alcanzado el límite máximo de 30 jugadores' });
    }

    // Insertar jugador
    const [result] = await db.query(
      'INSERT INTO jugadores (equipo_id, nombre, dorsal) VALUES (?, ?, ?)',
      [targetTeamId, name, dorsal]
    );

    return { 
      success: true, 
      message: 'Jugador inscrito exitosamente',
      playerId: result.insertId
    };

  } catch (error) {
    console.error('Error inscribiendo jugador:', error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error al inscribir el jugador' });
  }
});
