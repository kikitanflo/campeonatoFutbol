import db from '~/server/utils/db';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Usuario y contraseña requeridos' });
  }

  try {
    // Buscar usuario en la base de datos
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      throw createError({ statusCode: 401, statusMessage: 'Error 1: Usuario no existe (' + username + ')' });
    }

    const user = rows[0];

    if (user.activo === 0) {
      throw createError({ statusCode: 403, statusMessage: 'Tu cuenta ha sido desactivada por el administrador.' });
    }

    // Verificar contraseña con bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw createError({ statusCode: 401, statusMessage: 'Error 2: Password no coincide (' + password + ')' });
    }

    // Guardamos una cookie simple de sesión con los datos de rol
    setCookie(event, 'admin_session', JSON.stringify({
      username: user.username,
      rol: user.rol,
      equipo_id: user.equipo_id
    }), {
      maxAge: 60 * 60 * 24, // 1 día
      httpOnly: false, // DEBE SER FALSE para que el middleware de Nuxt la lea en el cliente
      path: '/'
    });

    let redirectUrl = '/admin';
    if (user.rol === 'dirigente') redirectUrl = '/dirigente';
    if (user.rol === 'arbitro') redirectUrl = '/arbitro';

    return { success: true, message: 'Login exitoso', redirect: redirectUrl };

  } catch (error) {
    console.error('Login error:', error);
    // Si el error ya es un HttpError de Nuxt (ej. 401), lo relanzamos
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor' });
  }
});
