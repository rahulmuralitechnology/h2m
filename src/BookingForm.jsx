import React, { useState } from 'react';

function BookingForm() {
    const [formData, setFormData] = useState({
        yourLocation: '',
        deliveryLocation: '',
        sonName: '',
        sonPhone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert('Order Booked!');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Your Location:</label>
                <input
                    type="text"
                    name="yourLocation"
                    value={formData.yourLocation}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Delivery Location (Son's Workplace):</label>
                <input
                    type="text"
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Son's Name:</label>
                <input
                    type="text"
                    name="sonName"
                    value={formData.sonName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Son's Phone Number:</label>
                <input
                    type="tel"
                    name="sonPhone"
                    value={formData.sonPhone}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Book Order</button>
        </form>
    );
}

export default BookingForm;