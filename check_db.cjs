const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'campeonatofutbol'
  });

  const [equipos] = await connection.query('SELECT count(*) as total FROM equipos');
  console.log('Total equipos:', equipos[0].total);

  const [partidos] = await connection.query('SELECT jornada, count(*) as total FROM partidos GROUP BY jornada');
  console.log('Partidos por jornada:', partidos);

  await connection.end();
}
check();
