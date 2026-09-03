import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query('SELECT * FROM configuraciones');
    return rows;
  } catch (error) {
    return { error: error.message };
  }
});
