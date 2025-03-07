import React from 'react';

function Navbar({ isLoggedIn, onLogout, navigateTo, currentPage }) {
  if (!isLoggedIn) return null; // Hide navbar if not logged in

  return (
    <div className="bottom-navbar">
      <button
        className={currentPage === 'dashboard' ? 'active' : ''}
        onClick={() => navigateTo('dashboard')}
      >
        🏠
        <span>Home</span>
      </button>
      <button
        className={currentPage === 'profile' ? 'active' : ''}
        onClick={() => navigateTo('profile')}
      >
        👤
        <span>Profile</span>
      </button>
      <button onClick={onLogout}>
        🚪
        <span>Logout</span>
      </button>
    </div>
  );
}

export default Navbar;