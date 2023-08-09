const express = require('express');
const path = require("path");
const app = express();
const port = 1000;
// const mysql = require("mysql2");
const env = require("dotenv");

env.config({part:"./.env"});
app.set("view engine", "hbs")

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/", require("./routes/registerRoutes"))
app.use("/auth", require("./routes/auth"))

app.get('/', (req, res) => {
    res.send("<html><body><h1>Welcome to NodeJS Registration</h1></boy></html>")
})

app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});