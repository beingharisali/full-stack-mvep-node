const express = require('express')
const router = express.Router()
const { weeklyRevenue } = require('../controllers/weeklyRevenue')
router.get('/weekly-revenue', weeklyRevenue )
module.exports = router