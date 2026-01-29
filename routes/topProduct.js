const express = require('express')
const router = express.Router()
const { topSallingProduct } = require('../controllers/topProduct')

router.get('/top-products', topSallingProduct )
module.exports = router;