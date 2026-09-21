import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  }

  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'El ID es obligatorio para eliminar' });
  }

  try {
    // Primero hay que revisar si tiene jugadores, o eliminar en cascada si la base de datos no lo hace
    // Asumiremos que MySQL tiene CASCADE en las llaves foraneas o que se puede eliminar directamente.
    // Si no, fallará por constraint, lo cual está bien para proteger la integridad.
    const [result] = await db.query('DELETE FROM equipos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Equipo no encontrado' });
    }

    return { 
      success: true, 
      message: 'Equipo eliminado exitosamente'
    };

  } catch (error) {
    console.error('Error eliminando equipo:', error);
    // Si es error de llave foránea (1451), dar un mensaje más claro
    if (error.errno === 1451) {
      throw createError({ statusCode: 400, statusMessage: 'No se puede eliminar porque el equipo ya tiene jugadores, convocatorias o partidos registrados.' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error al eliminar el equipo' });
  }
});
