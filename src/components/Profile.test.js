import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};

  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = String(value);
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock the alert function
    global.alert = jest.fn();
  });

  afterEach(() => {
    global.alert.mockClear();
  });

  it('should render the profile form', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByText('Update Profile')).toBeInTheDocument();
  });

  it('should load user data from localStorage on mount', () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '1234567890', name: 'Test User' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('Test User');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('should update profile in localStorage on form submission', async () => {
    const mockUser = { phone: '1234567890', name: 'Old Name' };
    const mockUsers = [{ phone: '1234567890', name: 'Old Name' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '0987654321' } });
    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });

    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    const updatedUser = JSON.parse(localStorage.getItem('user'));

    expect(updatedUsers[0].name).toBe('New Name');
    expect(updatedUsers[0].phone).toBe('0987654321');
    expect(updatedUser.name).toBe('New Name');
    expect(updatedUser.phone).toBe('0987654321');
  });

  it('should handle empty name correctly during update', async () => {
    const mockUser = { phone: '1234567890', name: 'Old Name' };
    const mockUsers = [{ phone: '1234567890', name: 'Old Name' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '0987654321' } });
    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });

    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    const updatedUser = JSON.parse(localStorage.getItem('user'));

    expect(updatedUsers[0].name).toBe('');
    expect(updatedUsers[0].phone).toBe('0987654321');
     expect(updatedUser.name).toBe('');
    expect(updatedUser.phone).toBe('0987654321');
  });


  it('should handle missing user data in localStorage gracefully', () => {
    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Phone Number:').value).toBe('');
  });

  it('should handle missing users data in localStorage gracefully', () => {
    const mockUser = { phone: '1234567890' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('should not allow non-numeric characters in the phone number field', async () => {
    const mockUser = { phone: '1234567890' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '123-456-7890' } });
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');

    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: 'abc123def' } });
    expect(screen.getByLabelText('Phone Number:').value).toBe('123');
  });

  it('should limit the phone number to 10 digits', async () => {
      const mockUser = { phone: '1234567890' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      render(<Profile />);

      fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '123456789012' } });
      expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('should handle the case where the user phone number is not found in the users array', () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '0000000000', name: 'Different User' }]; // Different phone number
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });
});

