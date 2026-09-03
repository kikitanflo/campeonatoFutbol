import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { partido_id } = body;

  if (!partido_id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de partido requerido' });
  }

  try {
    // Verificar si el partido ya está en curso o finalizado
    const [partidos] = await db.query('SELECT estado FROM partidos WHERE id = ?', [partido_id]);
    if (partidos.length === 0) throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado' });

    if (partidos[0].estado === 'Finalizado') {
      throw createError({ statusCode: 400, statusMessage: 'El partido ya fue finalizado' });
    }

    // Actualizar estado a En Curso
    await db.query('UPDATE partidos SET estado = "En Curso" WHERE id = ?', [partido_id]);

    return { success: true, message: 'Partido iniciado correctamente' };
  } catch (error) {
    console.error('Error al iniciar partido:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno al iniciar partido' });
  }
});
