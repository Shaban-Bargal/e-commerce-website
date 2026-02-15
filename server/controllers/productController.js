import { json } from "express"
import { v2 as cloudinary } from 'cloudinary';
import Product from "../models/productModel.js";


// add product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);
        const images = req.files;
        let imagesUrl = await Promise.all(
            images.map(async (file) => {
                let result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
                return result.secure_url;
            })
        )

        await Product.create({
            ...productData,
            images: imagesUrl ,
            inStock: true
        })

        return res.status(200).json({ success: true, message: "Product added successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Product : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get single Product By Id : /api/product/id
export const producById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        return res.status(200).json({ success: true, product });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}


// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        await Product.findByIdAndUpdate(id, { inStock });

        return res.status(200).json({ success: true, message: "Stock updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}