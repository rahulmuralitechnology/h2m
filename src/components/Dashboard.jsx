import React, { useState, useEffect } from 'react';
import CreateOrder from './CreateOrder';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = savedOrders.filter(
      (order) =>
        order.senderPhone === user.phone || order.recipientPhone === user.phone
    );
    setOrders(userOrders);
  }, [user.phone]);

  const calculateRemainingTime = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - createdTime;
    const remainingTime = Math.max(0, 10 * 60 * 1000 - elapsedTime);
    return Math.floor(remainingTime / 1000 / 60);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedOrders = orders.map((order) => ({
        ...order,
        timeRemaining: calculateRemainingTime(order.createdAt),
        status: calculateRemainingTime(order.createdAt) <= 0 ? 'Delivered' : 'Preparing',
      }));
      setOrders(updatedOrders);
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const handleOrderCreated = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  const handleCancelOrder = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <CreateOrder onOrderCreated={handleOrderCreated} />
      <h3>Your Orders</h3>
      <div>
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="preparing">Preparing</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      <div className="order-list">
        {filteredOrders.length === 0 ? (
          <p>No orders placed or received yet.</p>
        ) : (
          filteredOrders.map((order, index) => (
            <div className="order-card" key={index}>
              <p>
                {order.senderPhone === user.phone
                  ? `To: ${order.recipientName} (${order.recipientPhone})`
                  : `From: ${order.senderName} (${order.senderPhone})`}
              </p>
              <p>Status: {order.status}</p>
              <p>Time Remaining: {order.timeRemaining} minutes</p>
              <button onClick={() => handleCancelOrder(index)}>Cancel Order</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;