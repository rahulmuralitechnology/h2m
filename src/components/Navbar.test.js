import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  const mockOnLogout = jest.fn();
  const mockNavigateTo = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render if isLoggedIn is false', () => {
    const { container } = render(<Navbar isLoggedIn={false} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render if isLoggedIn is true', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call navigateTo with "dashboard" when Home button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    fireEvent.click(screen.getByText('Home').closest('button'));
    expect(mockNavigateTo).toHaveBeenCalledWith('dashboard');
  });

  it('should call navigateTo with "profile" when Profile button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Profile').closest('button'));
    expect(mockNavigateTo).toHaveBeenCalledWith('profile');
  });

  it('should call onLogout when Logout button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Logout').closest('button'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('should apply active class to Home button when currentPage is "dashboard"', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).toHaveClass('active');
  });

  it('should not apply active class to Home button when currentPage is not "dashboard"', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).not.toHaveClass('active');
  });

  it('should apply active class to Profile button when currentPage is "profile"', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    const profileButton = screen.getByText('Profile').closest('button');
    expect(profileButton).toHaveClass('active');
  });

  it('should not apply active class to Profile button when currentPage is not "profile"', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    const profileButton = screen.getByText('Profile').closest('button');
    expect(profileButton).not.toHaveClass('active');
  });

  it('should handle no currentPage being passed', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} />);
    const homeButton = screen.getByText('Home').closest('button');
    const profileButton = screen.getByText('Profile').closest('button');

    expect(homeButton).not.toHaveClass('active');
    expect(profileButton).not.toHaveClass('active');
  });

  it('should handle empty string for currentPage', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="" />);
      const homeButton = screen.getByText('Home').closest('button');
      const profileButton = screen.getByText('Profile').closest('button');

      expect(homeButton).not.toHaveClass('active');
      expect(profileButton).not.toHaveClass('active');
  });

  it('should handle null value for currentPage', () => {
        render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage={null} />);
        const homeButton = screen.getByText('Home').closest('button');
        const profileButton = screen.getByText('Profile').closest('button');

        expect(homeButton).not.toHaveClass('active');
        expect(profileButton).not.toHaveClass('active');
    });
});

