const Order = require("../models/Order")
const totalSales =  async (req, res) => {
try {
    const totalOrders = await Order.countDocuments();
    res.json({ 
        totalSales: totalOrders
    });
} catch(error) {
    res.status(500).json({ error: error.message });
}
}
module.exports = { totalSales }