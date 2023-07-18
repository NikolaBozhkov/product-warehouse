INSERT INTO
    products ("name", "is_hazardous", "size_per_unit")
VALUES
    ('p1', FALSE, 3),
    ('p2', TRUE, 5),
    ('p3', FALSE, 2);

INSERT INTO
    warehouses ("size")
VALUES
    (100),
    (100),
    (100);

INSERT INTO
    product_warehouses ("product_id", "warehouse_id", "amount")
VALUES
    ('1', '1', 3),
    ('1', '2', 5),
    ('2', '1', 2),
    ('2', '3', 5),
    ('3', '3', 7);
