import jwt from "jsonwebtoken";

// login seller : /api/seller/login 
export const sellerLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.cookie("sellerToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({ success: true, message: "Login successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// check Auth for seller : /api/seller/isAuth
export const isSellerAuth = async (req, res) => {
    try {

        return res.status(200).json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// logout seller : /api/seller/logout

export const logout = async (req, res) => {
    try {
        res.clearCookie("sellerToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.status(200).json({ success: true, message: "Logout successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

