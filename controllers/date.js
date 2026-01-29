const Order = require ('../models/Order')
const date = async (req, res) => {
    try {
    const { from, to } = req.query;
const fromDate = new Date(from);
const toDate = new Date(to);

const orders = await Order.find({
  createdAt: { $gte: fromDate, $lte: toDate }
});

    res.json({ orders });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = { date }