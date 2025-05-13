# Этап сборки
FROM node:18-alpine

WORKDIR /app


COPY latest/package*.json ./

RUN npm install

COPY latest/ .

RUN npm run build



