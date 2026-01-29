const express = require("express")
const router = express.Router();
const { totalSales } = require("../controllers/totalSales");
 router.get("/total-sales", totalSales);
 module.exports = router;