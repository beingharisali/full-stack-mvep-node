const express = require('express');
const router = express.Router();
const { date } = require('../controllers/date')

router.get('/new-date', date)
module.exports = router;