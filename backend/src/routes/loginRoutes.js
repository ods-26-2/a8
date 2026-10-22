const express = require("express");

const router = express.Router();

const { fazerLogin } = require("../controllers/LoginController");

router.post("/login", fazerLogin);

module.exports = router;