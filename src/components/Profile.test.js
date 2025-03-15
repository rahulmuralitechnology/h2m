import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';

describe('Profile Component', () => {
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
      }
    };
  })();

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    const initialUser = { phone: '1234567890' };
    localStorage.setItem('user', JSON.stringify(initialUser));
  });

  afterAll(() => {
    window.alert.mockRestore();
  });

  it('should render the profile form', () => {
    render(<Profile />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Profile' })).toBeInTheDocument();
  });

  it('should load user data from localStorage on mount', () => {
    const users = [{ phone: '1234567890', name: 'John Doe' }];
    localStorage.setItem('users', JSON.stringify(users));

    render(<Profile />);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
  });

  it('should update name and phone number in the input fields', () => {
    render(<Profile />);
    const nameInput = screen.getByLabelText('Name:');
    const phoneInput = screen.getByLabelText('Phone Number:');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });

    expect(nameInput.value).toBe('Jane Doe');
    expect(phoneInput.value).toBe('0987654321');
  });

  it('should update user data in localStorage on form submission', async () => {
    render(<Profile />);
    const nameInput = screen.getByLabelText('Name:');
    const phoneInput = screen.getByLabelText('Phone Number:');
    const updateButton = screen.getByRole('button', { name: 'Update Profile' });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });

    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    expect(updatedUsers[0].name).toBe('Jane Doe');
    expect(updatedUsers[0].phone).toBe('0987654321');

    const updatedUser = JSON.parse(localStorage.getItem('user'));
    expect(updatedUser.name).toBe('Jane Doe');
    expect(updatedUser.phone).toBe('0987654321');
  });

  it('should handle phone number input to only allow numbers and max length', () => {
    render(<Profile />);
    const phoneInput = screen.getByLabelText('Phone Number:');

    fireEvent.change(phoneInput, { target: { value: 'abc123def456' } });
    expect(phoneInput.value).toBe('123456');

    fireEvent.change(phoneInput, { target: { value: '1234567890123' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  it('should not update localStorage if users array is empty', async () => {
    localStorage.setItem('users', JSON.stringify([]));

    render(<Profile />);
    const nameInput = screen.getByLabelText('Name:');
    const phoneInput = screen.getByLabelText('Phone Number:');
    const updateButton = screen.getByRole('button', { name: 'Update Profile' });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });
    const user = JSON.parse(localStorage.getItem('user'));
    expect(user.name).toBe("Jane Doe");
    expect(user.phone).toBe("0987654321");

    const users = JSON.parse(localStorage.getItem('users'));

    expect(users).toEqual([]);
  });

  it('should handle the case when the user is not found in localStorage', () => {
    localStorage.setItem('users', JSON.stringify([{ phone: '9999999999', name: 'Different User' }]));
    render(<Profile />);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
  });

  it('should handle empty name from localStorage', () => {
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890' }]));

    render(<Profile />);

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
  });
});

