import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  // Verificar que sea admin
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  try {
    const [usuarios] = await db.query(`
      SELECT u.id, u.username, u.rol, u.telefono, u.activo, u.equipo_id, e.nombre as equipo_nombre
      FROM usuarios u
      LEFT JOIN equipos e ON u.equipo_id = e.id
      WHERE u.rol != 'admin'
      ORDER BY u.id DESC
    `);
    
    // También devolver la lista de equipos para el select de creación de usuarios
    const [equipos] = await db.query('SELECT id, nombre FROM equipos ORDER BY nombre ASC');

    return { usuarios, equipos };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error obteniendo usuarios' });
  }
});
