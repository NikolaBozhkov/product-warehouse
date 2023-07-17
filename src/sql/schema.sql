DROP TABLE IF EXISTS products, warehouses, product_warehouses;

CREATE TABLE products (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_hazardous" BOOLEAN NOT NULL,
    "size_per_unit" INT NOT NULL
);

CREATE TABLE warehouses (
    "id" SERIAL PRIMARY KEY,
    "size" BIGINT NOT NULL
);

CREATE TABLE product_warehouses (
    "product_id" INT REFERENCES products ("id"),
    "warehouse_id" INT REFERENCES warehouses ("id"),
    "amount" INT NOT NULL,

    PRIMARY KEY ("product_id", "warehouse_id")
);
