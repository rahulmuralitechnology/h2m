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
        bcrypt.compare.mockReset();
        bcrypt.hash.mockReset();
    });

    it('renders the component', () => {
        render(<Login onLogin={onLogin} />);
        expect(screen.getByText('Phone Number:')).toBeInTheDocument();
        expect(screen.getByText('4-Digit PIN:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('updates phone number state correctly', () => {
        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByRole('textbox', { name: 'Phone Number:' });
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        expect(phoneInput.value).toBe('1234567890');

        fireEvent.change(phoneInput, { target: { value: 'abc123def' } }); // Check if non-numeric values are filtered
        expect(phoneInput.value).toBe('123');
    });

    it('updates pin state correctly', () => {
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

        fireEvent.change(pinInputs[0], { target: { value: 'a1' } });
        expect(pinInputs[0].value).toBe('1');
    });

    it('displays an error message when the PIN is not 4 digits', async () => {
        render(<Login onLogin={onLogin} />);
        const loginButton = screen.getByRole('button', { name: 'Login' });
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
        });
    });

    it('handles successful login with existing user', async () => {
        localStorage.setItem(
            'users',
            JSON.stringify([{ phone: '1234567890', pin: 'hashedPin' }])
        );
        bcrypt.compare.mockResolvedValue(true);

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByRole('textbox', { name: 'Phone Number:' });
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });

        const pinInputs = screen.getAllByRole('textbox', { name: '' });
        fireEvent.change(pinInputs[0], { target: { value: '1' } });
        fireEvent.change(pinInputs[1], { target: { value: '2' } });
        fireEvent.change(pinInputs[2], { target: { value: '3' } });
        fireEvent.change(pinInputs[3], { target: { value: '4' } });

        const loginButton = screen.getByRole('button', { name: 'Login' });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashedPin');
            expect(onLogin).toHaveBeenCalled();
            expect(localStorage.getItem('user')).toBe(JSON.stringify({ phone: '1234567890' }));
        });
    });

    it('handles login failure with invalid PIN', async () => {
        localStorage.setItem(
            'users',
            JSON.stringify([{ phone: '1234567890', pin: 'hashedPin' }])
        );
        bcrypt.compare.mockResolvedValue(false);

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByRole('textbox', { name: 'Phone Number:' });
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });

        const pinInputs = screen.getAllByRole('textbox', { name: '' });
        fireEvent.change(pinInputs[0], { target: { value: '1' } });
        fireEvent.change(pinInputs[1], { target: { value: '2' } });
        fireEvent.change(pinInputs[2], { target: { value: '3' } });
        fireEvent.change(pinInputs[3], { target: { value: '4' } });

        const loginButton = screen.getByRole('button', { name: 'Login' });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashedPin');
            expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
            expect(onLogin).not.toHaveBeenCalled();
        });
    });

    it('handles new user registration', async () => {
        bcrypt.hash.mockResolvedValue('newHashedPin');

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByRole('textbox', { name: 'Phone Number:' });
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
            expect(users).toEqual([{ phone: '1234567890', pin: 'newHashedPin' }]);
            expect(onLogin).toHaveBeenCalled();
            expect(localStorage.getItem('user')).toBe(JSON.stringify({ phone: '1234567890' }));
        });
    });

    it('handles empty localStorage', async () => {
        bcrypt.hash.mockResolvedValue('newHashedPin');

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByRole('textbox', { name: 'Phone Number:' });
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
            expect(onLogin).toHaveBeenCalled();
        });
    });

    it('verifies onLogin is not called when there is an error', async () => {
        render(<Login onLogin={onLogin} />);
        const loginButton = screen.getByRole('button', { name: 'Login' });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
            expect(onLogin).not.toHaveBeenCalled();
        });

        const phoneInput = screen.getByRole('textbox', { name: 'Phone Number:' });
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });

        const pinInputs = screen.getAllByRole('textbox', { name: '' });
        fireEvent.change(pinInputs[0], { target: { value: '1' } });
        fireEvent.change(pinInputs[1], { target: { value: '2' } });
        fireEvent.change(pinInputs[2], { target: { value: '3' } });
        fireEvent.change(pinInputs[3], { target: { value: '4' } });

        bcrypt.compare.mockResolvedValue(false);
        localStorage.setItem(
            'users',
            JSON.stringify([{ phone: '1234567890', pin: 'hashedPin' }])
        );

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
            expect(onLogin).not.toHaveBeenCalled();
        });
    });

});

