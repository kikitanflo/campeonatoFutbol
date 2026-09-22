import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    await db.query(`UPDATE usuarios SET equipo_id = 8 WHERE username = 'intervalle'`);
    
    // Y si hay otros, vamos a intentar arreglarlos usando similitud de nombres:
    await db.query(`
      UPDATE usuarios u
      JOIN equipos e ON REPLACE(LOWER(u.username), ' ', '') = REPLACE(LOWER(e.nombre), ' ', '')
      SET u.equipo_id = e.id
      WHERE u.equipo_id IS NULL AND u.rol = 'dirigente'
    `);

    return { success: true, message: 'Usuarios arreglados. Intervalle ahora tiene equipo_id = 8.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
