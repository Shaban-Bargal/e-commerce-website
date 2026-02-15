import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode._id) {
            // بنخزن الـ ID في الـ req مباشرة وده الأضمن والأنظف
            req.userId = tokenDecode._id;

            // تأكد أن الـ body موجود قبل الإضافة فيه لتجنب الخطأ
            if (req.body) {
                req.body.userId = tokenDecode._id;
            }
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
}

export default authUser