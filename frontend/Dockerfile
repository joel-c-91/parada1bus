# Imagen de DESARROLLO para el frontend de Parada 1 Bus (Vite dev server).
FROM node:22-alpine

WORKDIR /app

# package.json primero para que la capa de dependencias se cachee y no se
# reinstale node_modules en cada cambio de codigo.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host 0.0.0.0 es obligatorio: Vite por defecto escucha solo en el loopback
# del container, que desde el host no es alcanzable.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
