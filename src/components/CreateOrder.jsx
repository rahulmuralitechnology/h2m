import React, { useState } from 'react';

function CreateOrder({ onOrderCreated }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientStreet, setRecipientStreet] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientState, setRecipientState] = useState('');
  const [recipientZipCode, setRecipientZipCode] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOrder = {
      senderPhone: user.phone,
      senderName: user.name,
      senderStreet: user.street,
      senderCity: user.city,
      senderState: user.state,
      senderZipCode: user.zipCode,
      recipientName,
      recipientPhone,
      recipientStreet,
      recipientCity,
      recipientState,
      recipientZipCode,
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
          onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
          maxLength="10"
          required
        />
      </div>
      <div>
        <label>Recipient's Street:</label>
        <input
          type="text"
          value={recipientStreet}
          onChange={(e) => setRecipientStreet(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Recipient's City:</label>
        <input
          type="text"
          value={recipientCity}
          onChange={(e) => setRecipientCity(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Recipient's State:</label>
        <input
          type="text"
          value={recipientState}
          onChange={(e) => setRecipientState(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Recipient's Zip Code:</label>
        <input
          type="text"
          value={recipientZipCode}
          onChange={(e) => setRecipientZipCode(e.target.value.replace(/\D/g, ''))}
          maxLength="6"
          required
        />
      </div>
      <button type="submit">Create Order</button>
    </form>
  );
}

export default CreateOrder;