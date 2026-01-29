const Order = require('../models/Order');
const totalRevenue = async (req, res) => {
    try {
        const  revenueData = await Order.aggregate([
            {
                $group:{
                    _id:null,
                    revenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);
        res.json({ totalRevenue:  revenueData[0]?.revenue || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}
module.exports = { totalRevenue }