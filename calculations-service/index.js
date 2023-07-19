import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { DbClient } from './db.js';

const app = express();
app.use(bodyParser.json());

const dbClient = new DbClient();

async function getStockAmountForWarehouse(id) {
    const result = await dbClient.query(`
    SELECT COALESCE(SUM(p.size_per_unit*pw.amount), 0) AS stock_amount FROM products p
    INNER JOIN product_warehouses pw
        ON pw.product_id = p.id
    WHERE pw.warehouse_id = $1;`,
        [id]);
    return result.rows[0].stock_amount;
}

app.get('/warehouses/:id/stock-amount', async (req, res) => {
    const stockAmount = await getStockAmountForWarehouse(req.params.id);
    return res.send(stockAmount.toString());
});

app.get('/warehouses/:id/free-space', async (req, res) => {
    let warehouseSize = await dbClient.query(`SELECT size FROM warehouses WHERE id = $1`, [req.params.id]);
    warehouseSize = +warehouseSize.rows[0].size;
    const stockAmount = await getStockAmountForWarehouse(req.params.id);

    return res.send((warehouseSize - stockAmount).toString());
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

    return res.send(result.rows[0].stock_amount || '0');
});

app.post('/products/calculate-space', async (req, res) => {
    const products = req.body.products;
    const space = products.reduce((result, product) => {
        result += product.sizePerUnit * product.amount;
        return result;
    }, 0);

    return res.send(space.toString());
});

app.listen(8081, () => {
    console.log(`Server is running at http://localhost:8081`);
});
