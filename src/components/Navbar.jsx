import React from 'react';

function Navbar({ isLoggedIn, onLogout, navigateTo, currentPage }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isLoggedIn) return null; // Hide navbar if not logged in

  return (
    <div className="bottom-navbar">
      <button
        className={currentPage === 'dashboard' ? 'active' : ''}
        onClick={() => navigateTo('dashboard')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>Home</span>
      </button>
      <button
        className={currentPage === 'profile' ? 'active' : ''}
        onClick={() => navigateTo('profile')}
      >
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="navbar-profile-picture"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        )}
        <span>Profile</span>
      </button>
      <button onClick={onLogout}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  );
}

export default Navbar;