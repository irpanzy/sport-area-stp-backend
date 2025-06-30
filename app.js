const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/7", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

module.exports = app;
