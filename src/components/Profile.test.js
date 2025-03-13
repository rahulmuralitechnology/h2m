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
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
  });

  afterEach(() => {
    window.alert.mockRestore(); // Restore alert
  });

  it('should render the component with initial values from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', name: 'Test User' }]));

    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('Test User');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('1234567890');
  });

  it('should update the name and phone number in localStorage on form submission', async () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', name: 'Test User' }]));

    render(<Profile />);

    const nameInput = screen.getByLabelText('Name:');
    const phoneInput = screen.getByLabelText('Phone Number:');
    const submitButton = screen.getByRole('button', { name: 'Update Profile' });

    fireEvent.change(nameInput, { target: { value: 'Updated User' } });
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('users')).toBe(JSON.stringify([{ phone: '1234567890', name: 'Updated User', phone: '0987654321' }]));
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ phone: '1234567890', name: 'Updated User', phone: '0987654321' }));
      expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');

      });

  });

  it('should handle the case where localStorage is empty initially', () => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('');
  });

  it('should handle the case where user is not found in the users array', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([{ phone: '0000000000', name: 'Other User' }]));

    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('1234567890'); // Phone is populated by user object

  });

  it('should only allow numeric input for the phone number', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', name: 'Test User' }]));
    render(<Profile />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: 'abc123xyz' } });

    expect(phoneInput).toHaveValue('123');
  });

  it('should limit the phone number input to 10 characters', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
     localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', name: 'Test User' }]));

    render(<Profile />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890123' } });

    expect(phoneInput).toHaveValue('1234567890');
  });

  it('should handle the case where name is null or undefined in the user object', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', name: null }]));

    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('');

    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', name: undefined }]));
    render(<Profile />);

     expect(screen.getByLabelText('Name:')).toHaveValue('');
  });

  it('should render the component even if "users" is not in local storage', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));

    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('1234567890'); // Phone is populated by user object
  });

  it('should use the phone number from localStorage user for form phone initial state when user exists in users', () => {
      localStorage.setItem('user', JSON.stringify({ phone: '0000000000' }));
      localStorage.setItem('users', JSON.stringify([{ phone: '1111111111', name: 'Other User' }, {phone:'0000000000', name:'Correct User'} ]));
      render(<Profile />);

      expect(screen.getByLabelText('Phone Number:')).toHaveValue('0000000000');
      expect(screen.getByLabelText('Name:')).toHaveValue('Correct User');
  });

  it('should use the phone number from localStorage user for form phone initial state when user does not exists in users', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '9999999999' }));
    localStorage.setItem('users', JSON.stringify([{ phone: '1111111111', name: 'Other User' }, {phone:'0000000000', name:'Correct User'} ]));
    render(<Profile />);

    expect(screen.getByLabelText('Phone Number:')).toHaveValue('9999999999');
    expect(screen.getByLabelText('Name:')).toHaveValue('');
  });
});

