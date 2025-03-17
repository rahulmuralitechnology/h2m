import React, { useState, useEffect } from 'react';

function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users.find((u) => u.phone === user.phone);
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone);
      setProfilePicture(currentUser.profilePicture || '');
      setStreet(currentUser.street || '');
      setCity(currentUser.city || '');
      setState(currentUser.state || '');
      setZipCode(currentUser.zipCode || '');
    }
  }, [user.phone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map((u) =>
      u.phone === user.phone
        ? { ...u, name, phone, profilePicture, street, city, state, zipCode }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem(
      'user',
      JSON.stringify({ ...user, name, phone, profilePicture, street, city, state, zipCode })
    );
    alert('Profile updated successfully!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile">
      <h2>Profile</h2>
      <div className="profile-picture-container">
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" className="profile-picture" />
        ) : (
          <div className="profile-picture-placeholder">No Image</div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="profile-picture-input"
        />
      </div>
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
        <div>
          <label>Street:</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div>
          <label>Zip Code:</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
            maxLength="6"
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;