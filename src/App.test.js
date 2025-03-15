import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Profile from './components/Profile';

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
        {props.isLoggedIn ? (
          <button onClick={props.onLogout}>Mock Logout Button</button>
        ) : null}
        <button onClick={() => props.navigateTo('dashboard')}>
          Mock Dashboard Nav
        </button>
        <button onClick={() => props.navigateTo('profile')}>
          Mock Profile Nav
        </button>
        <div>Current Page: {props.currentPage}</div>
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

  it('should render loading initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should render Login component when not logged in', async () => {
    const { findByText } = render(<App />);
    await waitFor(() => expect(findByText('Mock Login Component')).resolves.toBeDefined());
  });

  it('should render Dashboard component when logged in and on dashboard page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    const { findByText } = render(<App />);
    await waitFor(() => expect(findByText('Mock Dashboard Component')).resolves.toBeDefined());
  });

  it('should render Profile component when logged in and on profile page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    const { findByText, getByText } = render(<App />);
    await waitFor(() => findByText('Mock Dashboard Component'));
    const navbar = getByText('Mock Navbar Component');
    fireEvent.click(navbar.querySelector('button:nth-child(3)')); // Navigate to Profile

    await waitFor(() => expect(findByText('Mock Profile Component')).resolves.toBeDefined());
  });

  it('should handle login correctly', async () => {
    const { findByText, getByText } = render(<App />);
    await waitFor(() => findByText('Mock Login Component'));
    fireEvent.click(getByText('Mock Login Button'));
    await waitFor(() => expect(findByText('Mock Dashboard Component')).resolves.toBeDefined());
    expect(localStorage.getItem('user')).toBeDefined();
  });

  it('should handle logout correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    const { findByText, getByText } = render(<App />);
    await waitFor(() => findByText('Mock Dashboard Component'));

    const navbar = getByText('Mock Navbar Component');
    fireEvent.click(navbar.querySelector('button:nth-child(1)')); // Logout

    await waitFor(() => expect(findByText('Mock Login Component')).resolves.toBeDefined());
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should navigate to different pages correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    const { findByText, getByText } = render(<App />);
    await waitFor(() => findByText('Mock Dashboard Component'));

    const navbar = getByText('Mock Navbar Component');

    fireEvent.click(navbar.querySelector('button:nth-child(3)')); // Navigate to Profile
    await waitFor(() => expect(findByText('Mock Profile Component')).resolves.toBeDefined());

    fireEvent.click(navbar.querySelector('button:nth-child(2)')); //Navigate to Dashboard
    await waitFor(() => expect(findByText('Mock Dashboard Component')).resolves.toBeDefined());
  });

  it('should render Navbar regardless of login status', async () => {
    const { findByText } = render(<App />);
    await waitFor(() => expect(findByText('Mock Login Component')).resolves.toBeDefined());
    expect(screen.getByText('Mock Navbar Component')).toBeInTheDocument();

    localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    const { findByText: findByText2 } = render(<App />);

    await waitFor(() => expect(findByText2('Mock Dashboard Component')).resolves.toBeDefined());

     expect(screen.getByText('Mock Navbar Component')).toBeInTheDocument();
  });
});

