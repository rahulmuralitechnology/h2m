import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
        {props.isLoggedIn && <button onClick={props.onLogout}>Mock Logout Button</button>}
        <button onClick={() => props.navigateTo('dashboard')}>Mock Dashboard Nav</button>
        <button onClick={() => props.navigateTo('profile')}>Mock Profile Nav</button>
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
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Login component when not logged in', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login Component')).toBeInTheDocument());
  });

  it('renders Dashboard component when logged in and on dashboard page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument());
  });

  it('renders Profile component when logged in and on profile page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    const { getByText } = screen;
    await waitFor(() => {
      fireEvent.click(getByText('Mock Profile Nav'));
      expect(getByText('Mock Profile Component')).toBeInTheDocument()
    });
  });

  it('handles login correctly', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login Component')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Mock Login Button'));
    await waitFor(() => expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument());
  });

  it('handles logout correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Mock Logout Button'));
    await waitFor(() => expect(screen.getByText('Mock Login Component')).toBeInTheDocument());
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('navigates to dashboard page correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Mock Dashboard Nav'));
    await waitFor(() => expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument());

    expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument();
  });

  it('navigates to profile page correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Mock Profile Nav'));
    await waitFor(() => expect(screen.getByText('Current Page: profile')).toBeInTheDocument());
    expect(screen.getByText('Mock Profile Component')).toBeInTheDocument();
  });

  it('handles initial login state from localStorage when user exists', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'existinguser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument());
  });

  it('handles initial login state from localStorage when user is null', async () => {
    localStorage.setItem('user', null);
     render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login Component')).toBeInTheDocument());
  });

   it('handles initial login state from localStorage when user is undefined', async () => {
    localStorage.setItem('user', undefined);
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login Component')).toBeInTheDocument());
  });
});

