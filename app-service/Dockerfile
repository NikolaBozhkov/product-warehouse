FROM node:16 AS build-env

WORKDIR /app
RUN chmod -R 777 /app

USER node

COPY package.json package-lock.json tsconfig.json .env src ./

RUN npm install && npm run build:prod
RUN cp .env dist && cp -r sql dist

FROM node:16-alpine

WORKDIR /app

ENV DB_USER=postgres \
    DB_HOST=localhost \
    DB_NAME=postgres \
    DB_PASSWORD=postgres \
    DB_PORT=5432

EXPOSE 8080
ENTRYPOINT ["node", "dist/main.js"]

COPY --from=build-env /app/node_modules node_modules
COPY --from=build-env /app/dist dist
COPY --from=build-env /app/package.json ./
