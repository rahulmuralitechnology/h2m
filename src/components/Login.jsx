import React, { useState } from 'react';

function Login({ onLogin }) {
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState(['', '', '', '']); // Array to store each digit of the PIN

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Allow only numbers
        setPhone(value);
    };

    const handlePinChange = (index, value) => {
        const newPin = [...pin];
        newPin[index] = value.replace(/\D/g, ''); // Allow only numbers
        setPin(newPin);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullPin = pin.join(''); // Combine the PIN digits into a single string
        if (fullPin.length !== 4) {
            alert('Please enter a 4-digit PIN.');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find((u) => u.phone === phone && u.pin === fullPin);

        if (!user) {
            // Create a new user if not found
            const newUser = { phone, pin: fullPin };
            localStorage.setItem('users', JSON.stringify([...users, newUser]));
        }

        // Save current user to localStorage
        localStorage.setItem('user', JSON.stringify({ phone, pin: fullPin }));
        onLogin();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Phone Number:</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength="10" // Limit to 10 digits
                    required
                />
            </div>
            <div>
                <label>4-Digit PIN:</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value)}
                            maxLength="1" // Allow only 1 digit per box
                            style={{ width: '30px', textAlign: 'center' }}
                            required
                        />
                    ))}
                </div>
            </div>
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;