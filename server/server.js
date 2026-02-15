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

const app = express();
// Middleware 
app.use(cookieParser());
app.use(express.json());

app.post('stripe' , express.raw({ type: 'application/json' }), stripeWebhooks);

const PORT = process.env.PORT || 4000;
dotenv.config();
await connectDB(); 
await connectCloudinary();

app.use(cors({ origin: "https://e-commerce-website-nu-fawn.vercel.app" || "http://localhost:5173", credentials: true }));

app.get("/", (req, res) => {
    res.send("API is running");
});


app.use("/api/user", UserRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});