import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const handlePinChange = (index, value) => {
    const newPin = [...pin];
    newPin[index] = value.replace(/\D/g, '');
    setPin(newPin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPin = pin.join('');

    if (fullPin.length !== 4) {
      setError('Please enter a 4-digit PIN.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find((u) => u.phone === phone);

    if (user) {
      const isMatch = await bcrypt.compare(fullPin, user.pin);
      if (!isMatch) {
        setError('Invalid PIN.');
        return;
      }
    } else {
      const hashedPin = await bcrypt.hash(fullPin, 10);
      const newUser = {
        phone,
        pin: hashedPin,
        profilePicture: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
      };
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
    }

    localStorage.setItem(
      'user',
      JSON.stringify({
        phone,
        profilePicture: user?.profilePicture || '',
        street: user?.street || '',
        city: user?.city || '',
        state: user?.state || '',
        zipCode: user?.zipCode || '',
      })
    );
    onLogin();
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <div>
          <label>Phone Number:</label>
          <input
            type="tel"
            value={phone}
          onChange={handlePhoneChange}
            maxLength="10"
            required
          />
        </div>
        <div>
          <label>4-Digit PIN:</label>
          <div className="pin-input">
            {pin.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                maxLength="1"
                required
              />
            ))}
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;