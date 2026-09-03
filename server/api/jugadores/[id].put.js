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
    throw createError({ statusCode: 401, statusMessage: 'No tienes permiso para realizar esta acción.' });
  }

  const jugadorId = event.context.params.id;
  const body = await readBody(event);
  const { name, dorsal } = body;

  if (!name || !dorsal) {
    throw createError({ statusCode: 400, statusMessage: 'Datos incompletos' });
  }

  try {
    // Si es dirigente, verificar que el jugador pertenezca a su equipo
    if (user.rol === 'dirigente') {
      const [jugador] = await db.query('SELECT equipo_id FROM jugadores WHERE id = ?', [jugadorId]);
      if (jugador.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Jugador no encontrado' });
      }
      if (jugador[0].equipo_id !== user.equipo_id) {
        throw createError({ statusCode: 403, statusMessage: 'Este jugador no pertenece a tu equipo' });
      }
    }
    
    // Actualizar jugador
    await db.query('UPDATE jugadores SET nombre = ?, dorsal = ? WHERE id = ?', [name, dorsal, jugadorId]);

    return { success: true, message: 'Jugador actualizado exitosamente' };

  } catch (error) {
    console.error('Error actualizando jugador:', error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor al actualizar jugador' });
  }
});
