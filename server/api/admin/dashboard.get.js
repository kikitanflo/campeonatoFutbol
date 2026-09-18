import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'admin_session');
  if (!authCookie) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  const user = JSON.parse(decodeURIComponent(authCookie));
  if (user.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Prohibido' });

  try {
    const [counts] = await db.query(`
      SELECT estado, COUNT(*) as total 
      FROM partidos 
      GROUP BY estado
    `);

    let jugados = 0;
    let pendientes = 0;
    let enCurso = 0;
    let total = 0;

    for (const row of counts) {
      total += row.total;
      if (row.estado === 'Finalizado') jugados += row.total;
      else if (row.estado === 'Pendiente') pendientes += row.total;
      else if (row.estado === 'En Curso') enCurso += row.total;
    }

    return { success: true, jugados, pendientes, enCurso, total };
  } catch (error) {
    console.error('Error dashboard:', error);
    return { success: false };
  }
});
