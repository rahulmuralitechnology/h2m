import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Profile from './components/Profile';

// Mock the localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

jest.mock('./components/Login', () => {
  return function MockLogin(props) {
    return (
      <div>
        Mock Login Component
        <button onClick={props.onLogin}>Mock Login Button</button>
      </div>
    );
  };
});

jest.mock('./components/Dashboard', () => {
  return function MockDashboard() {
    return <div>Mock Dashboard Component</div>;
  };
});

jest.mock('./components/Navbar', () => {
  return function MockNavbar(props) {
    return (
      <div>
        Mock Navbar Component
        {props.isLoggedIn && <button onClick={props.onLogout}>Mock Logout Button</button>}
        <button onClick={() => props.navigateTo('dashboard')}>Mock Dashboard Nav</button>
        <button onClick={() => props.navigateTo('profile')}>Mock Profile Nav</button>
        <p>Current Page: {props.currentPage}</p>
      </div>
    );
  };
});

jest.mock('./components/Profile', () => {
  return function MockProfile() {
    return <div>Mock Profile Component</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should render Login component when not logged in', async () => {
    const { findByText } = render(<App />);
    await waitFor(() => {
      expect(findByText('Mock Login Component')).resolves.toBeDefined();
    });
  });

  it('should render Dashboard component when logged in and current page is dashboard', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testUser' }));
    const { findByText } = render(<App />);

    await waitFor(() => {
       expect(findByText('Mock Dashboard Component')).resolves.toBeDefined();
    });
  });

  it('should render Profile component when logged in and current page is profile', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testUser' }));
    const { findByText, getByText } = render(<App />);
    await waitFor(() => {
        expect(findByText('Mock Dashboard Component')).resolves.toBeDefined(); // Initial load is dashboard
    });

    fireEvent.click(getByText('Mock Profile Nav'));

    await waitFor(() => {
      expect(findByText('Mock Profile Component')).resolves.toBeDefined();
    });

     expect(getByText('Current Page: profile')).toBeInTheDocument();

  });

  it('should handle login correctly', async () => {
    const { findByText, getByText } = render(<App />);
    await waitFor(() => {
        expect(findByText('Mock Login Component')).resolves.toBeDefined();
    });

    fireEvent.click(getByText('Mock Login Button'));

    await waitFor(() => {
      expect(findByText('Mock Dashboard Component')).resolves.toBeDefined();
    });

    expect(localStorage.getItem('user')).toBeTruthy();
  });

  it('should handle logout correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testUser' }));
    const { findByText, getByText } = render(<App />);
    await waitFor(() => {
         expect(findByText('Mock Dashboard Component')).resolves.toBeDefined();
    });

    fireEvent.click(getByText('Mock Logout Button'));

    await waitFor(() => {
      expect(findByText('Mock Login Component')).resolves.toBeDefined();
    });

    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should navigate to different pages', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testUser' }));
    const { findByText, getByText } = render(<App />);

    await waitFor(() => {
        expect(findByText('Mock Dashboard Component')).resolves.toBeDefined();
    });
    expect(getByText('Current Page: dashboard')).toBeInTheDocument();

    fireEvent.click(getByText('Mock Profile Nav'));

    await waitFor(() => {
      expect(findByText('Mock Profile Component')).resolves.toBeDefined();
    });
    expect(getByText('Current Page: profile')).toBeInTheDocument();

    fireEvent.click(getByText('Mock Dashboard Nav'));

     await waitFor(() => {
        expect(findByText('Mock Dashboard Component')).resolves.toBeDefined();
    });
     expect(getByText('Current Page: dashboard')).toBeInTheDocument();
  });

  it('should handle the case where localStorage is empty initially', async () => {
    const { findByText } = render(<App />);
     await waitFor(() => {
        expect(findByText('Mock Login Component')).resolves.toBeDefined();
    });

  });

});

