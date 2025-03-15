import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('4-Digit PIN:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates phone number input field', () => {
    render(<Login onLogin={mockOnLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  it('updates PIN input fields', () => {
    render(<Login onLogin={mockOnLogin} />);
    const pinInputs = screen.getAllByRole('textbox');
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    expect(pinInputs[0].value).toBe('1');
    expect(pinInputs[1].value).toBe('2');
    expect(pinInputs[2].value).toBe('3');
    expect(pinInputs[3].value).toBe('4');
  });

  it('shows an error message when PIN is not 4 digits', async () => {
    render(<Login onLogin={mockOnLogin} />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    await waitFor(() => {
      expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
    });
  });

  it('successful login with existing user', async () => {
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', pin: 'hashedPin' }]));
    bcrypt.compare.mockResolvedValue(true);
    render(<Login onLogin={mockOnLogin} />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    const pinInputs = screen.getAllByRole('textbox');
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashedPin');
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('shows an error message with invalid PIN', async () => {
    localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', pin: 'hashedPin' }]));
    bcrypt.compare.mockResolvedValue(false);
    render(<Login onLogin={mockOnLogin} />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    const pinInputs = screen.getAllByRole('textbox');
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });

  it('registers a new user if not found', async () => {
    bcrypt.hash.mockResolvedValue('hashedPin');
    render(<Login onLogin={mockOnLogin} />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    const pinInputs = screen.getAllByRole('textbox');
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(localStorage.getItem('users')).toEqual(JSON.stringify([{ phone: '1234567890', pin: 'hashedPin' }]));
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('handles non-numeric characters in phone and PIN inputs', () => {
    render(<Login onLogin={mockOnLogin} />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '123-456-789a' } });
    expect(phoneInput.value).toBe('123456789');

    const pinInputs = screen.getAllByRole('textbox');
    fireEvent.change(pinInputs[0], { target: { value: 'a1' } });
    expect(pinInputs[0].value).toBe('1');
  });

  it('stores user information in local storage after successful login or registration', async () => {
    bcrypt.hash.mockResolvedValue('hashedPin');
    render(<Login onLogin={mockOnLogin} />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    const pinInputs = screen.getAllByRole('textbox');
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
    });
  });
});

