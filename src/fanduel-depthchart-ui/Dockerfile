# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /src
COPY package*.json .npmrc ./
RUN npm ci
COPY . .

# VITE_API_BASE is baked at build time
ARG VITE_API_BASE=http://localhost:5113/api/sports/nfl/teams/TB/depthchart
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80