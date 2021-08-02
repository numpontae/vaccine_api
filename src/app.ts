import mysql from "promise-mysql";
import express from "express";
import bodyParser from "body-parser";
import {preRegister} from "./config/config";
import {di} from "./di";
import {Routes} from './routes';
const jinst = require("jdbc/lib/jinst");
const JDBC = require("jdbc");

const app = express();
const port = 30020;

app.get("/", function (req, res) {
    res.send("Hello Worlxxxxd!");
});
app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));
app.use(bodyParser.json({limit: "100mb"}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const routes = new Routes(app);
routes.setRoutes();

const cache: any = {
    url: "jdbc:Cache://10.104.10.89:1972/prod-trak",
    user: "superuser",
    password: "sys",
    minpoolsize: 10,
    maxpoolsize: 20,
    maxidle: 20 * 60 * 1000
};
const registerConfig: any = {
    user: preRegister.USER,
    password: preRegister.PASSWORD,
    host: preRegister.HOST,
    port: preRegister.PORT,
    connectionLimit: 10,
    debug: false
};
// if (! jinst.isJvmCreated()) {
//     jinst.addOption("-Xrs");
//     jinst.setupClasspath([
//         process.cwd() + "/src/jdk/cachedb.jar",
//         process.cwd() + "/src/jdk/cacheextreme.jar",
//         process.cwd() + "/src/jdk/cachegateway.jar",
//         process.cwd() + "/src/jdk/cachejdbc.jar",
//         process.cwd() + "/src/jdk/habanero.jar",
//         process.cwd() + "/src/jdk/jtds-1.3.1.jar"
//     ]);
// }
// let cacheInit = false;
// let cachedb = new JDBC(cache);


app.listen(port, async () => {
    console.log(`server start with port ${port}`);
    const pool = await mysql.createPool(registerConfig);
    pool.getConnection();
    pool.query('SELECT 1', function (error: any, results: any, fields: any) {
        if (error) 
            throw error;
        
        console.log(`mysql connected`);
        di.set('repos', pool);
    });
    // if (! cacheInit) {
    //     cachedb.initialize(function (err: any) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log('cache connect');
    //             cacheInit = true;
    //         }
    //     });
    //     di.set("cache", cachedb)
    // }

    
    // var mqtt = require('mqtt');

    // const MQTT_SERVER = "broker.hivemq.com";
    // const MQTT_PORT = "1883";
    // //if your server don't have username and password let blank.
    // const MQTT_USER = "";
    // const MQTT_PASSWORD = "";

    // // Connect MQTT
    // var client = mqtt.connect({
    //     host: MQTT_SERVER,
    //     port: MQTT_PORT,
    //     username: MQTT_USER,
    //     password: MQTT_PASSWORD
    // });

    // client.on('connect', function () {
    //     // Subscribe any topic
    //     console.log("MQTT Connect");
    //     client.subscribe('test', function (err: any) {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    // });


    // setInterval(() => {
    //     client.publish("preregdrive", "hello from NodeJS");
    //     console.log("111")
    // }, 5000);
});
