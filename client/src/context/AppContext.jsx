/* eslint-disable */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [User, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [ShowUserLogin, setShowUserLogin] = useState(false);
    const [Products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});

    // Fetch Seller Status
    const fetchSellerStatus = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth');
            if (data.success) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        } catch (error) {
            setIsSeller(false);
        }
    }

    // Fetch user status
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('api/user/is-auth');
            if (data.success) {
                setUser(data.user);
                setCartItems(data.user.cartItem || {});
            }
        } catch (error) {
            setUser(null);
            setCartItems({});
        }
    }

    // get cart items count
    const getCartCount = () => {
        let count = 0;
        for (const key in cartItems) {
            if (cartItems[key] > 0) {
                count += cartItems[key];
            }
        }
        return count;
    }

    // 1. دالة الحساب (صافية وبدون تحديث State)
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const key in cartItems) {
            if (cartItems[key] > 0) {
                let itemInfo = Products.find((product) => product._id === key);
                if (itemInfo) {
                    totalAmount += itemInfo.offerPrice * cartItems[key];
                }
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    // 2. useEffect لتنظيف السلة من المنتجات غير الموجودة (الـ IDs القديمة)
    // ده بيحل إيرور الـ (Cannot update a component while rendering)
    useEffect(() => {
        if (Products.length > 0 && Object.keys(cartItems).length > 0) {
            let updatedCart = { ...cartItems };
            let hasChanged = false;

            for (const key in cartItems) {
                if (cartItems[key] > 0) {
                    // نتحقق لو الـ ID ده موجود فعلاً في قائمة المنتجات
                    let itemExists = Products.some((product) => product._id === key);
                    if (!itemExists) {
                        delete updatedCart[key];
                        hasChanged = true;
                    }
                }
            }

            // لو حصل تغيير (لقينا منتجات قديمة)، نحدث السلة مرة واحدة
            if (hasChanged) {
                setCartItems(updatedCart);
            }
        }
    }, [Products, cartItems]);

    // Add to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }

        setCartItems(cartData);
        toast.success("Added to cart");
    }

    // update cart item quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity > 0) {
            cartData[itemId] = quantity;
        } else {
            delete cartData[itemId];
        }
        setCartItems(cartData);
        toast.success("Cart updated");
    }

    // remove cart item
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] < 1) {
                delete cartData[itemId];
            }
        }
        toast.success("Removed from cart");
        setCartItems(cartData);
    }

    // fetch products
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list');
            if (data.success) {
                setProducts(data.products);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchSellerStatus();
        fetchProducts();
    }, []);

    // update database cart items
    useEffect(() => {
        const updateCart = async () => {
            try {
                const { data } = await axios.post('/api/cart/update', { cartItems });
                if (!data.success) {
                    toast.error(data.message);
                }
            } catch (error) {
                if (User) {
                    toast.error(error.response?.data?.message || error.message);
                }
            }
        }

        if (User) {
            updateCart();
        }
    }, [cartItems]);

    const value = {
        navigate,
        User,
        setUser,
        isSeller,
        setIsSeller,
        ShowUserLogin,
        setShowUserLogin,
        Products,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        searchQuery,
        setSearchQuery,
        getCartAmount,
        getCartCount,
        axios,
        fetchProducts,
        setCartItems
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};