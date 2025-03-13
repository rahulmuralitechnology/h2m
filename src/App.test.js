import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock components to avoid complex rendering
jest.mock('./components/Login', () => {
  return function MockLogin({ onLogin }) {
    return (
      <div>
        <button onClick={onLogin} data-testid="login-button">Login</button>
      </div>
    );
  };
});

jest.mock('./components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard Content</div>;
  };
});

jest.mock('./components/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile">Profile Content</div>;
  };
});

jest.mock('./components/Navbar', () => {
  return function MockNavbar({ isLoggedIn, onLogout, navigateTo, currentPage }) {
    return (
      <div>
        {isLoggedIn && <button onClick={onLogout} data-testid="logout-button">Logout</button>}
        <button onClick={() => navigateTo('dashboard')} data-testid="dashboard-link">Dashboard</button>
        <button onClick={() => navigateTo('profile')} data-testid="profile-link">Profile</button>
        <div>Current Page: {currentPage}</div>
      </div>
    );
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Login component when not logged in', async () => {
    const { findByTestId } = render(<App />);
    await waitFor(() => expect(findByTestId('login-button')).resolves.toBeDefined());
  });

  it('renders Dashboard and Navbar when logged in', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    const { findByTestId } = render(<App />);
    await waitFor(() => expect(findByTestId('dashboard')).resolves.toBeDefined());
    await waitFor(() => expect(findByTestId('logout-button')).resolves.toBeDefined()); // Assert that logout button is rendered when logged in
  });

  it('handles login correctly', async () => {
    const { findByTestId } = render(<App />);
    const loginButton = await findByTestId('login-button');
    fireEvent.click(loginButton);
    await waitFor(() => expect(findByTestId('dashboard')).resolves.toBeDefined());
    expect(localStorage.getItem('user')).toBeNull(); // User isn't actually stored in local storage; just logged in for testing.
  });

  it('handles logout correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    const { findByTestId, queryByTestId } = render(<App />);

    await waitFor(() => expect(findByTestId('dashboard')).resolves.toBeDefined());

    const logoutButton = await findByTestId('logout-button');
    fireEvent.click(logoutButton);
    await waitFor(() => expect(queryByTestId('dashboard')).toBeNull());
    await waitFor(() => expect(findByTestId('login-button')).resolves.toBeDefined());
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('navigates to the profile page', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    const { findByTestId, findByText } = render(<App />);

    await waitFor(() => expect(findByTestId('dashboard')).resolves.toBeDefined());

    const profileLink = await findByTestId('profile-link');
    fireEvent.click(profileLink);

    await waitFor(() => expect(findByTestId('profile')).resolves.toBeDefined());
    // Check that the Navbar shows the correct current page
    const currentPageDisplay = await findByText('Current Page: profile');
    expect(currentPageDisplay).toBeInTheDocument();
  });

   it('navigates to the dashboard page', async () => {
        localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
        const { findByTestId, findByText } = render(<App />);

        await waitFor(() => expect(findByTestId('dashboard')).resolves.toBeDefined());

        const dashboardLink = await findByTestId('dashboard-link');
        fireEvent.click(dashboardLink);

        await waitFor(() => expect(findByTestId('dashboard')).resolves.toBeDefined());

         // Check that the Navbar shows the correct current page
        const currentPageDisplay = await findByText('Current Page: dashboard');
        expect(currentPageDisplay).toBeInTheDocument();
    });
});

