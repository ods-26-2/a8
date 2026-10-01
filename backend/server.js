require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");

const empresaRoutes = require("./src/routes/empresaRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/empresas", empresaRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      api: "ok",
      database: "ok",
    });
  } catch (error) {
    res.status(500).json({
      api: "ok",
      database: "error",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});