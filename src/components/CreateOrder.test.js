import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateOrder from './CreateOrder';

describe('CreateOrder Component', () => {
  const mockOnOrderCreated = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890', name: 'Test User' }));
    mockOnOrderCreated.mockClear();
  });

  it('should render the component correctly', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    expect(screen.getByLabelText("Recipient's Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Recipient's Phone:")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Order' })).toBeInTheDocument();
  });

  it('should call onOrderCreated with the correct order details when form is submitted (positive case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];
    expect(order.recipientName).toBe('John Doe');
    expect(order.recipientPhone).toBe('9876543210');
    expect(order.senderPhone).toBe('1234567890');
    expect(order.senderName).toBe('1234567890');
    expect(order.status).toBe('Preparing');
    expect(order.createdAt).toBeDefined();
  });

  it('should save the order to localStorage (positive case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '5551234567' } });
    fireEvent.click(createOrderButton);

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toBeDefined();
    expect(storedOrders.length).toBe(1);
    expect(storedOrders[0].recipientName).toBe('Jane Doe');
    expect(storedOrders[0].recipientPhone).toBe('5551234567');
  });

  it('should not call onOrderCreated if recipient name is empty (negative case - form validation)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientPhoneInput, { target: { value: '5551234567' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

  it('should not call onOrderCreated if recipient phone is empty (negative case - form validation)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'Jane Doe' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

  it('should handle existing orders in localStorage (edge case)', () => {
    const existingOrders = [{ recipientName: 'Old Order', recipientPhone: '1112223333' }];
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'New Order' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '4445556666' } });
    fireEvent.click(createOrderButton);

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toBeDefined();
    expect(storedOrders.length).toBe(2);
    expect(storedOrders[0].recipientName).toBe('Old Order');
    expect(storedOrders[1].recipientName).toBe('New Order');
  });

  it('should handle empty localStorage orders array (edge case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'New Order' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '4445556666' } });
    fireEvent.click(createOrderButton);

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toBeDefined();
    expect(storedOrders.length).toBe(1);
    expect(storedOrders[0].recipientName).toBe('New Order');
  });

  it('should handle no user object in local storage (edge case - might cause error)', () => {
    localStorage.removeItem('user');
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'New Order' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '4445556666' } });
    // Wrap the fireEvent.click in a try...catch block to handle the error.
    try {
        fireEvent.click(createOrderButton);
    } catch (error) {
        // Expect error to be thrown because localStorage.getItem('user') returns null
        // and you are trying to read properties from null.
    }

    const storedOrders = localStorage.getItem('orders');

    expect(storedOrders).toBeNull()
  });
});

