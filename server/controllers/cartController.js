import User from "../models/User.js"

// update user cartData : /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body
        const { userId } = req

        await User.findByIdAndUpdate(userId, { cartItem: cartItems });


        return res.status(200).json({ success: true, message: "Cart updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}