require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");

const empresaRoutes = require("./src/routes/empresaRoutes");
const loginRoutes = require("./src/routes/loginRoutes");
const veiculoConvidadoRoutes = require("./src/routes/veiculoConvidadoRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const veiculoRoutes = require("./src/routes/veiculoRoutes");
const perfilRoutes = require("./src/routes/perfilRoutes");
const administradorRoutes = require("./src/routes/administradorRoutes");
const { iniciarComReconexao, lerConfig } = require("./src/kafka/consumidorPlacas");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/empresas", empresaRoutes);
app.use("/api", loginRoutes);
app.use("/api/veiculos-convidados", veiculoConvidadoRoutes);
app.use("/api/veiculos", veiculoRoutes);
app.use("/api/usuarios", perfilRoutes); 
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/administradores", administradorRoutes);

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

const servidor = app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

// Consumidor das leituras de placa (I7) via Kafka. Só liga com KAFKA_ATIVO=true.
// Roda ao lado da API: se o broker estiver fora do ar, a API continua funcionando.
let consumidorPlacas = null;
const configKafka = lerConfig();
if (configKafka.ativo) {
  consumidorPlacas = iniciarComReconexao(configKafka);
} else {
  console.log("[KAFKA] consumidor desligado (defina KAFKA_ATIVO=true para ligar)");
}

// Encerra com calma (docker stop envia SIGTERM): sai do grupo do Kafka e fecha a API.
async function encerrar() {
  try {
    if (consumidorPlacas) await consumidorPlacas.parar();
  } catch (erro) {
    console.error("[KAFKA] erro ao desconectar:", erro.message);
  }
  servidor.close(() => process.exit(0));
}
process.on("SIGTERM", encerrar);
process.on("SIGINT", encerrar);