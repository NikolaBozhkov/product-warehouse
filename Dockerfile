FROM node:14 AS build-env

WORKDIR /app
RUN chmod -R 777 /app

USER node

COPY ./package.json ./package-lock.json ./tsconfig.json src ./

RUN npm install && npm run build

FROM node:14-alpine

WORKDIR /app

ENV DB_USER=postgres \
    DB_HOST=localhost \
    DB_NAME=postgres \
    DB_PASSWORD=postgres \
    DB_PORT=5432

EXPOSE 8080
ENTRYPOINT ["node", "dist/main"]

COPY --from=build-env /app/node_modules ./node_modules
COPY --from=build-env /app/dist ./dist
