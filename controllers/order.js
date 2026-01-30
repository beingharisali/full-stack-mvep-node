const Order = require("../models/Order");
const Cart = require("../models/Cart")
const User = require("../models/User");

const getOrders = async (req, res ) => {
    try{
        const orders = await Order.find({ user: req.user.userId })
            .populate("items.product")
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 });
        
        const enhancedOrders = orders.map(order => ({
            _id: order._id,
            user: order.user,
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.status,
            statusHistory: order.statusHistory,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            statusInfo: {
                currentStatus: order.status,
                lastUpdated: order.statusHistory.length > 0 
                    ? order.statusHistory[order.statusHistory.length - 1].timestamp 
                    : order.createdAt,
                totalStatusChanges: order.statusHistory.length
            }
        }));
        
        res.json(enhancedOrders);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
}

const getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find()
            .populate("items.product")
            .populate("user", "firstName lastName email role")
            .sort({ createdAt: -1 });
        
        const enhancedOrders = orders.map(order => ({
            _id: order._id,
            user: {
                id: order.user._id,
                name: `${order.user.firstName} ${order.user.lastName}`,
                email: order.user.email,
                role: order.user.role
            },
            items: order.items.map(item => ({
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price
                },
                quantity: item.quantity,
                subtotal: item.quantity * item.product.price
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            statusHistory: order.statusHistory.map(history => ({
                status: history.status,
                timestamp: history.timestamp,
                updatedBy: history.updatedBy
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            statusInfo: {
                currentStatus: order.status,
                statusDisplay: getStatusDisplayName(order.status),
                lastUpdated: order.statusHistory.length > 0 
                    ? order.statusHistory[order.statusHistory.length - 1].timestamp 
                    : order.createdAt,
                totalStatusChanges: order.statusHistory.length,
                isRecent: isRecentUpdate(order.updatedAt)
            }
        }));
        
        res.json({
            orders: enhancedOrders,
            totalCount: enhancedOrders.length,
            statusSummary: getStatusSummary(enhancedOrders)
        });
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
}

const getStatusDisplayName = (status) => {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
};

const isRecentUpdate = (updatedAt) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(updatedAt).getTime()) < oneDay;
};

const getStatusSummary = (orders) => {
    const summary = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total: orders.length
    };
    
    orders.forEach(order => {
        if (summary.hasOwnProperty(order.status)) {
            summary[order.status]++;
        }
    });
    
    return summary;
};

const getSingleOrder = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id)
            .populate("items.product")
            .populate("user", "firstName lastName email");
            
        if (!order) { 
            return res.status(404).json({ msg: "Order not found"});
        }
        
        const enhancedOrder = {
            _id: order._id,
            user: {
                id: order.user._id,
                name: `${order.user.firstName} ${order.user.lastName}`,
                email: order.user.email
            },
            items: order.items.map(item => ({
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    description: item.product.description
                },
                quantity: item.quantity,
                subtotal: item.quantity * item.product.price
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            statusHistory: order.statusHistory.map(history => ({
                status: history.status,
                statusDisplay: getStatusDisplayName(history.status),
                timestamp: history.timestamp,
                formattedTimestamp: new Date(history.timestamp).toLocaleString(),
                updatedBy: history.updatedBy
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            statusDetails: {
                currentStatus: order.status,
                statusDisplay: getStatusDisplayName(order.status),
                lastUpdated: order.statusHistory.length > 0 
                    ? order.statusHistory[order.statusHistory.length - 1].timestamp 
                    : order.createdAt,
                formattedLastUpdated: order.statusHistory.length > 0 
                    ? new Date(order.statusHistory[order.statusHistory.length - 1].timestamp).toLocaleString()
                    : new Date(order.createdAt).toLocaleString(),
                totalStatusChanges: order.statusHistory.length,
                isFirstStatus: order.statusHistory.length === 1,
                canBeCancelled: ['pending', 'processing'].includes(order.status)
            }
        };
        
        res.json(enhancedOrder);
    } catch(error) {
        res.status(500).json({error: error.message});
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

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ msg: "Status is required" });
        }
        
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: "Invalid status. Valid statuses are: pending, processing, shipped, delivered, cancelled" });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }
        
        if (order.status === status) {
            return res.status(200).json({ msg: "Status unchanged", order });
        }
        
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
        ).populate("items.product").populate("user", "firstName lastName email");
        
        res.json({ 
            msg: "Order status updated successfully", 
            order: {
                _id: updatedOrder._id,
                status: updatedOrder.status,
                statusDisplay: getStatusDisplayName(updatedOrder.status),
                lastUpdated: new Date(),
                statusHistory: updatedOrder.statusHistory
            }
        });
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

    const total = cart.items.reduce((sum, item) => {
      return sum + item.quantity;   
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

    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {getOrders, getAllOrders, getSingleOrder, updateOrder, deleteOrder, createOrder, updateOrderStatus}
