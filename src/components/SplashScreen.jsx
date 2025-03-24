import React from 'react';
import './SplashScreen.css';
import Logo from '../assets/7990986.png';

function SplashScreen() {
  return (
    <div className="splash-screen">
      <img src={Logo} alt="H2M Logo" />
      <h1>Welcome to H2M</h1>
      <p>A Home to Me Delivery App</p>
    </div>
  );
}

export default SplashScreen;
