import React, { useState, useEffect } from 'react';
import './SplashScreen.css';
import Logo from '../assets/7990986.png';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 10 : 100));
    }, 300);

    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeOutTimer);
    };
  }, []);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <img src={Logo} alt="H2M Logo" style={{ minWidth: '50vw' }} />
      <h1>Welcome to H2M</h1>
      <p>A Home to Me Delivery App</p>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

export default SplashScreen;