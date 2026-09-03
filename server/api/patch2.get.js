import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // 1. Añadir columna activo a usuarios (ignorando error si ya existe)
    try {
      await db.query(`ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT 1`);
    } catch (e) {
      if(e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // 2. Crear tabla convocatorias
    await db.query(`
      CREATE TABLE IF NOT EXISTS convocatorias (
          partido_id INT NOT NULL,
          jugador_id INT NOT NULL,
          PRIMARY KEY (partido_id, jugador_id),
          FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
          FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
      )
    `);

    return { 
      success: true, 
      message: '✅ Base de datos actualizada con éxito (V2: Gestión de Usuarios y Convocatorias).' 
    };

  } catch (error) {
    console.error('Error aplicando parche:', error);
    return { success: false, error: error.message };
  }
});
