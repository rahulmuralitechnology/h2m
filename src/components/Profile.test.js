import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';

describe('Profile Component', () => {
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

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert function
  });

  afterEach(() => {
    window.alert.mockRestore(); // Restore alert function
  });

  it('should render the component', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should populate the form with existing user data from localStorage', () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '1234567890', name: 'John Doe' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('John Doe');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('should update the name and phone number in localStorage on form submission', async () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '1234567890', name: 'John Doe' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    const nameInput = screen.getByLabelText('Name:');
    const phoneInput = screen.getByLabelText('Phone Number:');
    const updateButton = screen.getByText('Update Profile');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(localStorage.getItem('users')).toBe(
        JSON.stringify([{ phone: '1234567890', name: 'Jane Doe', phone: '0987654321' }])
      );
      expect(localStorage.getItem('user')).toBe(
        JSON.stringify({ phone: '1234567890', name: 'Jane Doe', phone: '0987654321' })
      );
      expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('should handle empty name when user data is present in localStorage', () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '1234567890' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
  });

  it('should handle no existing user data in localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Phone Number:').value).toBe('');
  });

  it('should prevent non-numeric characters from being entered into the phone number field', () => {
        localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
        render(<Profile />);

        const phoneInput = screen.getByLabelText('Phone Number:');
        fireEvent.change(phoneInput, { target: { value: 'abc123def45' } });
        expect(phoneInput.value).toBe('12345');

        fireEvent.change(phoneInput, {target: {value: '123-456-7890'}});
        expect(phoneInput.value).toBe('1234567890')
    });

    it('should limit phone number input to 10 digits', () => {
      localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
      render(<Profile />);

      const phoneInput = screen.getByLabelText('Phone Number:');
      fireEvent.change(phoneInput, { target: { value: '1234567890123' } });
      expect(phoneInput.value).toBe('1234567890');
    });

    it('should not update localstorage if the user is not found in the "users" array', async () => {
        const mockUser = { phone: '1234567890' };
        const mockUsers = [{ phone: '0000000000', name: 'John Doe' }]; // Different phone number
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('users', JSON.stringify(mockUsers));

        render(<Profile />);

        const nameInput = screen.getByLabelText('Name:');
        const phoneInput = screen.getByLabelText('Phone Number:');
        const updateButton = screen.getByText('Update Profile');

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(phoneInput, { target: { value: '0987654321' } });
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(localStorage.getItem('users')).toBe(JSON.stringify(mockUsers)); // Should remain unchanged
            expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
        });
    });

    it('should handle if localStorage.getItem returns null', async () => {
      localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
      localStorage.removeItem('users');

      render(<Profile />);
      const nameInput = screen.getByLabelText('Name:');
      const phoneInput = screen.getByLabelText('Phone Number:');
      const updateButton = screen.getByText('Update Profile');

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(phoneInput, { target: { value: '0987654321' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
          expect(localStorage.getItem('users')).toBe(JSON.stringify([{phone: "1234567890", name: "Jane Doe", phone: "0987654321"}]));
          expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
      });
    });
});

