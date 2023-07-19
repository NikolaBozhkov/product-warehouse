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
    "hazardous_state" hazardous_state NOT NULL,
    "stock_amount" BIGINT NOT NULL
);

CREATE TABLE product_warehouses (
    "product_id" INT REFERENCES products ("id"),
    "warehouse_id" INT REFERENCES warehouses ("id"),
    "amount" INT NOT NULL,

    PRIMARY KEY ("product_id", "warehouse_id")
);

CREATE TYPE logistics_type AS ENUM ('import', 'export');

CREATE TABLE warehouses_logistics_history (
    "id" SERIAL PRIMARY KEY,
    "warehouse_id" INT REFERENCES warehouses ("id"),
    "date" DATE NOT NULL DEFAULT NOW(),
    "type" logistics_type NOT NULL
);

CREATE TABLE logistics_records_products (
    "logistics_record_id" INT REFERENCES warehouses_logistics_history ("id"),
    "product_id" INT REFERENCES products ("id"),
    "amount" INT NOT NULL,

    PRIMARY KEY ("logistics_record_id", "product_id")
);
