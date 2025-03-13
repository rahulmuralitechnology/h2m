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

  it('renders the component', () => {
    render(<Login onLogin={onLogin} />);
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('4-Digit PIN:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates phone number input', () => {
    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  it('updates PIN inputs', () => {
    render(<Login onLogin={onLogin} />);
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

  it('displays error message when PIN is not 4 digits', async () => {
    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
        expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
    });
  });

  it('logs in existing user with correct PIN', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.compare.mockResolvedValue(true);
    localStorage.setItem(
      'users',
      JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
    );

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    const pinInputs = screen.getAllByRole('textbox');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', mockHashedPin);
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('displays error message with incorrect PIN', async () => {
      const mockHashedPin = 'hashedPin';
      bcrypt.compare.mockResolvedValue(false);
      localStorage.setItem(
        'users',
        JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
      );

      render(<Login onLogin={onLogin} />);
      const phoneInput = screen.getByLabelText('Phone Number:');
      const pinInputs = screen.getAllByRole('textbox');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      fireEvent.change(pinInputs[0], { target: { value: '1' } });
      fireEvent.change(pinInputs[1], { target: { value: '2' } });
      fireEvent.change(pinInputs[2], { target: { value: '3' } });
      fireEvent.change(pinInputs[3], { target: { value: '5' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
          expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
          expect(onLogin).not.toHaveBeenCalled();
      });
  });

  it('registers a new user if phone number does not exist', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.hash.mockResolvedValue(mockHashedPin);

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    const pinInputs = screen.getAllByRole('textbox');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(localStorage.getItem('users')).toEqual(
        JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
      );
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('handles only numeric input for phone and pin', () => {
      render(<Login onLogin={onLogin} />);
      const phoneInput = screen.getByLabelText('Phone Number:');
      const pinInputs = screen.getAllByRole('textbox');

      fireEvent.change(phoneInput, { target: { value: 'abc123def456' } });
      fireEvent.change(pinInputs[0], { target: { value: 'x' } });
      fireEvent.change(pinInputs[1], { target: { value: 'y2' } });

      expect(phoneInput.value).toBe('123456');
      expect(pinInputs[0].value).toBe('');
      expect(pinInputs[1].value).toBe('2');
  });

  it('calls onLogin after successful login/registration', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.hash.mockResolvedValue(mockHashedPin);

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    const pinInputs = screen.getAllByRole('textbox');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled();
    });

    expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
  });

  it('handles the case where localStorage is initially empty', async () => {
    const mockHashedPin = 'hashedPin';
    bcrypt.hash.mockResolvedValue(mockHashedPin);

    render(<Login onLogin={onLogin} />);
    const phoneInput = screen.getByLabelText('Phone Number:');
    const pinInputs = screen.getAllByRole('textbox');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(pinInputs[0], { target: { value: '1' } });
    fireEvent.change(pinInputs[1], { target: { value: '2' } });
    fireEvent.change(pinInputs[2], { target: { value: '3' } });
    fireEvent.change(pinInputs[3], { target: { value: '4' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('users')).toEqual(
        JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }])
      );
      expect(onLogin).toHaveBeenCalled();
    });
  });
});

