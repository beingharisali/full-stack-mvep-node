const Cart = require('../models/Cart');

// create cart
const addCart = async (req, res) => {
    try{
        const { productId, quantity} = req.body;
        const userId = req.user.id;
        let cart = await Cart.findOne({ user: userId})
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
const removeCart = async (req, res) => {
    try{
        const { productId } = req.params;
        const cart = await Cart.findOne({ user: req.user.id})
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        await cart.save();
        res.json(cart);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
 };
 const updateCartItem =  async (req, res) => {
    try { 
        const { productId, quantity } = req.body;
    const cart = await cart.findOne({ user: res.user.id})
const itemIndex = cart.items.find(
    i => i.product.toString() === productId
);
if (!item) 
return 
res.status(404).json({ msg: "Item not found"});
 item.quantity = quantity;
 await cart.save();
 res.json(cart);

    } catch (error) {
        res.status(500).json({error: error.message})
    }
 }
 exports.module = { 
    addCart,
    removeCart,
    updateCartItem
  }