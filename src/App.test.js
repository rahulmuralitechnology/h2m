import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock components (necessary to avoid errors)
jest.mock('./components/Login', () => {
  return function MockLogin({ onLogin }) {
    return (
      <div>
        <button onClick={onLogin}>Mock Login</button>
      </div>
    );
  };
});

jest.mock('./components/Dashboard', () => {
  return function MockDashboard() {
    return <div>Mock Dashboard</div>;
  };
});

jest.mock('./components/Navbar', () => {
  return function MockNavbar({ isLoggedIn, onLogout, navigateTo, currentPage }) {
    return (
      <div>
        {isLoggedIn && <button onClick={onLogout}>Mock Logout</button>}
        <button onClick={() => navigateTo('dashboard')}>Mock Dashboard Nav</button>
        <button onClick={() => navigateTo('profile')}>Mock Profile Nav</button>
        <div>Current Page: {currentPage}</div>
      </div>
    );
  };
});

jest.mock('./components/Profile', () => {
  return function MockProfile() {
    return <div>Mock Profile</div>;
  };
});

describe('App Component', () => {

  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Login component when not logged in', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login')).toBeInTheDocument());
  });

  it('renders Dashboard component when logged in and on dashboard page', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ username: 'testUser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard')).toBeInTheDocument());
  });

  it('renders Profile component when logged in and on profile page', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ username: 'testUser' }));
    const { rerender } = render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard')).toBeInTheDocument()); // Initial render on dashboard

    // Simulate navigation to profile page
    fireEvent.click(screen.getByText('Mock Profile Nav'));
    rerender(<App />);  // force a re-render with new state

    await waitFor(() => expect(screen.getByText('Mock Profile')).toBeInTheDocument());
  });

  it('handles login correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Mock Login'));
    await waitFor(() => expect(screen.getByText('Mock Dashboard')).toBeInTheDocument());
  });

  it('handles logout correctly', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ username: 'testUser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Dashboard')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Mock Logout'));
    await waitFor(() => expect(screen.getByText('Mock Login')).toBeInTheDocument());
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('navigates to different pages correctly', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ username: 'testUser' }));
    render(<App />);

    await waitFor(() => expect(screen.getByText('Mock Dashboard')).toBeInTheDocument());
    expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Mock Profile Nav'));
    await waitFor(() => expect(screen.getByText('Mock Profile')).toBeInTheDocument());
    expect(screen.getByText('Current Page: profile')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Mock Dashboard Nav'));
    await waitFor(() => expect(screen.getByText('Mock Dashboard')).toBeInTheDocument());
    expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument();
  });

  it('handles no user in localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue(undefined);  // Edge case: undefined, not null
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login')).toBeInTheDocument());
  });

  it('handles invalid JSON in localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('{invalid: json}'); // Edge case: invalid JSON
    render(<App />);
    await waitFor(() => expect(screen.getByText('Mock Login')).toBeInTheDocument());
  });
});

