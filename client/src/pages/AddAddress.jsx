import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

// Input field component
const InputField = ({ type, placeholder, name, handelChange, address }) => (
    <input
        className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        onChange={handelChange}
        name={name}
        value={address[name]}
        required
    />
);

function AddAddress() {
    const [address, setAddress] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: "",
    });

    const { navigate, User } = useAppContext();

    // Handle input changes
    const handelChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value
        }));
    };

    // Handle form submission
    const onSubmitHandeler = async (e) => {
        e.preventDefault();
        console.log(address); // للتأكد من البيانات قبل الإرسال
        try {
            const { data } = await axios.post('/api/address/add', {address}); // أرسل body مباشرة
            if (data.success) {
                toast.success(data.message);
                navigate('/cart');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        if (!User) {
            navigate('/login');
        }
    }, [User, navigate]);

    return (
        <div className='mt-16 pb-16'>
            <p className='text-2xl md:text-3xl text-gray-500'>
                Add Shipping <span className='font-semibold text-primary'>Address</span>
            </p>

            <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
                <div className='flex w-max flex-1'>
                    <form onSubmit={onSubmitHandeler} className='space-y-3 my-6 text-sm'>
                        {/* First & Last Name */}
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField
                                handelChange={handelChange}
                                address={address}
                                name='firstName'
                                type="text"
                                placeholder='First Name'
                            />
                            <InputField
                                handelChange={handelChange}
                                address={address}
                                name='lastName'
                                type="text"
                                placeholder='Last Name'
                            />
                        </div>

                        {/* Email */}
                        <InputField
                            handelChange={handelChange}
                            address={address}
                            name='email'
                            type="email"
                            placeholder='Email'
                        />

                        {/* Street */}
                        <InputField
                            handelChange={handelChange}
                            address={address}
                            name='street'
                            type="text"
                            placeholder='Street'
                        />

                        {/* City & State */}
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField
                                handelChange={handelChange}
                                address={address}
                                name='city'
                                type="text"
                                placeholder='City'
                            />
                            <InputField
                                handelChange={handelChange}
                                address={address}
                                name='state'
                                type="text"
                                placeholder='State'
                            />
                        </div>

                        {/* Zipcode & Country */}
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField
                                handelChange={handelChange}
                                address={address}
                                name='zipcode'
                                type="number"
                                placeholder='Zip Code'
                            />
                            <InputField
                                handelChange={handelChange}
                                address={address}
                                name='country'
                                type="text"
                                placeholder='Country'
                            />
                        </div>

                        {/* Phone */}
                        <InputField
                            handelChange={handelChange}
                            address={address}
                            name='phone'
                            type="text"
                            placeholder='Phone'
                        />

                        {/* Submit Button */}
                        <button
                            type='submit'
                            className='w-full bg-primary text-white py-2.5 rounded hover:bg-primary-dull transition cursor-pointer'
                        >
                            Save Address
                        </button>
                    </form>
                </div>

                {/* Side Image */}
                <img
                    src={assets.add_address_iamge}
                    alt="Add Address"
                    className='md:mr-16 mb-16 md:mt-0'
                />
            </div>
        </div>
    );
}

export default AddAddress;
