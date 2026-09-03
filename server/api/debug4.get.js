import db from '~/server/utils/db';
export default defineEventHandler(async () => {
  const [usuarios] = await db.query('SELECT id, username, rol, equipo_id, activo FROM usuarios');
  return usuarios;
});
