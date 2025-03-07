import React from 'react';

function Navbar({ isLoggedIn, onLogout }) {
    return (
        <nav>
            <h1>Food Delivery App</h1>
            {isLoggedIn && <button onClick={onLogout}>Logout</button>}
        </nav>
    );
}

export default Navbar;