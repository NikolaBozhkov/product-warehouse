import 'dotenv/config';
import express from 'express';
import { DbClient } from './db.js';


const app = express();
const dbClient = new DbClient();

app.get('/', (req, res) => {
    res.send('Heylo');
});

app.get('/warehouses/:id/stock-amount', async (req, res) => {
    const result = await dbClient.query(`
    SELECT SUM(p.size_per_unit*pw.amount) AS stock_amount FROM products p
    INNER JOIN product_warehouses pw
        ON pw.product_id = p.id
    WHERE pw.warehouse_id = $1;`,
        [req.params.id]);

    return res.send(result.rows[0].stock_amount);
});

app.get('/warehouses/:id/free-space', async (req, res) => {
    const result = await dbClient.query(`
    SELECT SUM(p.size_per_unit*pw.amount) AS stock_amount FROM products p
    INNER JOIN product_warehouses pw
        ON pw.product_id = p.id
    WHERE pw.warehouse_id = $1;`,
        [req.params.id]);

    return res.send(result.rows[0].stock_amount);
});

app.get('/warehouses/stock-amount', async (req, res) => {
    const result = await dbClient.query(`
    SELECT SUM(p.size_per_unit*pw.amount) AS stock_amount FROM products p
    INNER JOIN product_warehouses pw
        ON pw.product_id = p.id
    GROUP BY pw.warehouse_id;`);

    return res.send(result.rows);
});

app.get('/warehouses/combined-stock-amount', async (req, res) => {
    const result = await dbClient.query(`
    SELECT SUM(p.size_per_unit*pw.amount) AS stock_amount FROM products p
    INNER JOIN product_warehouses pw
        ON pw.product_id = p.id;`);

    return res.send(result.rows[0].stock_amount);
});

app.listen(8081, () => {
    console.log(`[server]: Server is running at http://localhost:8081`);
});
