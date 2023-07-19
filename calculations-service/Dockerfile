FROM node:16-alpine

WORKDIR /app
RUN chmod -R 777 /app

USER node

COPY package.json package-lock.json index.js db.js .env ./

RUN npm install

ENV DB_USER=postgres \
    DB_HOST=localhost \
    DB_NAME=postgres \
    DB_PASSWORD=postgres \
    DB_PORT=5432

EXPOSE 8081
ENTRYPOINT ["node", "index"]
