import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const logos = {
    'CLUB ARABIA': '/img/logos/club_arabia_1789760997148.jpg',
    'ARABIA': '/img/logos/club_arabia_1789760997148.jpg', 
    'LA SELVA FC': '/img/logos/la_selva_1789761006196.jpg',
    'BETULIA': '/img/logos/betulia_1789761015849.jpg',
    'MONTESUMA': '/img/logos/montesuma_1789761024945.jpg',
    'DEPOR IMPALA': '/img/logos/depor_impala_1789761034206.jpg',
    'LOS AMIGOS': '/img/logos/los_amigos_1789761114308.jpg',
    'INGCALIFICADA Y HERRERIA': '/img/logos/ingcalificada_1789761124867.jpg',
    'INTERVALLE': '/img/logos/intervalle_1789761133860.jpg',
    'INTER VALLE': '/img/logos/inter_valle_1789761143293.jpg',
    'FUSION PEREIRA': '/img/logos/fusion_pereira_1789761152903.jpg'
  };

  try {
    for (const [nombre, url] of Object.entries(logos)) {
      await db.query('UPDATE equipos SET logo_url = ? WHERE nombre LIKE ?', [url, `%${nombre}%`]);
    }
    return { success: true, message: '¡Todos los logos han sido actualizados mágicamente en la base de datos!' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
});
