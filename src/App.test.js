import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the components to isolate App's logic
jest.mock('./components/Login', () => {
  return function MockLogin({ onLogin }) {
    return (
      <div>
        <button data-testid="login-button" onClick={onLogin}>
          Mock Login
        </button>
      </div>
    );
  };
});

jest.mock('./components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Mock Dashboard</div>;
  };
});

jest.mock('./components/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile">Mock Profile</div>;
  };
});

jest.mock('./components/Navbar', () => {
  return function MockNavbar({ isLoggedIn, onLogout, navigateTo, currentPage }) {
    return (
      <div>
        <button data-testid="logout-button" onClick={onLogout} disabled={!isLoggedIn}>
          Mock Logout
        </button>
        <button data-testid="dashboard-nav" onClick={() => navigateTo('dashboard')} disabled={currentPage === 'dashboard'}>
          Mock Dashboard Nav
        </button>
        <button data-testid="profile-nav" onClick={() => navigateTo('profile')} disabled={currentPage === 'profile'}>
          Mock Profile Nav
        </button>
        <div>Current Page: {currentPage}</div>
        <div>Logged In: {isLoggedIn ? 'Yes' : 'No'}</div>
      </div>
    );
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Login component when not logged in after loading', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('login-button')).toBeInTheDocument());
  });

  it('renders Dashboard component when logged in after loading', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
  });

  it('handles login correctly', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('login-button')).toBeInTheDocument());

    act(() => {
        userEvent.click(screen.getByTestId('login-button'));
    });

    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    expect(localStorage.getItem('user')).toEqual(JSON.stringify({ username: 'testuser' })); // added for validation

  });

  it('handles logout correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    act(() => {
        userEvent.click(screen.getByTestId('logout-button'));
    });


    await waitFor(() => expect(screen.getByTestId('login-button')).toBeInTheDocument());
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('navigates to Profile page correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());

    act(() => {
        userEvent.click(screen.getByTestId('profile-nav'));
    });

    await waitFor(() => expect(screen.getByTestId('profile')).toBeInTheDocument());
    expect(screen.getByText('Current Page: profile')).toBeInTheDocument();

  });

  it('navigates back to Dashboard page correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());

    act(() => {
        userEvent.click(screen.getByTestId('profile-nav'));
    });

    await waitFor(() => expect(screen.getByTestId('profile')).toBeInTheDocument());

     act(() => {
        userEvent.click(screen.getByTestId('dashboard-nav'));
    });

    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    expect(screen.getByText('Current Page: dashboard')).toBeInTheDocument();
  });

  it('correctly sets initial state based on localStorage - logged out', async () => {
      localStorage.removeItem('user');
      render(<App />);
      await waitFor(() => expect(screen.getByTestId('login-button')).toBeInTheDocument());
      expect(screen.getByText('Logged In: No')).toBeInTheDocument();
  });

  it('correctly sets initial state based on localStorage - logged in', async () => {
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
      render(<App />);
      await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
      expect(screen.getByText('Logged In: Yes')).toBeInTheDocument();
  });

  it('logout button is disabled when not logged in', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('login-button')).toBeInTheDocument());
    expect(screen.getByTestId('logout-button')).toBeDisabled();
  });

   it('dashboard nav is disabled when current page is dashboard', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    expect(screen.getByTestId('dashboard-nav')).toBeDisabled();
  });

    it('profile nav is disabled when current page is profile', async () => {
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
      render(<App />);
      await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
       act(() => {
          userEvent.click(screen.getByTestId('profile-nav'));
      });
      await waitFor(() => expect(screen.getByTestId('profile')).toBeInTheDocument());

      expect(screen.getByTestId('profile-nav')).toBeDisabled();
    });
});

