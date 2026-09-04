# Usar una imagen oficial de Node.js como base
FROM node:lts-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Compilar la aplicación Nuxt para producción
RUN npm run build

# Exponer el puerto que usa Nuxt (3000 por defecto)
EXPOSE 3000

# Comando para iniciar la aplicación en modo producción
CMD ["node", ".output/server/index.mjs"]
