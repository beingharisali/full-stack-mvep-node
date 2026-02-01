
const Cart = require('../models/Cart');

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
        
        const populatedCart = await Cart.findById(cart._id).populate("items.product");
        const transformedCart = {
            _id: populatedCart._id,
            user: populatedCart.user,
            items: populatedCart.items.map(item => ({
                _id: item.product?._id || item._id,
                product: item.product,
                quantity: item.quantity,
                name: item.product?.name || '',
                price: item.product?.price || 0,
                images: item.product?.images || [],
                stock: item.product?.stock || 0
            })),
            createdAt: populatedCart.createdAt,
            updatedAt: populatedCart.updatedAt
        };
        
        res.status(200).json(transformedCart);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) return res.status(404).json({ msg: "Cart not found" });

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        await cart.save();
        
        const populatedCart = await Cart.findById(cart._id).populate("items.product");
        const transformedCart = {
            _id: populatedCart._id,
            user: populatedCart.user,
            items: populatedCart.items.map(item => ({
                _id: item.product?._id || item._id,
                product: item.product,
                quantity: item.quantity,
                name: item.product?.name || '',
                price: item.product?.price || 0,
                images: item.product?.images || [],
                stock: item.product?.stock || 0
            })),
            createdAt: populatedCart.createdAt,
            updatedAt: populatedCart.updatedAt
        };
        
        res.json(transformedCart);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.userId }); 
        if (!cart) return res.status(404).json({ msg: "Cart not found" });

        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) return res.status(404).json({ msg: "Item not found" });

        item.quantity = quantity;
        await cart.save();
        
        const populatedCart = await Cart.findById(cart._id).populate("items.product");
        const transformedCart = {
            _id: populatedCart._id,
            user: populatedCart.user,
            items: populatedCart.items.map(item => ({
                _id: item.product?._id || item._id,
                product: item.product,
                quantity: item.quantity,
                name: item.product?.name || '',
                price: item.product?.price || 0,
                images: item.product?.images || [],
                stock: item.product?.stock || 0
            })),
            createdAt: populatedCart.createdAt,
            updatedAt: populatedCart.updatedAt
        };
        
        res.json(transformedCart);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
    const cart = await Cart.findOne({user: req.user.userId})
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({ 
        _id: null,
        user: req.user.userId,
        items: []
      });
    }

    const transformedCart = {
      _id: cart._id,
      user: cart.user,
      items: cart.items.map(item => ({
        _id: item.product?._id || item._id,
        product: item.product,
        quantity: item.quantity,
        name: item.product?.name || '',
        price: item.product?.price || 0,
        images: item.product?.images || [],
        stock: item.product?.stock || 0
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    res.json(transformedCart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { addCart, removeCart, updateCartItem, clearCart, getCart };
