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

    // تجهيز بيانات السلة (مع فحص الأمان)
    const getCart = () => {
        let tempArray = [];
        for (const key in cartItems) {
            if (cartItems[key] > 0) {
                const product = Products.find((item) => item._id === key);
                if (product) { 
                    // نأخذ نسخة من المنتج ونضيف الكمية عشان منبوظش الـ State الأصلي
                    tempArray.push({ ...product, quantity: cartItems[key] });
                }
            }
        }
        setCartArray(tempArray);
    };

    const getUserAddress = async () => {
        try {
            const { data } = await axios.get("/api/address/get");
            if (data.success) {
                const addresses = data.addresses || [];
                setAddress(addresses);
                if (addresses.length > 0) {
                    setSelectedAddress(addresses[0]);
                }
            }
        } catch (error) {
            console.error("Address error:", error.message);
        }
    };

    const placeOrder = async () => {
        try {
            if (!selectedAddress) return toast.error("Please select an address");
            
            const orderData = {
                userId: User._id,
                items: cartArray.map((item) => ({ product: item._id, quantity: item.quantity })),
                address: selectedAddress,
            };

            if (paymentOption === "COD") {
                const { data } = await axios.post("/api/order/cod", { ...orderData, paymentType: "COD" });
                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    navigate("/my-orders");
                }
            } else {
                const { data } = await axios.post("/api/order/stripe", { ...orderData, paymentType: "Online" });
                if (data.success) window.location.replace(data.url);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        if (Products.length > 0) {
            getCart();
        }
    }, [cartItems, Products]);

    useEffect(() => {
        if (User) getUserAddress();
    }, [User]);

    // حسابات آمنة لتجنب الـ NaN والـ Undefined
    const subtotal = getCartAmount() || 0;
    const tax = subtotal * 0.02;
    const total = subtotal + tax;

    return Products.length > 0 ? (
        <div className="flex flex-col md:flex-row mt-16 px-4 md:px-10 gap-10">
            {/* ======= Cart Items ======= */}
            <div className='flex-1'>
                <h1 className="text-3xl font-medium mb-6 text-gray-800">
                    Shopping Cart <span className="text-sm text-primary font-normal">{getCartCount()} Items</span>
                </h1>

                {cartArray.length > 0 ? (
                    <>
                        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-400 text-sm uppercase tracking-wider pb-3 border-b border-gray-100">
                            <p>Product Details</p>
                            <p className="text-center">Subtotal</p>
                            <p className="text-center">Action</p>
                        </div>

                        {cartArray.map((product, index) => (
                            <div key={index} className="grid grid-cols-[2fr_1fr_1fr] items-center py-5 border-b border-gray-50 text-gray-700">
                                <div className="flex items-center gap-4">
                                    <div onClick={() => navigate(`/product/${product.category.toLowerCase()}/${product._id}`)} 
                                         className="cursor-pointer w-20 h-20 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden">
                                        <img className="w-full h-full object-cover" src={product.images?.[0] || assets.upload_area} alt={product.name} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500 mb-1">Price: {Currency}{product.offerPrice}</p>
                                        <div className='flex items-center gap-2 text-sm'>
                                            <span className="text-gray-400 font-normal">Qty:</span>
                                            <select 
                                                onChange={(e) => updateCartItem(product._id, Number(e.target.value))} 
                                                value={product.quantity} 
                                                className='bg-transparent border border-gray-200 rounded px-1 outline-none'
                                            >
                                                {[...Array(10).keys()].map(i => (
                                                    <option key={i+1} value={i+1}>{i+1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center font-medium">{Currency}{ (product.offerPrice * product.quantity).toFixed(2) }</p>
                                <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto p-2 hover:bg-red-50 rounded-full transition-colors">
                                    <img src={assets.remove_icon} alt="remove" className="w-5 h-5 opacity-70" />
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-400">Your cart is empty</div>
                )}

                <button onClick={() => { navigate("/products"); window.scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} className="group-hover:-translate-x-1 transition rotate-180" alt="arrow" />
                    Back to Shop
                </button>
            </div>

            {/* ======= Order Summary ======= */}
            <div className="md:w-[380px] w-full bg-white p-6 shadow-lg rounded-xl border border-gray-100 h-fit sticky top-20">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Delivery Address</p>
                        <div className="relative p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start gap-2 text-sm">
                                <p className="text-gray-600 leading-relaxed">
                                    {selectedAddress 
                                        ? `${selectedAddress.street}, ${selectedAddress.city}` 
                                        : "No address selected"}
                                </p>
                                <button onClick={() => setShowAddress(!showAddress)} className="text-primary cursor-pointer font-semibold hover:underline flex-shrink-0">
                                    Change
                                </button>
                            </div>

                            {showAddress && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                    {address.map((item, index) => (
                                        <div key={index} onClick={() => { setSelectedAddress(item); setShowAddress(false); }} 
                                             className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">
                                            {item.street}, {item.city}
                                        </div>
                                    ))}
                                    <div onClick={() => navigate("/add-address")} className="p-3 text-center text-primary font-bold hover:bg-primary/5 cursor-pointer">
                                        + Add New Address
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Method</p>
                        <select onChange={(e) => setPaymentOption(e.target.value)} className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                            <option value="COD">Cash On Delivery</option>
                            <option value="Online">Online Payment (Stripe)</option>
                        </select>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span><span>{Currency}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Tax (2%)</span><span>{Currency}{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-800 pt-3">
                            <span>Total</span><span>{Currency}{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button onClick={placeOrder} className="cursor-pointer w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-primary/20">
                        {paymentOption === "COD" ? "PLACE ORDER" : "CHECKOUT NOW"}
                    </button>
                </div>
            </div>
        </div>
    ) : null;
};

export default Cart;