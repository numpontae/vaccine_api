import mysql from "promise-mysql";
import express from "express";
import bodyParser from "body-parser";
import { preRegister } from "./config/config";
import { di } from "./di";
import { Routes } from './routes';

const app = express();
const port = 30020;
const routes = new Routes(app);
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
routes.setRoutes();


const registerConfig: any = {
  user: preRegister.USER,
  password: preRegister.PASSWORD,
  host: preRegister.HOST,
  database: preRegister.DATABASE_NAME,
  port: preRegister.PORT,
  connectionLimit : 10,
  debug: false
};
console.log(registerConfig)

app.listen(port, async () => {
  console.log(`server start with port ${port}`);
  const pool = await mysql.createPool(registerConfig);
  pool.getConnection();
  pool.query('SELECT 1', function (error: any, results: any, fields: any) {
    if (error) throw error;
    console.log(`mysql connected`);
    di.set('repos', pool);
  });
});
