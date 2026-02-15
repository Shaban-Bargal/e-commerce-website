/* eslint-disable */
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
    const { Products, navigate, currency, addToCart } = useAppContext();
    const { id } = useParams();

    const [relatedProduct, setRelatedProduct] = useState([]); 
    const [thumbnail, setThumbnail] = useState(null);

    const product = Products.find((item) => item._id === id);

    // تحديث الـ Thumbnail والمنتجات ذات الصلة عند تغيير المنتج
    useEffect(() => {
        if (product) {
            // تأكدنا من استخدام images بالجمع هنا
            if (product.images && product.images.length > 0) {
                setThumbnail(product.images[0]);
            }

            const related = Products.filter(
                (item) =>
                    item.category === product.category &&
                    item._id !== product._id
            );
            setRelatedProduct(related);
        }
    }, [id, product, Products]); // اضفنا id كمرجع للتحديث عند الانتقال بين المنتجات

    if (!product) {
        return <p className="m-6">Loading product...</p>;
    }

    return (
        <div className="m-6">
            <p>
                <Link to={"/"}>Home</Link> /
                <Link to={"/products"}> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`}>
                    {" "}{product.category}
                </Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {/* تعديل هنا: images بدل image */}
                        {product.images?.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setThumbnail(image)}
                                className={`border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer ${thumbnail === image ? 'border-gray-500/30' : ''}`}
                            >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
                        <img
                            src={thumbnail}
                            alt="Selected product"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill("").map((_, i) => (
                            <img
                                key={i}
                                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                                alt=""
                                className="md:w-4 w-3.5"
                            />
                        ))}
                        <p className="text-base ml-2">(4)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">
                            MRP: {currency}{product.price}
                        </p>
                        <p className="text-2xl font-medium">
                            MRP: {currency}{product.offerPrice}
                        </p>
                        <span className="text-gray-500/70">
                            (inclusive of all taxes)
                        </span>
                    </div>

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description?.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        <button
                            onClick={() => addToCart(product._id)}
                            className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition cursor-pointer"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => {
                                addToCart(product._id);
                                navigate("/cart");
                            }}
                            className="cursor-pointer w-full py-3.5 font-medium bg-primary text-white hover:bg-primary-dull transition"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>

            {/* =================== Related Products =================== */}
            {relatedProduct.length > 0 && (
                <div className="flex flex-col items-center mt-20">
                    <div className="flex flex-col items-center w-max">
                        <p className="text-3xl font-medium">Related Products</p>
                        <div className="w-20 h-0.5 bg-primary rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-6 mt-6 w-full">
                        {relatedProduct.map((item) => (
                            <ProductCard key={item._id} product={item} />
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            navigate(`/products`);
                            scrollTo(0, 0);
                        }}
                        className="mx-auto px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition cursor-pointer"
                    >
                        See more
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;