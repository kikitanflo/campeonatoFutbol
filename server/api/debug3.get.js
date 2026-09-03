import db from '~/server/utils/db';
export default defineEventHandler(async () => {
  const [partidos] = await db.query('SELECT * FROM partidos');
  return partidos;
});
