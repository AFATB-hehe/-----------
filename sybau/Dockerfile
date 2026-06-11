# Stage 1: Сборка
FROM node:20 AS builder

WORKDIR /app

# Копируем и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --include=dev

# Копируем исходники и собираем
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]