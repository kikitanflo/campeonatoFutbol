import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const [equipos] = await db.query('SELECT * FROM equipos');
    const [usuarios] = await db.query('SELECT id, username, rol, equipo_id FROM usuarios');
    const [jugadores] = await db.query('SELECT equipo_id, COUNT(*) as total FROM jugadores GROUP BY equipo_id');
    const [partidos] = await db.query('SELECT * FROM partidos');

    return {
      equipos,
      usuarios,
      conteoJugadores: jugadores,
      partidos
    };
  } catch (error) {
    return { error: error.message };
  }
});
