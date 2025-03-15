import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Login Component', () => {
  const onLogin = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    onLogin.mockClear();
    bcrypt.compare.mockClear();
    bcrypt.hash.mockClear();
  });

  it('renders the form with phone number and PIN inputs', () => {
    render(<Login onLogin={onLogin} />);
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('4-Digit PIN:')).toBeInTheDocument();
    const pinInputs = screen.getAllByRole('textbox', { name: '' }); //changed textbox
    expect(pinInputs.length).toBe(4);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates phone number state on input change', () => {
    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  it('updates PIN state on input change', () => {
    render(<Login onLogin={onLogin} />);
    const pinInputs = screen.getAllByRole('textbox', { name: '' });

    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    expect(pinInputs[0].value).toBe('1');
    expect(pinInputs[1].value).toBe('2');
    expect(pinInputs[2].value).toBe('3');
    expect(pinInputs[3].value).toBe('4');
  });

  it('displays an error message if PIN is not 4 digits', async () => {
    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    await waitFor(() => {
      expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
    });
  });

  it('logs in an existing user with correct PIN', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.compare.mockResolvedValue(true);
    localStorage.setItem(
      'users',
      JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
    );

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    const pinInputs = screen.getAllByRole('textbox', { name: '' });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', mockHashedPin);
      expect(onLogin).toHaveBeenCalled();
      expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
    });
  });

  it('displays an error message if the PIN is incorrect', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.compare.mockResolvedValue(false);
    localStorage.setItem(
      'users',
      JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
    );

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    const pinInputs = screen.getAllByRole('textbox', { name: '' });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', mockHashedPin);
      expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
      expect(onLogin).not.toHaveBeenCalled();
    });
  });

  it('creates a new user if phone number does not exist', async () => {
    bcrypt.hash.mockResolvedValue('hashedPin');

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    const pinInputs = screen.getAllByRole('textbox', { name: '' });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      const users = JSON.parse(localStorage.getItem('users'));
      expect(users).toHaveLength(1);
      expect(users[0].phone).toBe('1234567890');
      expect(users[0].pin).toBe('hashedPin');
      expect(onLogin).toHaveBeenCalled();
      expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
    });
  });

  it('handles non-numeric input in phone number field', () => {
    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: 'abc123def456' } });
    expect(phoneInput.value).toBe('123456');
  });

  it('handles non-numeric input in PIN fields', () => {
    render(<Login onLogin={onLogin} />);
    const pinInputs = screen.getAllByRole('textbox', { name: '' });
    fireEvent.change(pinInputs[0], { target: { value: 'a' } });
    expect(pinInputs[0].value).toBe('');

    fireEvent.change(pinInputs[1], { target: { value: '1a' } });
    expect(pinInputs[1].value).toBe('1');
  });

  it('Login with empty phone and pin should show error on Pin', async () => {
    render(<Login onLogin={onLogin} />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
    });

  });

  it('Logs in with valid phone and pin after failing with wrong pin', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.compare.mockResolvedValue(false);
    localStorage.setItem(
      'users',
      JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
    );

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    const pinInputs = screen.getAllByRole('textbox', { name: '' });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '5' } }); //wrong pin

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('1235', mockHashedPin);
      expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
    });

    bcrypt.compare.mockResolvedValue(true);

    fireEvent.change(pinInputs[3], { target: { value: '4' } });

    const loginButtonSecondAttempt = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButtonSecondAttempt);

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', mockHashedPin);
      expect(onLogin).toHaveBeenCalled();
      expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
    });
  });
});

