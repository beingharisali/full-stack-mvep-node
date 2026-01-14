const Order = require("../models/Order");
const Cart = require("../models/Cart")
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
const createOrder = async(req, res) => {
    try{
        const cart = await Cart.findOne({ user: req.user.id})
        if(!cart || cart.items.length === 0)
            return 
        res.status(400).json({ msg: "Cart is empty"});
            const total = cart.items.reduce((sum, item) => {
                return sum + item.quantity;
    }, 0);
            const order = await order.create({
                user: req.user.id,
                items: cart.items,
                totalAmount: total
            });
            cart.items = [];
            await cart.save();
            res.status(201).json(order);
    } catch (error){
        res.status(500).json({ error: error.message})
    }
}

module.exports = {getOrders, getSingleOrder, updateOrder, deleteOrder, createOrder}