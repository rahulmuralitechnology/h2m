import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  // Positive Test Cases
  it('should render the navbar when isLoggedIn is true', () => {
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={() => {}} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call navigateTo with "dashboard" when the Home button is clicked', () => {
    const navigateTo = jest.fn();
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={navigateTo} currentPage="profile" />);
    fireEvent.click(screen.getByText('Home'));
    expect(navigateTo).toHaveBeenCalledWith('dashboard');
  });

  it('should call navigateTo with "profile" when the Profile button is clicked', () => {
    const navigateTo = jest.fn();
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={navigateTo} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Profile'));
    expect(navigateTo).toHaveBeenCalledWith('profile');
  });

  it('should call onLogout when the Logout button is clicked', () => {
    const onLogout = jest.fn();
    render(<Navbar isLoggedIn={true} onLogout={onLogout} navigateTo={() => {}} currentPage="dashboard" />);
    fireEvent.click(screen.getByText('Logout'));
    expect(onLogout).toHaveBeenCalled();
  });

  it('should apply the "active" class to the Home button when currentPage is "dashboard"', () => {
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={() => {}} currentPage="dashboard" />);
    expect(screen.getByText('Home').closest('button')).toHaveClass('active');
    expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
  });

  it('should apply the "active" class to the Profile button when currentPage is "profile"', () => {
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={() => {}} currentPage="profile" />);
    expect(screen.getByText('Profile').closest('button')).toHaveClass('active');
    expect(screen.getByText('Home').closest('button')).not.toHaveClass('active');
  });

  // Negative Test Cases
  it('should not render the navbar when isLoggedIn is false', () => {
    const { container } = render(<Navbar isLoggedIn={false} onLogout={() => {}} navigateTo={() => {}} currentPage="dashboard" />);
    expect(container.firstChild).toBeNull();
  });

  it('should not call navigateTo if the Home button is not clicked', () => {
      const navigateTo = jest.fn();
      render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={navigateTo} currentPage="profile" />);
      expect(navigateTo).not.toHaveBeenCalled();
  });

  it('should not call navigateTo if the Profile button is not clicked', () => {
      const navigateTo = jest.fn();
      render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={navigateTo} currentPage="dashboard" />);
      expect(navigateTo).not.toHaveBeenCalled();
  });

  it('should not call onLogout if the Logout button is not clicked', () => {
    const onLogout = jest.fn();
    render(<Navbar isLoggedIn={true} onLogout={onLogout} navigateTo={() => {}} currentPage="dashboard" />);
    expect(onLogout).not.toHaveBeenCalled();
  });

  // Edge Cases
  it('should render without errors when onLogout and navigateTo are undefined', () => {
    render(<Navbar isLoggedIn={true} currentPage="dashboard" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should not apply "active" class if currentPage is neither "dashboard" nor "profile"', () => {
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={() => {}} currentPage="settings" />);
    expect(screen.getByText('Home').closest('button')).not.toHaveClass('active');
    expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
  });

  it('should handle empty string for currentPage without errors', () => {
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={() => {}} currentPage="" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

   it('should handle null currentPage without errors', () => {
    render(<Navbar isLoggedIn={true} onLogout={() => {}} navigateTo={() => {}} currentPage={null} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});

