const express = require ('express');
const router = express.Router();
const {totalRevenue} = require('../controllers/totalRevenue')

router.get('/total-revenue', totalRevenue)
module.exports = router