import React, { useState, useEffect } from 'react';
import CreateOrder from './CreateOrder';

function Dashboard() {
    const [orders, setOrders] = useState([]);
    const user = JSON.parse(localStorage.getItem('user')); // Get logged-in user

    useEffect(() => {
        // Load orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        // Filter orders where the logged-in user is the sender or recipient
        const userOrders = savedOrders.filter(
            (order) =>
                order.senderPhone === user.phone || order.recipientPhone === user.phone
        );
        setOrders(userOrders);
    }, [user.phone]);

    // Function to calculate remaining time
    const calculateRemainingTime = (createdAt) => {
        const createdTime = new Date(createdAt).getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - createdTime;
        const remainingTime = Math.max(0, 10 * 60 * 1000 - elapsedTime); // 10 minutes in milliseconds
        return Math.floor(remainingTime / 1000 / 60); // Convert to minutes
    };

    // Update the timer every second
    useEffect(() => {
        const interval = setInterval(() => {
            const updatedOrders = orders.map((order) => ({
                ...order,
                timeRemaining: calculateRemainingTime(order.createdAt),
                status: calculateRemainingTime(order.createdAt) <= 0 ? 'Delivered' : 'Preparing',
            }));
            setOrders(updatedOrders);
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [orders]);

    const handleOrderCreated = (newOrder) => {
        setOrders([...orders, newOrder]);
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <CreateOrder onOrderCreated={handleOrderCreated} />
            <h3>Your Orders</h3>
            {orders.length === 0 ? (
                <p>No orders placed or received yet.</p>
            ) : (
                orders.map((order, index) => (
                    <div key={index}>
                        <p>
                            {order.senderPhone === user.phone
                                ? `To: ${order.recipientName} (${order.recipientPhone})`
                                : `From: ${order.senderName} (${order.senderPhone})`}
                        </p>
                        <p>Status: {order.status}</p>
                        <p>Time Remaining: {order.timeRemaining} minutes</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Dashboard;