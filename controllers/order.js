const Order = require("../models/Order");
const getOrders = async (req, res ) => {
    try{
        const order = await Order.find({ user: req.user.id })
        .populate("items.product");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
}
const getSingleOrder = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id)
        .populate("items.product");
        if(!order) 
            return 
        res.status(404).json({ msg: "order not found"});
        res.json(order);

    } catch(error) {
res.status(500).json({error:error.message});
    }
};
module.exports = {getOrders, getSingleOrder}