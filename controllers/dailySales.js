const Order = require('../models/Order')
const dailySales = async(req,res) => {
    try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
            }
        },
        {$sort: {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
        ])
        res.json({ dailySales: sales})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
module.exports = { dailySales }