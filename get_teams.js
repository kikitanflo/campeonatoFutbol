import mysql from 'mysql2/promise';
import fs from 'fs';

async function getTeams() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bd_campeonatobetulia'
  });

  const [equipos] = await connection.query('SELECT id, nombre FROM equipos');
  fs.writeFileSync('teams_list.json', JSON.stringify(equipos, null, 2));
  console.log('Teams saved to teams_list.json');
  await connection.end();
}
getTeams();
