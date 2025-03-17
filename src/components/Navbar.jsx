import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome, faUser, faSignOutAlt, faCog, faBell } from '@fortawesome/free-solid-svg-icons';

function Navbar({ isLoggedIn, onLogout, navigateTo, currentPage }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isLoggedIn) return null; // Hide navbar if not logged in

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="top-navbar">
        <button className="hamburger" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h1>H2M</h1>
        {/* <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div> */}
      </div>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="sidebar-profile-picture"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
          )}
          <h3>{user.name || 'User'}</h3>
        </div>
        <ul className="sidebar-menu">
          <li
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => {
              navigateTo('dashboard');
              setIsSidebarOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </li>
          <li
            className={currentPage === 'profile' ? 'active' : ''}
            onClick={() => {
              navigateTo('profile');
              setIsSidebarOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </li>
          <li
            onClick={() => {
              navigateTo('notifications');
              setIsSidebarOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faBell} />
            <span>Notifications</span>
          </li>
          <li
            onClick={() => {
              navigateTo('settings');
              setIsSidebarOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </li>
          <li onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
}

export default Navbar;