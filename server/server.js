import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import UserRouter from "./Routes/UserRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import sellerRouter from "./Routes/sellerRoutes.js";
import productRouter from "./Routes/productRoute.js";
import cartRouter from "./Routes/cartRoute.js";
import addressRouter from "./Routes/addressRoute.js";
import orderRouter from "./Routes/orderRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";

dotenv.config(); // لازم تبقى قبل استخدام process.env

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cookieParser());

// ⚠️ مهم: Stripe webhook لازم يكون قبل express.json
app.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhooks
);

// بعد كده نستخدم json parser
app.use(express.json());

// CORS يسمح بالـ localhost و Vercel
app.use(
    cors({
        origin: [
            "https://e-commerce-website-nu-fawn.vercel.app",
            "http://localhost:5173",
        ],
        credentials: true,
    })
);

// Connect Database & Cloudinary
await connectDB();
await connectCloudinary();

// Test Route
app.get("/", (req, res) => {
    res.send("API is running");
});

// Routes
app.use("/api/user", UserRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
