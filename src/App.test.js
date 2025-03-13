import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Profile from './components/Profile';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};

  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = String(value);
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock components to avoid deep rendering
jest.mock('./components/Login', () => {
  return function MockedLogin(props) {
    return <div data-testid="login-component"><button onClick={props.onLogin}>Mock Login</button></div>;
  };
});

jest.mock('./components/Dashboard', () => {
  return function MockedDashboard() {
    return <div data-testid="dashboard-component">Mock Dashboard</div>;
  };
});

jest.mock('./components/Navbar', () => {
  return function MockedNavbar(props) {
    return (
      <div data-testid="navbar-component">
        Navbar
        {props.isLoggedIn && <button onClick={props.onLogout}>Mock Logout</button>}
        <button onClick={() => props.navigateTo('dashboard')}>Dashboard</button>
        <button onClick={() => props.navigateTo('profile')}>Profile</button>
      </div>
    );
  };
});

jest.mock('./components/Profile', () => {
  return function MockedProfile() {
    return <div data-testid="profile-component">Mock Profile</div>;
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });


  it('renders loading state initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });


  it('renders Login component when not logged in', async () => {
    const { findByTestId } = render(<App />);
    await waitFor(() => expect(findByTestId('login-component')).resolves.toBeDefined());
  });


  it('renders Dashboard component when logged in and on the dashboard page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    const { findByTestId } = render(<App />);
    await waitFor(() => expect(findByTestId('dashboard-component')).resolves.toBeDefined());
  });


  it('renders Profile component when logged in and on the profile page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    const { findByTestId } = render(<App />);
     await waitFor(() => expect(findByTestId('navbar-component')).resolves.toBeDefined());
    const navbar = await screen.findByTestId('navbar-component');
    fireEvent.click(screen.getByText('Profile'));
    await waitFor(() => expect(findByTestId('profile-component')).resolves.toBeDefined());

  });



  it('handles login correctly', async () => {
    const { findByTestId } = render(<App />);
    const loginComponent = await findByTestId('login-component');
    fireEvent.click(screen.getByText('Mock Login'));
    await waitFor(() => expect(findByTestId('dashboard-component')).resolves.toBeDefined());
    expect(localStorage.getItem('user')).toBe('true'); // Check if the state is updated correctly.
  });


  it('handles logout correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    const { findByTestId } = render(<App />);
    await waitFor(() => expect(findByTestId('navbar-component')).resolves.toBeDefined());

    fireEvent.click(screen.getByText('Mock Logout'));
    await waitFor(() => expect(findByTestId('login-component')).resolves.toBeDefined());
    expect(localStorage.getItem('user')).toBeNull();

  });

  it('navigates to different pages correctly', async () => {
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
      const { findByTestId } = render(<App />);

      await waitFor(() => expect(findByTestId('navbar-component')).resolves.toBeDefined());

      fireEvent.click(screen.getByText('Profile'));
      await waitFor(() => expect(findByTestId('profile-component')).resolves.toBeDefined());

      fireEvent.click(screen.getByText('Dashboard'));
      await waitFor(() => expect(findByTestId('dashboard-component')).resolves.toBeDefined());


  });
   it('handles initial logged in state from localStorage', async () => {
      localStorage.setItem('user', JSON.stringify({ username: 'existingUser' }));

      const { findByTestId } = render(<App />);
      await waitFor(() => expect(findByTestId('dashboard-component')).resolves.toBeDefined());

    });


   it('does not crash when user data in localStorage is invalid json', async () => {
      localStorage.setItem('user', 'invalid json');
      const { findByTestId } = render(<App />);
      await waitFor(() => expect(findByTestId('login-component')).resolves.toBeDefined());

    });

    it('renders login when localStorage user is an empty object', async () => {
      localStorage.setItem('user', JSON.stringify({}));
      const { findByTestId } = render(<App />);
      await waitFor(() => expect(findByTestId('login-component')).resolves.toBeDefined());
    });
});

