import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the components used in App to isolate testing to App's logic
jest.mock('./components/Login', () => {
  return function MockLogin(props) {
    return (
      <div>
        Mock Login Component
        <button onClick={props.onLogin}>Login</button>
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
        <button onClick={props.onLogout}>Logout</button>
        <button onClick={() => props.navigateTo('dashboard')}>Dashboard</button>
        <button onClick={() => props.navigateTo('profile')}>Profile</button>
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

  it('renders loading state initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Login component when not logged in after loading', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Mock Login Component'));
    expect(screen.getByText('Mock Login Component')).toBeInTheDocument();
  });

  it('renders Dashboard and Navbar components when logged in after loading and navigates to Dashboard', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    render(<App />);
    await waitFor(() => screen.getByText('Mock Dashboard Component'));

    expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument();
    expect(screen.getByText('Mock Navbar Component')).toBeInTheDocument();
    expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument();
  });

  it('renders Profile component when logged in and navigates to Profile', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    render(<App />);
    await waitFor(() => screen.getByText('Mock Dashboard Component'));

    const profileButton = screen.getByRole('button', {name: 'Profile'});
    fireEvent.click(profileButton);
    await waitFor(() => screen.getByText('Mock Profile Component'));
    expect(screen.getByText('Mock Profile Component')).toBeInTheDocument();
    expect(screen.getByText('Current Page: profile')).toBeInTheDocument();
  });

  it('logs in successfully and updates state', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Mock Login Component'));
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => screen.getByText('Mock Dashboard Component'));
    expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument();
    expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument();
  });

  it('logs out successfully and updates state', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    render(<App />);
    await waitFor(() => screen.getByText('Mock Dashboard Component'));

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);

    await waitFor(() => screen.getByText('Mock Login Component'));
    expect(screen.getByText('Mock Login Component')).toBeInTheDocument();
  });

  it('navigates correctly using the Navbar', async () => {
     localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
     render(<App />);
     await waitFor(() => screen.getByText('Mock Dashboard Component'));

     const dashboardButton = screen.getByRole('button', { name: 'Dashboard'});
     fireEvent.click(dashboardButton);
     await waitFor(() => screen.getByText('Current Page: dashboard'));

     expect(screen.getByText('Mock Dashboard Component')).toBeInTheDocument();
     expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument();
  });
});

