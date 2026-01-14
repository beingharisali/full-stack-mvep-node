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
const updateOrder = async (req,res) => {
    try {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if(!order) 
        retutn 
    res.status(404).json({ msg: "Order not found"});
    res.json(order);
} catch (error) {
res.status(500).json({ error: error.message})
}
}
const deleteOrder = async (req, res) => {
    try{
         await Order.findByIdAndDelete(req.params.id);
         res.json({ msg: "Order deleted Successfully"})
    }catch (error){
        res.status(500).json({ error: error.message})
    }
}
module.exports = {getOrders, getSingleOrder, updateOrder, deleteOrder}