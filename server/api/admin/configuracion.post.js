import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' });

  const body = await readBody(event);
  
  try {
    // Asegurar que la tabla existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS configuraciones (
          clave VARCHAR(50) PRIMARY KEY,
          valor TEXT
      )
    `);

    // Upsert configurations
    for (const [clave, valor] of Object.entries(body)) {
      if (valor !== undefined && valor !== null) {
        await db.query(
          `INSERT INTO configuraciones (clave, valor) VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE valor = ?`,
          [clave, valor, valor]
        );
      }
    }
    
    return { success: true, message: 'Configuraciones guardadas' };
  } catch (error) {
    console.error('Error guardando configuraciones:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error DB: ' + error.message });
  }
});
