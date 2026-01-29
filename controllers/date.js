const Order = require ('../models/Order')
const date = async (req, res) => {
    try {
    const { from, to } = req.query;

    const orders = await Order.find({
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    });

    res.json({ orders });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = { date }