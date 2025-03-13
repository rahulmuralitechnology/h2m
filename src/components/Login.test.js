import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

describe('Login Component', () => {
    const onLogin = jest.fn();
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => {
                store[key] = value.toString();
            },
            clear: () => {
                store = {};
            },
            removeItem: (key) => {
                delete store[key];
            },
        };
    })();

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });
    });

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

    it('updates PIN input fields', () => {
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

    it('displays an error message when PIN is incomplete', async () => {
        render(<Login onLogin={onLogin} />);
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));
        await waitFor(() => {
            expect(screen.getByText('Please enter a 4-digit PIN.')).toBeInTheDocument();
        });
    });

    it('calls onLogin when user exists and PIN matches (positive case)', async () => {
        const mockHashedPin = 'hashed_pin';
        bcrypt.compare.mockResolvedValue(true);
        localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }]));

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByLabelText('Phone Number:');
        const pinInputs = screen.getAllByRole('textbox');

        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        fireEvent.change(pinInputs[0], { target: { value: '1' } });
        fireEvent.change(pinInputs[1], { target: { value: '2' } });
        fireEvent.change(pinInputs[2], { target: { value: '3' } });
        fireEvent.change(pinInputs[3], { target: { value: '4' } });

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(bcrypt.compare).toHaveBeenCalledWith('1234', mockHashedPin);
            expect(onLogin).toHaveBeenCalled();
            expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
        });
    });

    it('displays an error message when PIN does not match (negative case)', async () => {
        const mockHashedPin = 'hashed_pin';
        bcrypt.compare.mockResolvedValue(false);
        localStorage.setItem('users', JSON.stringify([{ phone: '1234567890', pin: mockHashedPin }]));

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByLabelText('Phone Number:');
        const pinInputs = screen.getAllByRole('textbox');

        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        fireEvent.change(pinInputs[0], { target: { value: '1' } });
        fireEvent.change(pinInputs[1], { target: { value: '2' } });
        fireEvent.change(pinInputs[2], { target: { value: '3' } });
        fireEvent.change(pinInputs[3], { target: { value: '4' } });

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(bcrypt.compare).toHaveBeenCalledWith('1234', mockHashedPin);
            expect(screen.getByText('Invalid PIN.')).toBeInTheDocument();
            expect(onLogin).not.toHaveBeenCalled();
        });
    });

    it('creates a new user and calls onLogin when user does not exist', async () => {
        const mockHashedPin = 'hashed_pin';
        bcrypt.hash.mockResolvedValue(mockHashedPin);

        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByLabelText('Phone Number:');
        const pinInputs = screen.getAllByRole('textbox');

        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        fireEvent.change(pinInputs[0], { target: { value: '1' } });
        fireEvent.change(pinInputs[1], { target: { value: '2' } });
        fireEvent.change(pinInputs[2], { target: { value: '3' } });
        fireEvent.change(pinInputs[3], { target: { value: '4' } });

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
            expect(onLogin).toHaveBeenCalled();
            const users = JSON.parse(localStorage.getItem('users'));
            expect(users).toHaveLength(1);
            expect(users[0].phone).toBe('1234567890');
            expect(users[0].pin).toBe(mockHashedPin);
            expect(localStorage.getItem('user')).toEqual(JSON.stringify({ phone: '1234567890' }));
        });
    });

    it('handles non-numeric input in PIN fields', () => {
        render(<Login onLogin={onLogin} />);
        const pinInputs = screen.getAllByRole('textbox');
        fireEvent.change(pinInputs[0], { target: { value: 'a' } });
        expect(pinInputs[0].value).toBe('');

        fireEvent.change(pinInputs[1], { target: { value: '!' } });
        expect(pinInputs[1].value).toBe('');

    });

    it('handles non-numeric input in phone number field', () => {
        render(<Login onLogin={onLogin} />);
        const phoneInput = screen.getByLabelText('Phone Number:');
        fireEvent.change(phoneInput, { target: { value: 'abcdefghij' } });
        expect(phoneInput.value).toBe('');
    });
});

