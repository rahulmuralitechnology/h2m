import React, { useState } from 'react';

function CreateOrder({ onOrderCreated }) {
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = (e) => {
        e.preventDefault();
        const newOrder = {
            senderPhone: user.phone,
            senderName: user.phone,
            recipientName,
            recipientPhone,
            status: 'Preparing',
            createdAt: new Date().toISOString(),
        };
        const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        localStorage.setItem('orders', JSON.stringify([...savedOrders, newOrder]));
        onOrderCreated(newOrder);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Recipient's Name:</label>
                <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Recipient's Phone:</label>
                <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Create Order</button>
        </form>
    );
}

export default CreateOrder;