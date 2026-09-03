import db from '~/server/utils/db';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const sessionUser = JSON.parse(decodeURIComponent(authCookie));
  if (sessionUser.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  const body = await readBody(event);
  const { username, password, rol, equipo_id, telefono } = body;

  if (!username || !password || !rol) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan campos obligatorios' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const finalEquipoId = rol === 'dirigente' ? (equipo_id || null) : null;

    await db.query(
      'INSERT INTO usuarios (username, password_hash, rol, equipo_id, telefono, activo) VALUES (?, ?, ?, ?, ?, 1)',
      [username, hash, rol, finalEquipoId, telefono || null]
    );

    return { success: true, message: 'Usuario creado exitosamente' };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 400, statusMessage: 'El nombre de usuario ya existe' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Error creando usuario' });
  }
});
