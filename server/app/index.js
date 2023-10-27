require("dotenv").config();
const express = require("express");
const cookiePserser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./router");

const errorHandler = require("../middleware/error")

const app = express();

app.use(cookiePserser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);
app.use(routes);

app.use(errorHandler);

module.exports = app;
