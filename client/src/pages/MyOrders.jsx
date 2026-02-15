/* eslint-disable */

import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const MyOrders = () => {

    const [myOrders, setMyOrders] = useState([])
    const { User } = useAppContext()

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get("/api/order/user");
            if (data.success) {
                setMyOrders(data.orders);
            } else {
                toast.error(data.message);
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
        if (User) {
            fetchMyOrders();
        }
    }, [User]);

    return (
        <div className='mt-16 pb-16'>
            {/* Title */}
            <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase'>My Orders</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            {/* Orders */}
            {myOrders.map((order, orderIndex) => (
                <div
                    key={orderIndex}
                    className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'
                >
                    {/* Order Info */}
                    <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col gap-1'>
                        <span>OrderId : {order._id}</span>
                        <span>Payment : {order.paymentType}</span>
                        <span>Total Amount : ${order.amount}</span>
                    </p>

                    {/* Order Items */}
                    {order.items.map((item, index) => (
                        <div
                            key={index}
                            className={`relative bg-white text-gray-500/70 flex flex-col md:flex-row md:items-center md:justify-between p-4 py-5 md:gap-16 w-full max-w-4xl
                            ${order.items.length !== index + 1 ? 'border-b border-gray-300' : ''}`}
                        >
                            {/* Product Info */}
                            <div className='flex items-center mb-4 md:mb-0'>
                                <div className='bg-primary/10 p-4 rounded-lg'>
                                    <img
                                        className='w-16 h-16 object-cover'
                                        src={item.product.images?.[0]}
                                        alt={item.product.name}
                                    />
                                </div>
                                <div className='ml-4'>
                                    <h2 className='text-xl font-medium text-gray-800'>
                                        {item.product.name}
                                    </h2>
                                    <p>Category: {item.product.category}</p>
                                </div>
                            </div>
                            {/* Order Details */}
                            <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                                <p>Quantity: {item.quantity || 1}</p>
                                <p>Status: {order.status}</p>
                                <p>Date: {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                            {/* Amount */}
                            <p className='text-primary text-lg font-medium'>
                                Amount: $
                                {item.product.offerPrice * (item.quantity || 1)}
                            </p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default MyOrders
