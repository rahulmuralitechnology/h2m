import React, { useState, useEffect } from 'react';

function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users.find((u) => u.phone === user.phone);
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone);
    }
  }, [user.phone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map((u) =>
      u.phone === user.phone ? { ...u, name, phone } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('user', JSON.stringify({ ...user, name, phone }));
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            required
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;