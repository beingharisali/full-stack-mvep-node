const Cart = require('../models/Cart');

// create cart
exports.addToCart = async (req, res) => {
    try{
        const { productId, quantity} = req.body;
        const userId = req.user.id;
        let cart = await cart.findOne({ user: userId})
        if (!cart){
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity}]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                i => i.product.toString() === productId
            );
            if (itemIndex > -1){
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            };
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}