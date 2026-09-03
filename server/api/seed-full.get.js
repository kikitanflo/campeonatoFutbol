import db from '~/server/utils/db';
import bcrypt from 'bcryptjs';

const nombres = ['Carlos', 'Juan', 'Andres', 'Luis', 'Pedro', 'Miguel', 'Jose', 'David', 'Jorge', 'Daniel', 'Alejandro', 'Diego', 'Sebastian', 'Mateo', 'Nicolas', 'Samuel', 'Martin', 'Tomas', 'Camilo', 'Felipe'];
const apellidos = ['Gomez', 'Rodriguez', 'Fernandez', 'Lopez', 'Martinez', 'Perez', 'Garcia', 'Sanchez', 'Romero', 'Sosa', 'Alvarez', 'Torres', 'Ruiz', 'Ramirez', 'Flores', 'Benitez', 'Acosta', 'Medina', 'Herrera', 'Rojas'];

function getRandomName() {
  const n = nombres[Math.floor(Math.random() * nombres.length)];
  const a = apellidos[Math.floor(Math.random() * apellidos.length)];
  return `${n} ${a}`;
}

export default defineEventHandler(async (event) => {
  try {
    // === 1. LIMPIAR LA BASE DE DATOS ===
    // Borrar manualmente en orden por si la BD no tiene llaves foráneas con CASCADE
    await db.query('DELETE FROM convocatorias');
    await db.query('DELETE FROM eventos_partido');
    await db.query('DELETE FROM partidos');
    await db.query('DELETE FROM jugadores');
    await db.query('DELETE FROM equipos');
    // Borramos todos los usuarios excepto el admin
    await db.query('DELETE FROM usuarios WHERE rol != "admin"');
    
    // Reiniciar contadores de ID para que empiecen desde 1 de nuevo
    await db.query('ALTER TABLE equipos AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE jugadores AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE partidos AUTO_INCREMENT = 1');

    // === 2. CREAR EXACTAMENTE 6 EQUIPOS ===
    const equiposNombres = ['Los Galacticos', 'Real FC', 'Sporting Club', 'Deportivo Sur', 'Atlético Norte', 'Los Leones'];
    const hashDirigente = bcrypt.hashSync('123456', 10);
    
    let infoDirigentes = [];
    const equiposCreados = [];

    for (let i = 0; i < equiposNombres.length; i++) {
      const nombreEquipo = equiposNombres[i];
      
      // Crear el Equipo
      const [resultEquipo] = await db.query('INSERT INTO equipos (nombre) VALUES (?)', [nombreEquipo]);
      const equipoId = resultEquipo.insertId;
      equiposCreados.push(equipoId);

      // Crear un dirigente para este equipo
      const usernameDirigente = `dirigente${equipoId}`;
      await db.query(
        'INSERT INTO usuarios (username, password_hash, rol, equipo_id, telefono, activo) VALUES (?, ?, "dirigente", ?, "573000000000", 1)',
        [usernameDirigente, hashDirigente, equipoId]
      );
      
      infoDirigentes.push(`- Equipo: ${nombreEquipo} -> Usuario: ${usernameDirigente} | Clave: 123456`);

      // Crear 30 jugadores
      let jugadoresValues = [];
      for (let j = 1; j <= 30; j++) {
        const nombreJugador = getRandomName();
        let dorsal = j; 
        if (j > 11) dorsal = Math.floor(Math.random() * 80) + 12; // Dorsales aleatorios para suplentes
        jugadoresValues.push([equipoId, nombreJugador, dorsal, 'Jugador']);
      }
      await db.query('INSERT INTO jugadores (equipo_id, nombre, dorsal, posicion) VALUES ?', [jugadoresValues]);
    }
    
    // === 3. CREAR UN ÁRBITRO PARA PRUEBAS ===
    await db.query(
      'INSERT INTO usuarios (username, password_hash, rol, activo) VALUES (?, ?, "arbitro", 1)',
      ['arbitro1', hashDirigente]
    );

    // === 4. CREAR PARTIDOS ===
    if (equiposCreados.length === 6) {
        await db.query('INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, estado) VALUES (?, ?, 1, "Pendiente")', [equiposCreados[0], equiposCreados[1]]);
        await db.query('INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, estado) VALUES (?, ?, 1, "Pendiente")', [equiposCreados[2], equiposCreados[3]]);
        await db.query('INSERT INTO partidos (equipo_local_id, equipo_visitante_id, jornada, estado) VALUES (?, ?, 1, "Pendiente")', [equiposCreados[4], equiposCreados[5]]);
    }

    return { 
      success: true, 
      mensaje: '¡Limpieza y generación completada! Hay EXACTAMENTE 6 equipos ahora.',
      arbitro: 'Usuario: arbitro1 | Clave: 123456',
      dirigentes: infoDirigentes
    };

  } catch (error) {
    console.error('Error generando datos:', error);
    return { success: false, error: error.message };
  }
});
