const Order = require('../models/Order');
const weeklyRevenue = async (req, res) => {
    try{
        const revenue = await Order.aggregate([
            {
            $group:{
                _id: {week: {$week: "$createAt"}},
                total: { $sum: "$totalAmount"}
            } 
            },
            { $sort: {"_id.week": 1} }
        ]);
        res.json({ weeklyRevenue: revenue})
    } catch (error) {
        res.status(500).json({ error:error.message})
    }
}
module.exports = { weeklyRevenue }