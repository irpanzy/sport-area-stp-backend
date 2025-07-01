const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use("/api/auth", require("./routes/auth.route"));

module.exports = app;