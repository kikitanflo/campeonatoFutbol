import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { partido_id } = body;

  if (!partido_id) {
    throw createError({ statusCode: 400, statusMessage: 'ID del partido es requerido' });
  }

  try {
    const [result] = await db.query(
      'UPDATE partidos SET arbitraje_pagado = 1 WHERE id = ?',
      [partido_id]
    );

    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado' });
    }

    return { success: true, message: 'Pago de arbitraje registrado exitosamente' };
  } catch (error) {
    console.error('Error al registrar pago de arbitraje:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor' });
  }
});
