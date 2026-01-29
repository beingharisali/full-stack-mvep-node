const Order = require('../models/Order')
const topSallingProduct = async (req, res) => {
    try {
const result = await Order.aggregate([
    { $unwind: "$items"  },
    {
        $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity"}
        }
    },
    { $sort: { totalSold: -1} },
    { $limit: 5}
])
res.json({
    topSaleProducts: result
});
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
module.exports = { topSallingProduct }
