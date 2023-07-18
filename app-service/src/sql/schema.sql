DROP TABLE IF EXISTS products, warehouses, product_warehouses;

CREATE TABLE products (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_hazardous" BOOLEAN NOT NULL,
    "size_per_unit" INT NOT NULL
);

CREATE TYPE hazardous_state AS ENUM ('neutral', 'non-hazardous', 'hazardous');

CREATE TABLE warehouses (
    "id" SERIAL PRIMARY KEY,
    "size" BIGINT NOT NULL,
    "hazardous_state" hazardous_state NOT NULL
);

CREATE TABLE product_warehouses (
    "product_id" INT REFERENCES products ("id"),
    "warehouse_id" INT REFERENCES warehouses ("id"),
    "amount" INT NOT NULL,

    PRIMARY KEY ("product_id", "warehouse_id")
);
