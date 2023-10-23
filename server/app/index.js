require("dotenv").config();
const express = require("express");
const cookiePserser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./router");

const app = express();

app.use(cookiePserser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);
app.use(routes);

app.use((err, _req, res, _next) => {
  if (err) {
    res.status(err.status || 500).json({
      message: err.message,
    });
  }
});

module.exports = app;
