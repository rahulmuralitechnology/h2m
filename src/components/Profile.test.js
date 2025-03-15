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

  const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    localStorage.clear();
    mockAlert.mockClear();
  });

  it('renders the profile form', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByText('Update Profile')).toBeInTheDocument();
  });

  it('loads user data from localStorage on mount', () => {
    const mockUsers = [
      { name: 'Test User', phone: '1234567890' },
    ];
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify(mockUsers));

    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('Test User');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('updates user data in localStorage on form submission', async () => {
    const initialUser = { phone: '1234567890' };
    const initialUsers = [{ name: 'Old Name', phone: '1234567890' }];

    localStorage.setItem('user', JSON.stringify(initialUser));
    localStorage.setItem('users', JSON.stringify(initialUsers));

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '0987654321' } });
    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Profile updated successfully!');
    });

    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    const updatedUser = JSON.parse(localStorage.getItem('user'));

    expect(updatedUsers[0].name).toBe('New Name');
    expect(updatedUsers[0].phone).toBe('0987654321');
    expect(updatedUser.name).toBe('New Name');
    expect(updatedUser.phone).toBe('0987654321');
  });

  it('shows an alert on successful profile update', async () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([]));

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('handles the case when users array is empty in localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    localStorage.setItem('users', JSON.stringify([]));

    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('handles the case when users key is not present in localStorage', () => {
     localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);

    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Phone Number:').value).toBe('1234567890');
  });

  it('phone number input only accepts numbers', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: 'abc123xyz' } });
    expect(phoneInput.value).toBe('123');
  });

  it('phone number input has a max length of 10', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);

    const phoneInput = screen.getByLabelText('Phone Number:');
    fireEvent.change(phoneInput, { target: { value: '123456789012345' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  it('requires name input', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Update Profile'));
     expect(mockAlert).not.toHaveBeenCalled();

  });

   it('requires phone input', () => {
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
    render(<Profile />);
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Update Profile'));
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('updates only name when phone number matches and other details are same',async ()=>{
    const initialUser = { name: 'Initial Name', phone: '1234567890' };
    const initialUsers = [{ name: 'Initial Name', phone: '1234567890' }];

    localStorage.setItem('user', JSON.stringify(initialUser));
    localStorage.setItem('users', JSON.stringify(initialUsers));

    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Name' } });


    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Profile updated successfully!');
    });

    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    const updatedUser = JSON.parse(localStorage.getItem('user'));

    expect(updatedUsers[0].name).toBe('New Name');
    expect(updatedUsers[0].phone).toBe('1234567890');
    expect(updatedUser.name).toBe('New Name');
    expect(updatedUser.phone).toBe('1234567890');
  });
});

