FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:pages

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
