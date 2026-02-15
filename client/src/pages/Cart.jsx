/* eslint-disable */

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import toast from "react-hot-toast";

const Cart = () => {
    const { Products, Currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount, User, setCartItems } = useAppContext();

    const [showAddress, setShowAddress] = useState(false);
    const [cartArray, setCartArray] = useState([]);
    const [address, setAddress] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentOption, setPaymentOption] = useState("COD");

    // تجهيز بيانات السلة
    const getCart = () => {
        let tempArray = [];
        for (const key in cartItems) {
            const product = Products.find((item) => item._id === key);
            if (product) { // تأكد من وجود المنتج
                product.quantity = cartItems[key];
                tempArray.push(product);
            }
        }
        setCartArray(tempArray);
    };

    // جلب العناوين من السيرفر
    const getUserAddress = async () => {
        try {
            const { data } = await axios.get("/api/address/get");
            if (data.success) {
                const addresses = data.addresses || []; // 🔹 استخدم "addresses" زي السيرفر
                setAddress(addresses);
                if (addresses.length > 0) {
                    setSelectedAddress(addresses[0]);
                }
            } else {
                toast.error(data.message || "Failed to get addresses");
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    // وضع الطلب
    const placeOrder = async () => {
        try {
            if (!selectedAddress) {
                toast.error("Please select an address");
                return;
            }
            if (paymentOption === "COD") {
                const { data } = await axios.post("/api/order/cod", {
                    userId: User._id,
                    items: cartArray.map((item) => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress,
                    paymentType: "COD"
                });
                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    navigate("/my-orders");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post("/api/order/stripe", {
                    userId: User._id,
                    items: cartArray.map((item) => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress,
                    paymentType: "Online"
                });
                if (data.success) {
                    window.location.replace(data.url);
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    useEffect(() => {
        if (Products.length > 0 && cartItems) {
            getCart();
        }
    }, [cartItems, Products]);

    useEffect(() => {
        if (User) {
            getUserAddress();
        }
    }, [User]);

    return Products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16">
            {/* ======= Cart Items ======= */}
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => {
                                navigate(`/product/${product.category.toLowerCase()}/${product._id}`);
                                scrollTo(0, 0);
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                                <img className="max-w-full h-full object-cover" src={product.images[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select onChange={(e) => updateCartItem(product._id, Number(e.target.value))} value={cartItems[product._id]} className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, i) => (
                                                <option key={i} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">${product.offerPrice * product.quantity}</p>
                        <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>
                ))}

                <button onClick={() => { navigate("/products"); scroll(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} className="group-hover:translate-x-1 transition" alt="arrow" />
                    Continue Shopping
                </button>
            </div>

            {/* ======= Order Summary ======= */}
            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street} , ${selectedAddress.city} , ${selectedAddress.state} , ${selectedAddress.country}` : "No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                {address.map((item, index) => (
                                    <p key={index} onClick={() => { setSelectedAddress(item); setShowAddress(false); }} className="text-gray-500 p-2 hover:bg-gray-100">
                                        {item.street} , {item.city} , {item.state} , {item.country}
                                    </p>
                                ))}
                                <p onClick={() => navigate("/add-address")} className="text-primary-500 text-center cursor-pointer p-2 hover:bg-primary-dull">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
                    <select onChange={(e) => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>${getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>${(getCartAmount() * 0.02).toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>${(getCartAmount() * 1.02).toFixed(2)}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : null;
};

export default Cart;
