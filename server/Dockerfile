FROM node:20-slim

# Встановлюємо робочу папку
WORKDIR /usr/src/app

# Копіюємо файли залежностей і встановлюємо їх
COPY package*.json ./
RUN npm ci

# Копіюємо весь код і збираємо проєкт
COPY . .
RUN npm run build

# Виставляємо порт і запускаємо в продакшені
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]

