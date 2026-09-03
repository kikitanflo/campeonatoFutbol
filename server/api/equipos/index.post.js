import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  // Solo administradores deberían poder hacer esto.
  // Verificamos la cookie (una validación sencilla)
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  }

  const body = await readBody(event);
  const { nombre } = body;

  if (!nombre) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre del equipo es obligatorio' });
  }

  try {
    // Insertamos el nuevo equipo en la base de datos
    // Por defecto inicia con 0 puntos, 0 partidos, etc (definido en la BD)
    const [result] = await db.query(
      'INSERT INTO equipos (nombre) VALUES (?)',
      [nombre]
    );

    return { 
      success: true, 
      message: 'Equipo creado exitosamente',
      teamId: result.insertId
    };

  } catch (error) {
    console.error('Error creando equipo:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error al crear el equipo' });
  }
});
