import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  // Mock functions for props
  const mockOnLogout = jest.fn();
  const mockNavigateTo = jest.fn();

  // Positive Cases
  it('renders the navbar when isLoggedIn is true', () => {
    render(
      <Navbar
        isLoggedIn={true}
        onLogout={mockOnLogout}
        navigateTo={mockNavigateTo}
        currentPage="dashboard"
      />
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('highlights the active page button', () => {
    render(
      <Navbar
        isLoggedIn={true}
        onLogout={mockOnLogout}
        navigateTo={mockNavigateTo}
        currentPage="profile"
      />
    );
    expect(screen.getByText('Profile').closest('button')).toHaveClass('active');
    expect(screen.getByText('Home').closest('button')).not.toHaveClass('active');

    render(
        <Navbar
          isLoggedIn={true}
          onLogout={mockOnLogout}
          navigateTo={mockNavigateTo}
          currentPage="dashboard"
        />
      );
      expect(screen.getByText('Home').closest('button')).toHaveClass('active');
      expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
  });

  it('calls navigateTo with correct page on button click', () => {
    render(
      <Navbar
        isLoggedIn={true}
        onLogout={mockOnLogout}
        navigateTo={mockNavigateTo}
        currentPage="dashboard"
      />
    );
    fireEvent.click(screen.getByText('Profile').closest('button'));
    expect(mockNavigateTo).toHaveBeenCalledWith('profile');

    fireEvent.click(screen.getByText('Home').closest('button'));
    expect(mockNavigateTo).toHaveBeenCalledWith('dashboard');
  });

  it('calls onLogout when the logout button is clicked', () => {
    render(
      <Navbar
        isLoggedIn={true}
        onLogout={mockOnLogout}
        navigateTo={mockNavigateTo}
        currentPage="dashboard"
      />
    );
    fireEvent.click(screen.getByText('Logout').closest('button'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  // Negative Cases
  it('does not render the navbar when isLoggedIn is false', () => {
    const { container } = render(
      <Navbar
        isLoggedIn={false}
        onLogout={mockOnLogout}
        navigateTo={mockNavigateTo}
        currentPage="dashboard"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // Edge Cases
  it('renders without crashing when currentPage is null', () => {
    const { container } = render(
      <Navbar
        isLoggedIn={true}
        onLogout={mockOnLogout}
        navigateTo={mockNavigateTo}
        currentPage={null}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(container.querySelector('.active')).toBeNull(); //No active class should be applied
  });

  it('renders without crashing when currentPage is an empty string', () => {
      const { container } = render(
        <Navbar
          isLoggedIn={true}
          onLogout={mockOnLogout}
          navigateTo={mockNavigateTo}
          currentPage=""
        />
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(container.querySelector('.active')).toBeNull(); //No active class should be applied
    });
});

