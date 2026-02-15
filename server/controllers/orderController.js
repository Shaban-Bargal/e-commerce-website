import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Stripe from "stripe";
import User from "../models/User.js";

// ======================================
// PLACE ORDER - COD
// api/order/cod
// ======================================
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body;

        if (!address || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }

        let amount = 0;

        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            const finalPrice =
                product.offerPrice && product.offerPrice > 0
                    ? product.offerPrice
                    : product.price;

            amount += finalPrice * item.quantity;
        }

        // tax 2%
        const tax = Math.floor(amount * 0.02);
        amount += tax;

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            isPaid: false
        });

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// PLACE ORDER - STRIPE
// api/order/stripe
// ======================================
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        if (!address || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }

        let amount = 0;
        let productData = [];

        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            const finalPrice =
                product.offerPrice && product.offerPrice > 0
                    ? product.offerPrice
                    : product.price;

            productData.push({
                name: product.name,
                quantity: item.quantity,
                price: finalPrice
            });

            amount += finalPrice * item.quantity;
        }

        // tax 2%
        const tax = Math.floor(amount * 0.02);
        amount += tax;

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            isPaid: false
        });

        const stripeInstance = new Stripe(process.env.STRIPE_SERCRET_KEY);

        const line_items = productData.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.floor(item.price * 100)
            },
            quantity: item.quantity
        }));

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId
            }
        });

        return res.status(200).json({
            success: true,
            url: session.url
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// STRIPE WEBHOOK
// ======================================
export const stripeWebhooks = async (req, res) => {

    const stripeInstance = new Stripe(process.env.STRIPE_SERCRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.log(error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {

        case "checkout.session.completed": {

            const session = event.data.object;
            const { orderId, userId } = session.metadata;

            await Order.findByIdAndUpdate(orderId, {
                isPaid: true
            });

            await User.findByIdAndUpdate(userId, {
                cartItems: {}
            });

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};


// ======================================
// GET USER ORDERS
// api/order/user
// ======================================
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req;

        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        })
            .populate("items.product address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// GET ALL ORDERS (ADMIN)
// api/order/seller
// ======================================
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        })
            .populate("items.product address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
