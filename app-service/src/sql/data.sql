INSERT INTO
    products ("name", "is_hazardous", "size_per_unit")
VALUES
    ('p1', FALSE, 3),
    ('p2', FALSE, 5),
    ('p3', TRUE, 2),
    ('p4', TRUE, 3);

INSERT INTO
    warehouses ("size", "hazardous_state", "stock_amount")
VALUES
    (100, 'non-hazardous', 19),
    (100, 'non-hazardous', 30),
    (100, 'hazardous', 31),
    (100, 'neutral', 0);

INSERT INTO
    product_warehouses ("product_id", "warehouse_id", "amount")
VALUES
    (1, 1, 3),
    (2, 1, 2),
    (1, 2, 10),
    (3, 3, 5),
    (4, 3, 7);
