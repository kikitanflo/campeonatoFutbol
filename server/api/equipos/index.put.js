import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  }

  const body = await readBody(event);
  const { id, nombre } = body;

  if (!id || !nombre) {
    throw createError({ statusCode: 400, statusMessage: 'El ID y el nombre son obligatorios' });
  }

  try {
    const [result] = await db.query(
      'UPDATE equipos SET nombre = ? WHERE id = ?',
      [nombre, id]
    );

    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Equipo no encontrado' });
    }

    return { 
      success: true, 
      message: 'Equipo actualizado exitosamente'
    };

  } catch (error) {
    console.error('Error actualizando equipo:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el equipo' });
  }
});
