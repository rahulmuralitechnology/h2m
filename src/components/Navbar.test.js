import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  const mockNavigateTo = jest.fn();
  const mockOnLogout = jest.fn();

  // Positive Test Cases
  it('renders the navbar when isLoggedIn is true', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('sets the "active" class on the button corresponding to the currentPage', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    const profileButton = screen.getByText('Profile').closest('button'); // find parent button
    expect(profileButton).toHaveClass('active');
  });

  it('calls navigateTo with "dashboard" when the Home button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    fireEvent.click(screen.getByText('Home').closest('button'));
    expect(mockNavigateTo).toHaveBeenCalledWith('dashboard');
  });

  it('calls navigateTo with "profile" when the Profile button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Profile').closest('button'));
    expect(mockNavigateTo).toHaveBeenCalledWith('profile');
  });

  it('calls onLogout when the Logout button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Logout').closest('button'));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  // Negative Test Cases
  it('does not render the navbar when isLoggedIn is false', () => {
    const { container } = render(<Navbar isLoggedIn={false} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(container.firstChild).toBeNull();
  });

  it('does not have "active" class on any button when currentPage does not match', () => {
     render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="unknown" />);
     const homeButton = screen.getByText('Home').closest('button');
     const profileButton = screen.getByText('Profile').closest('button');
     expect(homeButton).not.toHaveClass('active');
     expect(profileButton).not.toHaveClass('active');
  });
  // Edge Cases
  it('renders without errors when currentPage is null', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage={null} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders without errors when currentPage is undefined', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders with empty string currentPage', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('handles a different currentPage and still renders the navigation', () => {
      render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="settings" />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
  });

});

