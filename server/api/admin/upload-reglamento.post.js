import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  // Verificar sesión de administrador
  const cookies = parseCookies(event);
  const session = cookies.admin_session;
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' });
  }

  try {
    const sessionObj = JSON.parse(decodeURIComponent(session));
    if (sessionObj.rol !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Solo para administradores' });
    }
  } catch (e) {
    throw createError({ statusCode: 401, statusMessage: 'Sesión inválida' });
  }

  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No se envió ningún archivo' });
  }

  const fileInfo = formData.find(field => field.name === 'reglamento');
  if (!fileInfo || !fileInfo.data) {
    throw createError({ statusCode: 400, statusMessage: 'Archivo no encontrado' });
  }

  if (fileInfo.type !== 'application/pdf') {
    throw createError({ statusCode: 400, statusMessage: 'El archivo debe ser un PDF válido' });
  }

  // Guardar en public/reglamento.pdf
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const filePath = path.join(publicDir, 'reglamento.pdf');
  fs.writeFileSync(filePath, fileInfo.data);

  return { success: true, message: 'Reglamento subido exitosamente' };
});
