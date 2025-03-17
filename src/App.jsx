import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
    }
    setLoading(false);

    // Hide splash screen after 3 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'profile' && <Profile />}
        </>
      )}
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        navigateTo={navigateTo}
        currentPage={currentPage}
      />
    </div>
  );
}

export default App;