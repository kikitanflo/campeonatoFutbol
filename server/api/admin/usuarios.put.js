import db from '~/server/utils/db';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const sessionUser = JSON.parse(decodeURIComponent(authCookie));
  if (sessionUser.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  const body = await readBody(event);
  
  if (body.action === 'edit') {
    const { id, username, telefono, equipo_id, password } = body;
    try {
      if (password && password.trim() !== '') {
        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE usuarios SET username = ?, telefono = ?, equipo_id = ?, password_hash = ? WHERE id = ?', 
          [username, telefono || null, equipo_id || null, hash, id]);
      } else {
        await db.query('UPDATE usuarios SET username = ?, telefono = ?, equipo_id = ? WHERE id = ?', 
          [username, telefono || null, equipo_id || null, id]);
      }
      return { success: true, message: 'Usuario actualizado correctamente' };
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw createError({ statusCode: 400, statusMessage: 'El nombre de usuario ya existe' });
      throw createError({ statusCode: 500, statusMessage: 'Error actualizando usuario' });
    }
  } else {
    const { id, activo } = body;
    if (!id || typeof activo !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: 'Datos inválidos' });
    }

    try {
      await db.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
      return { success: true, message: 'Estado del usuario actualizado' };
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: 'Error actualizando estado' });
    }
  }
});
