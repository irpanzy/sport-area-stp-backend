const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");
const path = require("path"); // Tambahkan ini

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// 🔽 Arahkan ke folder `uploads` di luar `src/`
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

// 🔽 Routing utama
app.use("/api", routes);

module.exports = app;
