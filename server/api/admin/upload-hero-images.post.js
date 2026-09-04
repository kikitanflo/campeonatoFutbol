import fs from 'node:fs';
import path from 'node:path';
import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const session = cookies.admin_session;
  if (!session) throw createError({ statusCode: 401, statusMessage: 'No autorizado' });

  try {
    const sessionObj = JSON.parse(decodeURIComponent(session));
    if (sessionObj.rol !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Solo para administradores' });
  } catch (e) {
    throw createError({ statusCode: 401, statusMessage: 'Sesión inválida' });
  }

  const formData = await readMultipartFormData(event);
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No se enviaron archivos' });

  const heroFiles = formData.filter(field => field.name === 'hero_images');
  if (!heroFiles.length) throw createError({ statusCode: 400, statusMessage: 'Archivos no encontrados' });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const uploadedPaths = [];

  const isProd = process.env.NODE_ENV === 'production';
  const publicDir = isProd 
    ? path.join(process.cwd(), '.output', 'public', 'uploads', 'hero') 
    : path.join(process.cwd(), 'public', 'uploads', 'hero');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Borrar los anteriores para no llenar el disco con basura (opcional pero recomendado)
  const existingFiles = fs.readdirSync(publicDir);
  for (const file of existingFiles) {
    fs.unlinkSync(path.join(publicDir, file));
  }

  for (let i = 0; i < heroFiles.length; i++) {
    const fileInfo = heroFiles[i];
    if (!allowedTypes.includes(fileInfo.type)) continue;

    const ext = fileInfo.filename ? path.extname(fileInfo.filename) : '.png';
    const fileName = `hero_${Date.now()}_${i}${ext}`;
    const filePath = path.join(publicDir, fileName);
    
    fs.writeFileSync(filePath, fileInfo.data);
    uploadedPaths.push(`/uploads/hero/${fileName}`);
  }

  if (!uploadedPaths.length) {
    throw createError({ statusCode: 400, statusMessage: 'Ningún archivo era una imagen válida' });
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS configuraciones (
          clave VARCHAR(50) PRIMARY KEY,
          valor TEXT
      )
    `);

    // Usar JSON stringificado
    const jsonValue = JSON.stringify(uploadedPaths);
    await db.query(
      `INSERT INTO configuraciones (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?`,
      ['hero_images', jsonValue, jsonValue]
    );

    return { success: true, message: 'Imágenes del carrusel principal subidas exitosamente', paths: uploadedPaths };
  } catch (error) {
    console.error('Error guardando hero_images:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error interno guardando configuración' });
  }
});
