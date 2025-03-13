import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the component with initial values from localStorage', () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '1234567890', name: 'Test User' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('Test User');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('1234567890');
  });

  it('should update the name and phone number in the form', () => {
    const mockUser = { phone: '1234567890' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify([]));

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '0987654321' } });

    expect(screen.getByLabelText('Name:')).toHaveValue('New Name');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('0987654321');
  });

  it('should update the localStorage and display an alert on form submission', async () => {
    const mockUser = { phone: '1234567890' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify([]));

    const alertMock = jest.spyOn(window, 'alert');
    alertMock.mockImplementation(() => {});

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Updated Name' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '9998887777' } });
    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
        expect(localStorage.getItem('users')).toEqual(JSON.stringify([{name: 'Updated Name', phone: '9998887777'}]));
        expect(localStorage.getItem('user')).toEqual(JSON.stringify({phone: '1234567890', name: 'Updated Name', phone: '9998887777'}));
        expect(alertMock).toHaveBeenCalledWith('Profile updated successfully!');
    });

    alertMock.mockRestore();
  });

  it('should handle the case where localStorage is empty', () => {
    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('');
  });

  it('should handle the case where the user is not found in the users array', () => {
    const mockUser = { phone: '1234567890' };
    const mockUsers = [{ phone: '0000000000', name: 'Another User' }];
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number:')).toHaveValue('');
  });

    it('should update only the current user details', async () => {
        const mockUser = { phone: '1234567890' };
        const mockUsers = [{ phone: '1234567890', name: 'Test User' }, { phone: '0000000000', name: 'Another User' }];
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('users', JSON.stringify(mockUsers));

        const alertMock = jest.spyOn(window, 'alert');
        alertMock.mockImplementation(() => {});

        render(<Profile />);

        fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Updated Name' } });
        fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '9998887777' } });
        fireEvent.click(screen.getByText('Update Profile'));

        await waitFor(() => {
            const expectedUsers = [{ phone: '1234567890', name: 'Updated Name', phone: '9998887777' }, { phone: '0000000000', name: 'Another User' }];
            expect(localStorage.getItem('users')).toEqual(JSON.stringify(expectedUsers));
            expect(localStorage.getItem('user')).toEqual(JSON.stringify({phone: '1234567890', name: 'Updated Name', phone: '9998887777'}));
            expect(alertMock).toHaveBeenCalledWith('Profile updated successfully!');
        });

        alertMock.mockRestore();
    });

    it('should only allow numbers for the phone number input and limit to 10 digits', () => {
      const mockUser = { phone: '1234567890' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('users', JSON.stringify([]));

      render(<Profile />);

      const phoneInput = screen.getByLabelText('Phone Number:');
      fireEvent.change(phoneInput, { target: { value: 'abc123def456ghi789' } });
      expect(phoneInput).toHaveValue('123456789');

      fireEvent.change(phoneInput, { target: { value: '1234567890123' } });
      expect(phoneInput).toHaveValue('1234567890');
    });
});

