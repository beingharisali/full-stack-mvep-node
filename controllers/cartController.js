
const Cart = require('../models/Cart');

// create or add to cart
const addCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                i => i.product.toString() === productId
            );
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json(cart);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// remove a single item
const removeCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) return res.status(404).json({ msg: "Cart not found" });

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        await cart.save();
        res.json(cart);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// update item quantity
const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.userId }); //  fixed
        if (!cart) return res.status(404).json({ msg: "Cart not found" });

        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) return res.status(404).json({ msg: "Item not found" });

        item.quantity = quantity;
        await cart.save();
        res.json(cart);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// clear cart
const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { user: req.user.userId },
            { items: [] }
        );
        res.json({ msg: "Cart cleared" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({user: req.user.userId  })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { addCart, removeCart, updateCartItem, clearCart, getCart };
