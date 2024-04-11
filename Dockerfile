# Utilizar node:alpine como imagen base
FROM node:20-alpine as production

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install

# Copiar el código fuente
COPY . .

# Crear el build de producción
RUN npm run build

# Exponer el puerto de la aplicación
EXPOSE 3000

# Ejecutar la aplicación
CMD [ "node", "dist/main.js" ]
