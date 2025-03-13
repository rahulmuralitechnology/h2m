import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  const mockNavigateTo = jest.fn();
  const mockOnLogout = jest.fn();

  // Positive Cases
  it('should render when isLoggedIn is true', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should call navigateTo with "dashboard" when Home button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    fireEvent.click(screen.getByText('Home'));
    expect(mockNavigateTo).toHaveBeenCalledWith('dashboard');
  });

  it('should call navigateTo with "profile" when Profile button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigateTo).toHaveBeenCalledWith('profile');
  });

  it('should call onLogout when Logout button is clicked', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('should apply "active" class to the Home button when currentPage is "dashboard"', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(screen.getByText('Home').closest('button')).toHaveClass('active');
  });

    it('should apply "active" class to the Profile button when currentPage is "profile"', () => {
      render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
      expect(screen.getByText('Profile').closest('button')).toHaveClass('active');
    });

  // Negative Cases
  it('should not render when isLoggedIn is false', () => {
    const { container } = render(<Navbar isLoggedIn={false} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(container.firstChild).toBeNull();
  });

  it('should not apply "active" class if the currentPage does not match the button', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="profile" />);
    expect(screen.getByText('Home').closest('button')).not.toHaveClass('active');
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
  });

  // Edge Cases
  it('should render without errors when onLogout and navigateTo are not provided (but isLoggedIn is true)', () => {
    render(<Navbar isLoggedIn={true} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should handle currentPage being an empty string', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="" />);
    expect(screen.getByText('Home').closest('button')).not.toHaveClass('active');
    expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
  });

  it('should render correctly with special characters in button labels', () => {
    render(<Navbar isLoggedIn={true} onLogout={mockOnLogout} navigateTo={mockNavigateTo} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});

