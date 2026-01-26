const Order = require("../models/Order");
const Cart = require("../models/Cart")

const getOrders = async (req, res ) => {
    try{
        const order = await Order.find({ user: req.user.userId })
        .populate("items.product");
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
}

const getSingleOrder = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id)
        .populate("items.product");
        if (!order) { 
            return res.status(404).json({ msg: "order not found"});}
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
    if(!order){ 
        return 
    res.status(404).json({ msg: "Order not found"});}
    res.json(order);
} catch (error) {
res.status(500).json({ error: error.message})
}
}

// Create a specific function to update order status with timestamp tracking
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status
        if (!status) {
            return res.status(400).json({ msg: "Status is required" });
        }
        
        // Check if status is valid
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: "Invalid status. Valid statuses are: pending, processing, shipped, delivered, cancelled" });
        }
        
        // Find the order first to check current status
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }
        
        // If status is the same, don't update
        if (order.status === status) {
            return res.status(200).json({ msg: "Status unchanged", order });
        }
        
        // Update the order with new status and add to status history
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status,
                $push: {
                    statusHistory: {
                        status,
                        timestamp: new Date(),
                        updatedBy: req.user.userId
                    }
                }
            },
            { new: true, runValidators: true }
        ).populate("items.product");
        
        res.json({ msg: "Order status updated successfully", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    // Calculate total amount (better version)
    const total = cart.items.reduce((sum, item) => {
      return sum + item.quantity;   // or item.quantity * item.product.price
    }, 0);

    const order = await Order.create({
      user: req.user.userId,
      items: cart.items,
      totalAmount: total,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        updatedBy: req.user.userId
      }]
    });

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {getOrders, getSingleOrder, updateOrder, deleteOrder, createOrder, updateOrderStatus}