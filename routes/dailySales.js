const express = require('express')
const router = express.Router();
const { dailySales } = require('../controllers/dailySales')

router.get("/daily-sales", dailySales)
module.exports = router