const Order = require('../models/Order');
const totalRevenue = async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group:{
                    _id:null,
                    revenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);
        res.json({ totalRevenue: result[0]?.revenue || 0 });
    } catch (error) {
        res.status(500).json({ error: 'error.messsage'})
    }
}
module.exports = { totalRevenue }