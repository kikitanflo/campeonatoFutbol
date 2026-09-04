import fs from 'node:fs';
import path from 'node:path';
import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const slug = event.context.params.slug;
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Ruta no proporcionada' });

  // Buscar si estamos en producción (.output) o en desarrollo (public)
  const isProd = process.env.NODE_ENV === 'production';
  const baseDir = isProd ? path.join(process.cwd(), '.output', 'public', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
  
  const filePath = path.join(baseDir, slug);

  // Seguridad basica para evitar directory traversal
  if (!filePath.startsWith(baseDir)) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' });
  }

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Archivo no encontrado' });
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'No es un archivo válido' });
  }

  // Determinar Content-Type
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.pdf') contentType = 'application/pdf';

  setResponseHeader(event, 'Content-Type', contentType);
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000');

  const stream = fs.createReadStream(filePath);
  return sendStream(event, stream);
});
