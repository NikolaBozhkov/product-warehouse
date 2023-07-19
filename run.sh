#!/bin/bash

docker compose down

docker compose build
docker compose up -d

echo "API available at http://localhost:8080/graphql"
