import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateOrder from './CreateOrder';

describe('CreateOrder Component', () => {
  const mockOnOrderCreated = jest.fn();
  const mockUser = { phone: '1234567890', name: 'Test User' };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(mockUser));
    mockOnOrderCreated.mockClear();
  });

  it('renders the form with input fields and a submit button', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    expect(screen.getByLabelText("Recipient's Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Recipient's Phone:")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Order' })).toBeInTheDocument();
  });

  it('updates recipientName state when the recipient name input changes', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    fireEvent.change(recipientNameInput, { target: { value: 'New Recipient Name' } });
    expect(recipientNameInput.value).toBe('New Recipient Name');
  });

  it('updates recipientPhone state when the recipient phone input changes', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    expect(recipientPhoneInput.value).toBe('9876543210');
  });

  it('calls onOrderCreated with the correct order details and saves to localStorage on form submission (positive case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'Recipient Name' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(submitButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];
    expect(order.senderPhone).toBe(mockUser.phone);
    expect(order.senderName).toBe(mockUser.phone);
    expect(order.recipientName).toBe('Recipient Name');
    expect(order.recipientPhone).toBe('9876543210');
    expect(order.status).toBe('Preparing');
    expect(order.createdAt).toBeDefined();

    const savedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(savedOrders).toHaveLength(1);
    expect(savedOrders[0]).toEqual(order);
  });

  it('saves multiple orders to localStorage (positive case with existing orders)', () => {
    const initialOrders = [{ recipientName: 'Old Recipient', recipientPhone: '1111111111', senderPhone: '1234567890', senderName: '1234567890', status: 'Preparing', createdAt: new Date().toISOString() }];
    localStorage.setItem('orders', JSON.stringify(initialOrders));
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'New Recipient' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '2222222222' } });
    fireEvent.click(submitButton);

    const savedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(savedOrders).toHaveLength(2);
    expect(savedOrders[0]).toEqual(initialOrders[0]); // Verify existing order remains
    expect(savedOrders[1].recipientName).toBe('New Recipient'); // Verify new order is added
  });

  it('does not call onOrderCreated if recipient name is empty (negative case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(submitButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

  it('does not call onOrderCreated if recipient phone is empty (negative case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'Recipient Name' } });
    fireEvent.click(submitButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

   it('handles empty initial localStorage orders gracefully (edge case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'Recipient Name' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(submitButton);

    const savedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(savedOrders).toHaveLength(1);
  });

   it('handles localStorage being unavailable (edge case - mocks localStorage to simulate unavailable)', () => {
     const originalLocalStorage = global.localStorage;
     global.localStorage = undefined; // Simulate localStorage being unavailable
     const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
     render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
     const recipientNameInput = screen.getByLabelText("Recipient's Name:");
     const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
     const submitButton = screen.getByRole('button', { name: 'Create Order' });

      fireEvent.change(recipientNameInput, { target: { value: 'Recipient Name' } });
      fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
      fireEvent.click(submitButton);
      expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();

      global.localStorage = originalLocalStorage;
      consoleSpy.mockRestore();
    });

    it('handles user data missing from localStorage (edge case)', () => {
        localStorage.removeItem('user');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
        const recipientNameInput = screen.getByLabelText("Recipient's Name:");
        const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
        const submitButton = screen.getByRole('button', { name: 'Create Order' });

        fireEvent.change(recipientNameInput, { target: { value: 'Recipient Name' } });
        fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
        fireEvent.click(submitButton);
        expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});

