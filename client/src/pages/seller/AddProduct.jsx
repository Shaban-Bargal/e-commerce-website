import { useState } from "react";
import { assets, categories } from "../../assets/assets";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AddProduct = () => {

    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');

    const { axios } = useAppContext();

    const onsubmitHandler = async (e) => {
        try {
            e.preventDefault();

            if (!category) {
                return toast.error("Please select a category");
            }

            const productData = {
                name,
                description: description.split('\n'),
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
            };

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));

            files.forEach((file) => {
                if (file) {
                    formData.append('images', file);
                }
            });

            const { data } = await axios.post('/api/product/add', formData);

            if (data.success) {
                toast.success(data.message);

                // Reset form
                setName('');
                setDescription('');
                setCategory('');
                setPrice('');
                setOfferPrice('');
                setFiles([]);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onsubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">

                {/* Product Images */}
                <div>
                    <p className="text-base font-medium">Product Images</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>
                                <input
                                    accept="image/*"
                                    type="file"
                                    id={`image${index}`}
                                    hidden
                                    onChange={(e) => {
                                        const updatedFiles = [...files];
                                        updatedFiles[index] = e.target.files[0];
                                        setFiles(updatedFiles);
                                    }}
                                />

                                <img
                                    className="max-w-24 cursor-pointer"
                                    src={
                                        files[index]
                                            ? URL.createObjectURL(files[index])
                                            : assets.upload_area
                                    }
                                    alt="uploadArea"
                                    width={100}
                                    height={100}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Product Name */}
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium">Product Name</label>
                    <input
                        type="text"
                        placeholder="Type here"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Product Description */}
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium">Product Description</label>
                    <textarea
                        rows={4}
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                        placeholder="Type here"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Category */}
                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    >
                        <option value="">Select Category</option>
                        {categories.map((item, index) => (
                            <option key={index} value={item.path}>
                                {item.path}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Section */}
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium">Product Price</label>
                        <input
                            type="number"
                            placeholder="0"
                            required
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium">Offer Price</label>
                        <input
                            type="number"
                            placeholder="0"
                            required
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button className="px-8 py-2.5 bg-primary cursor-pointer text-white font-medium rounded">
                    ADD
                </button>

            </form>
        </div>
    );
};

export default AddProduct;
